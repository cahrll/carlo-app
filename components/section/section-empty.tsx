"use client"

import z from "zod"
import { createSectionSchema } from "@/lib/schemas/section"
import { EmptyState } from "@/components/common/empty-state"
import { Btn } from "@/components/common/ui-elements"
import { IconBoard, IconPlus } from "@/components/common/icons"
import CreateSectionForm from "./create-section-form"
import { Kbd } from "@/components/common/kbd"

interface SectionEmptyProps {
  boardId: string
  creatorId: string
  sortOrder: number
  onCreate: (data: z.infer<typeof createSectionSchema>) => void
  isPending?: boolean
}

const SectionEmpty = ({
  boardId,
  creatorId,
  sortOrder,
  onCreate,
  isPending,
}: SectionEmptyProps) => {
  return (
    <EmptyState
      icon={<IconBoard />}
      title="No sections yet"
      description="A board organizes work in sections. Add your first section and start dropping in tasks."
      actions={
        <CreateSectionForm
          boardId={boardId}
          creatorId={creatorId}
          sortOrder={sortOrder}
          onSubmit={onCreate}
          isPending={isPending}
          trigger={
            <Btn>
              <IconPlus />
              New section
            </Btn>
          }
        />
      }
      hint={
        <span>
          or press <Kbd>C</Kbd> to add one
        </span>
      }
    />
  )
}

export default SectionEmpty
