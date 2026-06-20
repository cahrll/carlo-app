import ProfileForm from "@/components/profile/profile-form"
import { getCurrentUser } from "@/lib/services/queries/current-user"
import { getProfile } from "@/lib/services/queries/profile"
import { notFound, redirect } from "next/navigation"

const ProfilePage = async () => {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await getProfile(user.id)
  if (!profile) notFound()

  return <ProfileForm profile={profile} email={user.email || ""} />
}

export default ProfilePage
