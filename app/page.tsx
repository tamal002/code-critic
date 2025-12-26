import { Button } from "@/components/ui/button";
import {requireAuth} from "@/app/module/auth/utils/auth-utils";
import LogoutButton from "@/app/module/auth/components/logoutButton";

export default async function Home() {
  await requireAuth();
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <LogoutButton />
    </div>
  );
}
