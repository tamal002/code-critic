import { Suspense } from "react";
import LoginUI from "@/app/module/auth/components/login-ui"
import { requireUnAuth } from "@/app/module/auth/utils/auth-utils"

async function AuthGate() {
  await requireUnAuth();
  return <LoginUI />;
}

const page = () => {
  return (
    <Suspense fallback={null}>
      <AuthGate />
    </Suspense>
  )
}

export default page
