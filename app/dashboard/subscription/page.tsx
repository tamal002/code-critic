"use client";

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

const PLAN_PRICING = {
  monthly: "$0",
  proMonthly: "$19.99",
};

export default function SubscriptionPage() {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["subscription-data"],
    queryFn: getSubscriptionData,
    refetchOnWindowFocus: true,
  });

  const user = data?.user;
  const tier = (data?.limits?.tier ?? user?.subscriptionTier ?? "free") as
    | "free"
    | "pro";
  const isPro = tier === "pro";
  const repositoryUsage = data?.limits?.repositories;
  const currentRepos = repositoryUsage?.current ?? 0;
  const repoLimit = repositoryUsage?.limit ?? null;
  const repoUsagePercent = repoLimit
    ? Math.min(100, Math.round((currentRepos / repoLimit) * 100))
    : 100;

  const statusBadge = useMemo(() => {
    if (!user) {
      return {
        label: "Not signed in",
        className: "border-border bg-muted text-muted-foreground",
      };
    }

    if (isPro) {
      return {
        label: "Pro active",
        className:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      };
    }

    return {
      label: "Free plan",
      className: "border-border bg-muted text-muted-foreground",
    };
  }, [isPro, user]);

  useEffect(() => {
    if (success === "true") {
      toast.success("Subscription updated successfully.");
      void refetch();
    }
  }, [refetch, success]);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      await checkout({
        successUrl: `${window.location.origin}/dashboard/subscription?success=true`,
        returnUrl: `${window.location.origin}/dashboard/subscription`,
      } as never);
    } catch (error) {
      console.error(error);
      toast.error("Unable to start checkout right now.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      await customer.portal({ redirect: true } as never);
    } catch (error) {
      console.error(error);
      toast.error("Unable to open the billing portal.");
    } finally {
      setPortalLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncLoading(true);
    try {
      await refetch();
      toast.success("Subscription status refreshed.");
    } finally {
      setSyncLoading(false);
    }
  };

  const currentPlanFeatures = PLAN_FEATURES[tier];

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
          <Card className="border-border/80 bg-card shadow-sm">
            <CardContent className="p-6 md:p-8">
              <div className="animate-pulse space-y-6">
                <div className="space-y-3">
                  <div className="h-6 w-40 rounded-full bg-muted" />
                  <div className="h-9 w-72 rounded-lg bg-muted" />
                  <div className="h-4 w-full max-w-2xl rounded bg-muted" />
                  <div className="h-4 w-2/3 rounded bg-muted" />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={`subscription-skeleton-${index}`}
                      className="h-24 rounded-xl border bg-muted/50"
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        <div className="relative overflow-hidden rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
          <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={statusBadge.className}>
                  {statusBadge.label}
                </Badge>
                <Badge variant="outline" className="gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure billing via Polar
                </Badge>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  Subscription
                </h1>
                <p className="max-w-xl text-sm md:text-base text-muted-foreground">
                  Compare your current limits, see what is included in each
                  plan, and manage billing from one place.
                </p>
              </div>
              {user ? (
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>{user.email}</span>
                  <span className="hidden sm:inline text-border">•</span>
                  <span>{user.name}</span>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={handleSync}
                disabled={syncLoading}
              >
                {syncLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Sync status
              </Button>
              <Button
                variant="outline"
                onClick={handlePortal}
                disabled={portalLoading}
              >
                {portalLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
                Manage billing
              </Button>
              <Button
                onClick={handleCheckout}
                disabled={checkoutLoading || isPro}
              >
                {checkoutLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </div>

        {error ? (
          <Alert className="border-destructive/40">
            <X className="h-4 w-4" />
            <AlertTitle>Unable to load subscription data</AlertTitle>
            <AlertDescription>
              Please try again. Your billing settings and usage limits could not
              be fetched.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-border/80 bg-card shadow-sm lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle>Current plan</CardTitle>
              <CardDescription>
                Your usage and access level at a glance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border bg-muted/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Tier
                  </p>
                  <p className="mt-2 text-2xl font-semibold capitalize">
                    {tier}
                  </p>
                </div>
                <div className="rounded-xl border bg-muted/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Repositories
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {currentRepos}
                    <span className="text-base text-muted-foreground">
                      {repoLimit ? ` / ${repoLimit}` : " / Unlimited"}
                    </span>
                  </p>
                </div>
                <div className="rounded-xl border bg-muted/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Reviews
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {isPro ? "Unlimited" : "Limited"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Repository usage
                  </span>
                  <span className="font-medium">
                    {repoLimit ? `${repoUsagePercent}%` : "Unlimited"}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      isPro ? "bg-emerald-500" : "bg-primary",
                    )}
                    style={{ width: `${repoUsagePercent}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle>Plan summary</CardTitle>
              <CardDescription>
                What your current subscription includes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentPlanFeatures.map((feature) => (
                <div
                  key={feature.name}
                  className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3"
                >
                  <div
                    className={cn(
                      "mt-0.5 flex h-5 w-5 items-center justify-center rounded-full",
                      feature.included
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {feature.included ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-none">
                      {feature.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {feature.included
                        ? "Included in your current plan"
                        : "Only available on Pro"}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card
            className={cn(
              "border-border/80 shadow-sm",
              isPro && "border-emerald-500/30",
            )}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Free</CardTitle>
                  <CardDescription>
                    Best for trying the app with a few repositories
                  </CardDescription>
                </div>
                <Badge variant="outline">{PLAN_PRICING.monthly} / month</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {PLAN_FEATURES.free.map((feature) => (
                  <div
                    key={feature.name}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full",
                        feature.included
                          ? "bg-emerald-500/15 text-emerald-500"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {feature.included ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <span
                      className={
                        feature.included
                          ? "text-foreground"
                          : "text-muted-foreground line-through"
                      }
                    >
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full" disabled>
                Current access
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm ring-1 ring-primary/10">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    Pro
                  </CardTitle>
                  <CardDescription>
                    Unlimited repositories, reviews, and advanced analysis
                  </CardDescription>
                </div>
                <Badge className="border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  {PLAN_PRICING.proMonthly} / month
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {PLAN_FEATURES.pro.map((feature) => (
                  <div
                    key={feature.name}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span>{feature.name}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                Upgrade to Pro when you want fewer limits and more detailed code
                review coverage across the team.
              </div>
              <Button
                className="w-full"
                onClick={handleCheckout}
                disabled={checkoutLoading || isPro}
              >
                {checkoutLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isPro ? "Already on Pro" : "Upgrade now"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
