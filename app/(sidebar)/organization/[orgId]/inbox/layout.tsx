import ConversationList from '@/components/inbox/conversation-list'
import { getChatRooms } from '@/lib/services/queries/chat'
import { getMembers } from '@/lib/services/queries/member'
import React from 'react'

const InboxLayout = async ({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ orgId: string }>
}) => {
    const { orgId } = await params

    const [roomsResult, membersResult] = await Promise.all([
        getChatRooms(orgId),
        getMembers(orgId),
    ])

    return (
        <div className="flex flex-1 min-h-0 overflow-hidden">
            <ConversationList
                rooms={roomsResult.data ?? []}
                members={membersResult.data ?? []}
            />
            {children}
        </div>
    )
}

export default InboxLayout
