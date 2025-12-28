"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  GitCommit,
  GitPullRequest,
  MessageSquare,
  GitBranch,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  getDashboardStats,
  getMonthlyActivity,
} from "@/app/module/dashboard/actions/index";
import ContributionGraph from "@/app/module/dashboard/components/contribution-graph";

const MainPage = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    refetchOnWindowFocus: false,
  });

  const { data: monthlyActivity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ["monthly-activity"],
    queryFn: getMonthlyActivity,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your coding activity and AI reviews
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Total Repositories",
            value: stats?.totalRepos ?? 0,
            helper: "Connected repositories",
            Icon: GitBranch,
          },
          {
            title: "Total Commits",
            value: stats?.totalCommits ?? 0,
            helper: "In the last year",
            Icon: GitCommit,
          },
          {
            title: "Pull Requests",
            value: stats?.totalPRs ?? 0,
            helper: "All time",
            Icon: GitPullRequest,
          },
          {
            title: "AI Reviews",
            value: stats?.totalReviews ?? 0,
            helper: "Generated reviews",
            Icon: MessageSquare,
          },
        ].map((item, idx) => (
          <Card
            key={`${item.title}-${idx}`}
            className="border-border/80 bg-muted/40 shadow-sm"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {item.title}
                </CardTitle>
                <div className="text-3xl font-semibold mt-1">
                  {isLoading ? "--" : item.value.toLocaleString()}
                </div>
              </div>
              <div className="rounded-full bg-muted p-3 text-muted-foreground">
                <item.Icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              {item.helper}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/80">
        <CardHeader className="pb-2">
          <CardTitle>Activity (last 6 months)</CardTitle>
          <CardDescription>
            Commits, PRs, and AI reviews by month
          </CardDescription>
        </CardHeader>
        <ContributionGraph />
      </Card>

      {/* Activity overview column graph */}
      <Card className="border-border/80 text-amber-50">
        <CardHeader className="pb-2">
          <CardTitle>Activity Overview</CardTitle>
          <CardDescription>
            Monthly breakdown of commits, PRs, and reviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {isLoadingActivity ? (
              <div className="h-full w-full animate-pulse rounded-lg bg-muted/50" />
            ) : monthlyActivity && monthlyActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyActivity}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      borderColor: "hsl(var(--border))",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ color: "hsl(var(--muted-foreground))" }}
                  />
                  <Bar
                    dataKey="commits"
                    name="Commits"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="prs"
                    name="PRs"
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="reviews"
                    name="AI Reviews"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No activity data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MainPage;
