import { EmptyState } from "@/components/common/empty-state"
import { IconInbox } from "@/components/common/icons"

const InboxPage = () => {
  return (
    <section className="hidden nav:flex flex-1">
      <EmptyState
        className="w-full"
        icon={<IconInbox />}
        title="Your messages"
        description="Pick a conversation from the list to start chatting with your team."
      />
    </section>
  )
}

export default InboxPage
