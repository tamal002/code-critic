import LoginUI from "@/app/module/auth/components/login-ui"
import { requireUnAuth } from "@/app/module/auth/utils/auth-utils"


const page = async () => {

  await requireUnAuth();

  return (
    <div>
      <LoginUI />
    </div>
  )
}

export default page
