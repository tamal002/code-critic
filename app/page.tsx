import { Button } from "@/components/ui/button";
import {requireAuth} from "@/app/module/auth/utils/auth-utils";
// import LogoutButton from "@/app/module/auth/components/logoutButton";
import {redirect} from "next/navigation";

export default async function Home() {
  await requireAuth();
  return redirect('/dashboard');
}
