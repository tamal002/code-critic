"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Sparkles, Zap, ShieldCheck, Heart } from "lucide-react";

export default function SubscriptionPage() {
  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        {/* Banner Card */}
        <div className="relative overflow-hidden rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-primary/5" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="h-3.5 w-3.5 mr-1" /> Free Public Beta
                </Badge>
                <Badge variant="outline" className="gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  All Features Unlocked
                </Badge>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  Subscription & Billing
                </h1>
                <p className="max-w-xl text-sm md:text-base text-muted-foreground">
                  CodeCritic is currently 100% free while in active beta. All features, unlimited repositories, and automated AI pull request reviews are completely unlocked.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Overview Card */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-emerald-500/20 bg-card shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" /> Free Tier Active
                </CardTitle>
                <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 font-medium">
                  $0 / month
                </Badge>
              </div>
              <CardDescription>
                Enjoy full access to CodeCritic AI without limits during our public preview.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  "Unlimited connected repositories",
                  "Automated AI Pull Request code reviews",
                  "Google Gemini AI powered analysis",
                  "Inngest event-driven review pipelines",
                  "Full dashboard analytics & commit metrics",
                  "Community & GitHub support",
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-500" /> Pro Tiers Coming Soon
              </CardTitle>
              <CardDescription>
                Future plans will offer dedicated team workspaces, custom prompt rules, and enterprise integrations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                We are constantly improving CodeCritic. Once premium tiers are introduced, early users will be notified in advance.
              </p>
              <div className="rounded-xl border bg-muted/40 p-4 text-xs">
                💡 <strong>Note:</strong> Your existing repository configurations and automated AI reviews will remain active without interruption.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/*
===================================================================
POLAR SUBSCRIPTION & CHECKOUT CODE PRESERVED BELOW FOR FUTURE USE
===================================================================

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  Crown,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSubscriptionData } from "@/app/module/payment/actions";
import { checkout, customer } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const PLAN_FEATURES = {
  free: [
    { name: "Up to 3 repositories", included: true },
    { name: "Up to 5 reviews per repository", included: true },
    { name: "Basic code reviews", included: true },
    { name: "Community support", included: true },
    { name: "Advanced analytics", included: false },
    { name: "Priority support", included: false },
  ],
  pro: [
    { name: "Unlimited repositories", included: true },
    { name: "Unlimited reviews", included: true },
    { name: "Advanced code reviews", included: true },
    { name: "Email support", included: true },
    { name: "Advanced analytics", included: true },
    { name: "Priority support", included: true },
  ],
} as const;

// ... [rest of Polar implementation preserved]
*/
