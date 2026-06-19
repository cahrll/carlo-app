import { Skeleton } from "../ui/skeleton"

const Col = () => (
  <div className="flex-[0_0_256px] bg-bg2 border border-line rounded-lg p-[11px] flex flex-col gap-2">
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-[68px] w-full rounded-md" />
    <Skeleton className="h-[68px] w-full rounded-md" />
  </div>
)

const SectionGridLoader = () => {
  return (
    <div className="flex gap-[13px] p-[16px_18px] flex-1 min-h-0 overflow-x-auto items-start">
      <Col />
      <Col />
      <Col />
      <Col />
    </div>
  )
}

export default SectionGridLoader
