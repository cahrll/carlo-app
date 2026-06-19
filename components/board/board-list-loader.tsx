import { Skeleton } from "../ui/skeleton"

const BoardsListLoader = () => {
  return (
    <div>
      <div className="flex items-end gap-[14px] px-[22px] pt-5 pb-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="border-t border-line">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-[11px] px-[18px] py-[14px] border-b border-line"
          >
            <Skeleton className="size-[30px] rounded-[7px]" />
            <div className="flex flex-col gap-[6px]">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-2.5 w-20" />
            </div>
            <Skeleton className="h-3 w-16 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default BoardsListLoader
