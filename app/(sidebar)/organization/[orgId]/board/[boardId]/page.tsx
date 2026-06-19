import SectionGrid from "@/components/section/section-grid";
import { getBoardById } from "@/lib/services/queries/board";
import { getSections } from "@/lib/services/queries/section";
import { getViewerRole, getMembers } from "@/lib/services/queries/member";
import { Member } from "@/lib/types";

const BoardPage = async ({
    params
}: {
    params: Promise<{ orgId: string; boardId: string }>
}) => {
    const { orgId, boardId } = await params

    const [board, sections, role, members] = await Promise.all([
        getBoardById(boardId),
        getSections(boardId),
        getViewerRole(orgId),
        getMembers(orgId)
    ])

    return (
        <SectionGrid
            board={board.data}
            sections={sections.data ?? []}
            role={role}
            members={(members.data as Member[] | undefined) ?? []}
        />
    )
}

export default BoardPage
