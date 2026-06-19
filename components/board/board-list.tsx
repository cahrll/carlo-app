"use client"

import {
  createContext,
  Suspense,
  use,
  useContext,
  useOptimistic,
  startTransition,
  useState,
  useEffect,
} from "react"
import { Board, Organization } from "@/lib/types"
import Link from "next/link"
import { timeAgo, slugify } from "@/lib/utils"
import { createClient } from "@/lib/client"
import { computeBoardProgress, newerTime } from "@/lib/board-ui"
import { Content, PageHeader } from "@/components/ui/page"
import { PmEmpty } from "@/components/ui/pm-empty"
import { Btn } from "@/components/ui/pm"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Kbd } from "@/components/ui/kbd"
import { IconBoard, IconPlus } from "@/components/ui/icons"
import CreateBoardDialog from "./create-board-dialog"
import BoardsListLoader from "./board-list-loader"

type BoardsResponse = { error: boolean; message?: string; data?: Board[] }

type BoardContextType = {
  optimisticBoards: Board[]
  organization: Organization
  onBoardCreated: (board: Board) => void
}

const BoardContext = createContext<BoardContextType | null>(null)

function useBoardContext() {
  const context = useContext(BoardContext)
  if (!context)
    throw new Error("useBoardContext must be used within BoardProvider")
  return context
}

const rowGrid =
  "grid grid-cols-[1.6fr_.8fr_1fr_.9fr_90px] gap-[14px] items-center px-[18px] max-nav:grid-cols-[1fr_90px] max-nav:px-[14px]"

function BoardListContent() {
  const { optimisticBoards, organization, onBoardCreated } = useBoardContext()
  const slug = slugify(organization.name)

  return (
    <>
      <PageHeader
        title="Boards"
        sub={`${optimisticBoards.length} boards · ${slug}`}
        actions={<CreateBoardDialog organization={organization} onBoardCreated={onBoardCreated} />}
      />

      {optimisticBoards.length === 0 ? (
        <PmEmpty
          icon={<IconBoard />}
          title="No boards yet"
          description="A board is where your team plans work in sections. Create the first one and Carlo seeds it with To Do, In Progress, Testing, and Done."
          actions={
            <CreateBoardDialog
              organization={organization}
              onBoardCreated={onBoardCreated}
              trigger={
                <Btn>
                  <IconPlus />
                  New board
                </Btn>
              }
            />
          }
          hint={
            <span>
              or press <Kbd>B</Kbd> to create a board
            </span>
          }
        />
      ) : (
        <div className="border-t border-line">
          <div
            className={`${rowGrid} py-[10px] bg-bg2 font-mono text-[10px] tracking-[0.1em] uppercase text-faint border-b border-line max-nav:hidden`}
          >
            <div>Board</div>
            <div>Tasks</div>
            <div>Progress</div>
            <div>Members</div>
            <div className="text-right">Updated</div>
          </div>
          {optimisticBoards.map((board) => {
            const total = board.task_count ?? 0
            const done = board.done_count ?? 0
            const pct = total ? Math.round((done / total) * 100) : 0
            return (
              <Link
                key={board.id}
                href={`/organization/${organization.id}/board/${board.id}`}
                className={`${rowGrid} py-[14px] border-b border-line hover:bg-bg2 transition-colors`}
              >
                <div className="flex items-center gap-[11px] min-w-0">
                  <span className="grid place-items-center size-[30px] rounded-[7px] bg-bg3 border border-line text-acc shrink-0 [&_svg]:size-[15px]">
                    <IconBoard />
                  </span>
                  <span className="font-semibold min-w-0 truncate">
                    {board.title}
                    <span className="block font-mono text-[11px] text-faint font-normal truncate">
                      {slugify(board.title)}
                    </span>
                  </span>
                </div>
                <div className="font-mono text-[12px] text-muted-foreground max-nav:hidden">
                  {total}
                </div>
                <div className="max-nav:hidden flex items-center gap-2">
                  <div className="h-[5px] w-[64px] shrink-0 rounded-full bg-bg3 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-acc"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-mono text-[12px] text-muted-foreground">
                    {done}/{total}
                  </span>
                </div>
                <div className="max-nav:hidden">
                  <UserAvatar
                    name={board.creator_name}
                    hueKey={board.creator_id}
                    size={22}
                    title={board.creator_name ?? undefined}
                  />
                </div>
                <div className="font-mono text-[12px] text-faint text-right">
                  {timeAgo(board.updated_at ?? board.created_at)}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}

function BoardListWithData({
  boardsPromise,
  organization,
}: {
  boardsPromise: Promise<BoardsResponse>
  organization: Organization
}) {
  const { data: serverBoards } = use(boardsPromise)
  const [boards, setBoards] = useState<Board[]>(serverBoards || [])

  useEffect(() => {
    setBoards(serverBoards ?? [])
  }, [serverBoards])

  const [optimisticBoards, addOptimisticBoard] = useOptimistic(
    boards,
    (state, newBoard: Board) =>
      state.some((b) => b.id === newBoard.id) ? state : [newBoard, ...state]
  )

  useEffect(() => {
    const supabase = createClient()

    const fetchBoards = async () => {
      const { data, error } = await supabase
        .from("board")
        .select("*, user_profile:creator_id(name), section(title, task(updated_at))")
        .eq("org_id", organization.id)
        .order("created_at", { ascending: false })

      if (error || !data) return
      setBoards(
        data.map((b) => {
          const { total, done, lastActivity } = computeBoardProgress(
            (b as { section?: Parameters<typeof computeBoardProgress>[0] })
              .section
          )
          return {
            ...b,
            creator_name: (b.user_profile as { name: string | null } | null)
              ?.name,
            task_count: total,
            done_count: done,
            updated_at: newerTime(b.updated_at, lastActivity),
            user_profile: undefined,
            section: undefined,
          }
        })
      )
    }

    // debounce: any task change can shift counts/activity
    let debounce: ReturnType<typeof setTimeout> | null = null
    const scheduleFetch = () => {
      if (debounce) clearTimeout(debounce)
      debounce = setTimeout(fetchBoards, 200)
    }

    const channel = supabase
      .channel(`boards:${organization.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "board",
          filter: `org_id=eq.${organization.id}`,
        },
        () => fetchBoards()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "task" },
        () => scheduleFetch()
      )
      .subscribe()

    return () => {
      if (debounce) clearTimeout(debounce)
      channel.unsubscribe()
    }
  }, [organization.id])

  function onBoardCreated(board: Board) {
    startTransition(() => addOptimisticBoard(board))
  }

  return (
    <BoardContext.Provider
      value={{ optimisticBoards, organization, onBoardCreated }}
    >
      <BoardListContent />
    </BoardContext.Provider>
  )
}

const BoardList = ({
  organization,
  boardsPromise,
}: {
  organization: Organization
  boardsPromise: Promise<BoardsResponse>
}) => {
  return (
    <Content>
      <Suspense fallback={<BoardsListLoader />}>
        <BoardListWithData
          boardsPromise={boardsPromise}
          organization={organization}
        />
      </Suspense>
    </Content>
  )
}

export default BoardList
