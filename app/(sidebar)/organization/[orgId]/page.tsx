import BoardList from "@/components/board/board-list"
import { getBoards } from "@/lib/services/queries/board"
import { getOrganizationById } from "@/lib/services/queries/organization"
import { getViewerRole } from "@/lib/services/queries/member"
import { canModify } from "@/lib/services/authz"
import { notFound } from "next/navigation"

const organizationPage = async ({
    params
}: {
    params: Promise<{
        orgId: string
    }>
}) => {
    const {orgId} = await params

    const { error, data: organization } = await getOrganizationById(orgId)
    if (error || !organization) {
        notFound()
    }
    const role = await getViewerRole(orgId)
    const boardsPromise = getBoards(orgId)

    return (
        <div className='min-h-full max-w-full flex flex-col items-stretch'>
            <BoardList
                organization={organization}
                boardsPromise={boardsPromise}
                canCreate={canModify(role)}
            />
        </div>
    )
}

export default organizationPage