"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import Image from "next/image";

const LoginUI = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle GitHub login
  const handleGithubLogin = async () => {
    setIsLoading(true);
    try {
      await signIn.social({
        provider: "github",
      });
    } catch (error) {
      console.error("Error during GitHub sign-in:", error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background radial glow matching the orange lion logo theme */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-600/10 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="w-full max-w-md z-10">
        {/* Logo and Header Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-40 h-40 rounded-3xl overflow-hidden border border-zinc-800/80 bg-zinc-950/80 shadow-2xl flex items-center justify-center mb-6">
            <Image
              src="/cc_logo_v2.png"
              alt="CodeCritic Logo"
              width={160}
              height={160}
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-2">Welcome Back</h2>
          <p className="text-zinc-400 text-center">Login to your CodeCritic account</p>
        </div>

        {/* Login Card */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
          {/* GitHub Login Button */}
          <div className="mb-6">
            <Button
              onClick={handleGithubLogin}
              disabled={isLoading}
              className="w-full bg-white text-black hover:bg-zinc-200 font-semibold py-6 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg cursor-pointer"
            >
              <Github size={20} />
              {isLoading ? "Signing in..." : "Continue with GitHub"}
            </Button>
          </div>

          {/* Sign Up Section */}
          <div className="text-center text-sm">
            <p className="text-zinc-400">
              New to CodeCritic?{" "}
              <a
                href="/signup"
                className="text-white font-semibold hover:underline transition-colors"
              >
                Sign Up
              </a>
            </p>
          </div>
        </div>

        {/* Self-Hosted Services */}
        <div className="mt-8 text-center">
          <a
            href="#self-hosted"
            className="text-sm text-zinc-500 hover:text-zinc-300 font-semibold transition-colors"
          >
            Self-Hosted Services
          </a>
        </div>

        {/* Footer Links */}
        <div className="mt-12 flex items-center justify-center gap-6 text-xs text-zinc-600">
          <a href="/terms" className="hover:text-zinc-400 transition-colors">
            Terms of Use
          </a>
          <span>and</span>
          <a href="/privacy" className="hover:text-zinc-400 transition-colors">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginUI;
