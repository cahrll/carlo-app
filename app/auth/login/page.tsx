import LoginForm from "@/components/auth/login-form"
import { getCurrentUser } from "@/lib/services/queries/current-user"
import { redirect } from "next/navigation"

const LoginPage = async () => {
  const user = await getCurrentUser()
  if (user) redirect("/")
  return <LoginForm />
}

export default LoginPage
