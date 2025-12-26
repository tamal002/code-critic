"use client";

import { useState } from "react";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

const LogoutButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Error during sign-out:", error);
    } finally {
      setIsLoading(false);
      router.push("/login");
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      variant="outline"
      className="flex items-center gap-2"
    >
      <LogOut size={16} />
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
};

export default LogoutButton;
