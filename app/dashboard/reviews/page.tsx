"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ExternalLink, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getReviews } from "@/app/module/review/actions/index";
import { formatDistanceToNow } from "date-fns";

type ReviewItem = {
  id: string;
  prNumber: number;
  prTitle: string;
  prUrl: string;
  review: string;
  status: string;
  createdAt: string | Date;
  repository: {
    name: string;
    owner: string;
    fullName: string;
    url: string;
  };
};

const getStatusConfig = (status?: string) => {
  const normalized = (status || "").toLowerCase();
  if (normalized === "completed") {
    return {
      label: "Completed",
      variant: "secondary" as const,
      icon: CheckCircle2,
      className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    };
  }
  if (normalized === "failed") {
    return {
      label: "Failed",
      variant: "destructive" as const,
      icon: XCircle,
      className: "",
    };
  }
  return {
    label: status ? status.replace(/_/g, " ") : "Pending",
    variant: "outline" as const,
    icon: Clock,
    className: "text-amber-400 border-amber-500/40",
  };
};

const ReviewsPage = () => {
  const {
    data: reviews,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["reviews"],
    queryFn: getReviews,
    refetchOnWindowFocus: false,
  });

  const items = (reviews || []) as ReviewItem[];

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Review History
          </h1>
          <p className="text-muted-foreground">View all AI code reviews</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-10">
        {isLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={`review-skeleton-${i}`} className="bg-card">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-6 w-72" />
                      </div>
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-32" />
                    <div className="rounded-lg border bg-muted/40 p-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6 mt-2" />
                      <Skeleton className="h-4 w-2/3 mt-2" />
                    </div>
                    <Skeleton className="h-9 w-56" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="border-destructive/40">
            <CardContent className="pt-6">
              <p className="text-destructive">
                Failed to load reviews. Please try again.
              </p>
            </CardContent>
          </Card>
        ) : items.length === 0 ? (
          <Empty className="bg-card">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Clock className="h-5 w-5" />
              </EmptyMedia>
              <EmptyTitle>No reviews yet</EmptyTitle>
              <EmptyDescription>
                Your AI code reviews will appear here once generated.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" asChild>
                <a href="/dashboard/repository">Connect a repository</a>
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="space-y-4">
            {items.map((review) => {
              const statusConfig = getStatusConfig(review.status);
              const StatusIcon = statusConfig.icon;
              const repoLabel =
                review.repository?.fullName ||
                `${review.repository?.owner}/${review.repository?.name}`;
              const createdAt = review.createdAt
                ? formatDistanceToNow(new Date(review.createdAt), {
                    addSuffix: true,
                  })
                : "";

              return (
                <Card
                  key={review.id}
                  className="bg-card hover:bg-accent/40 transition-colors"
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">
                              {repoLabel}
                            </span>
                            <span>•</span>
                            <span>PR #{review.prNumber}</span>
                          </div>
                          <h3 className="mt-2 text-lg md:text-xl font-semibold truncate">
                            {review.prTitle || `PR #${review.prNumber}`}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant={statusConfig.variant}
                            className={statusConfig.className}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {statusConfig.label}
                          </Badge>

                          {review.prUrl && (
                            <Button variant="ghost" size="icon" asChild>
                              <a
                                href={review.prUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Open pull request"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>

                      {createdAt && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{createdAt}</span>
                        </div>
                      )}

                      <div className="rounded-lg border bg-muted/40 p-4">
                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap line-clamp-6">
                          {review.review}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        {review.prUrl ? (
                          <Button variant="outline" asChild>
                            <a
                              href={review.prUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="gap-2"
                            >
                              View Full Review on GitHub
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            No PR link available
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;
