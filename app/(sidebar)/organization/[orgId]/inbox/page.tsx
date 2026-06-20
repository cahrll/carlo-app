import { PmEmpty } from "@/components/common/pm-empty"
import { IconInbox } from "@/components/common/icons"

const InboxPage = () => {
  return (
    <section className="hidden nav:flex flex-1">
      <PmEmpty
        className="w-full"
        icon={<IconInbox />}
        title="Your messages"
        description="Pick a conversation from the list to start chatting with your team."
      />
    </section>
  )
}

export default InboxPage
