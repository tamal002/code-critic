"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

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
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-12 h-12 bg-black border-2 border-white rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-white">CC</span>
          </div>
        </div>

        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-xl font-semibold mb-2">CodeCritic</h1>
          <h2 className="text-4xl font-bold mb-4">Welcome Back</h2>
          <p className="text-gray-400">Login using the following providers:</p>
        </div>

        {/* GitHub Login Button */}
        <div className="mb-8">
          <Button
            onClick={handleGithubLogin}
            disabled={isLoading}
            className="w-full bg-white text-black hover:bg-gray-200 font-semibold py-6 rounded-lg flex items-center justify-center gap-3 transition-colors"
          >
            <Github size={20} />
            {isLoading ? "Signing in..." : "Continue with GitHub"}
          </Button>
        </div>

        {/* Sign Up Section */}
        <div className="mb-8 text-center">
          <p className="text-gray-400">
            New to CodeCritic?{" "}
            <a
              href="/signup"
              className="text-white font-semibold hover:underline transition-colors"
            >
              Sign Up
            </a>
          </p>
        </div>

        {/* Self-Hosted Services */}
        <div className="mb-8 text-center border-t border-gray-800 pt-8">
          <a
            href="#self-hosted"
            className="text-gray-400 hover:text-white font-semibold transition-colors"
          >
            Self-Hosted Services
          </a>
        </div>

        {/* Footer Links */}
        <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
          <a href="/terms" className="hover:text-gray-300 transition-colors">
            Terms of Use
          </a>
          <span>and</span>
          <a href="/privacy" className="hover:text-gray-300 transition-colors">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginUI;
