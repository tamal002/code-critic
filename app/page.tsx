import { Suspense } from "react";
import { requireAuth } from "@/app/module/auth/utils/auth-utils";
import { redirect } from "next/navigation";

async function AuthGate() {
  await requireAuth();
  redirect("/dashboard");
  return null;
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <AuthGate />
    </Suspense>
  );
}
