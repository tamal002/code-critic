"use client";

import { ActivityCalendar } from "react-activity-calendar";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getContributionStats } from "../actions";

export default function ContributionGraph() {
  const { theme } = useTheme();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["contribution-graph"],
    queryFn: getContributionStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const palette = {
    light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
    dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
  };

  const currentTheme = theme === "dark" ? palette.dark : palette.light;
  const contributions: Array<any> = Array.isArray(data?.contributions)
    ? data.contributions
    : [];
  const total = data?.totalContributions ?? 0;

  return (
    <Card className="border-border/80">
      {/* <CardHeader className="pb-2">
        <CardTitle>Contribution Graph</CardTitle>
        <CardDescription>GitHub activity over the last year</CardDescription>
      </CardHeader> */}
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-45 w-full" />
        ) : isError ? (
          <div className="text-sm text-muted-foreground">
            Failed to load contributions.
          </div>
        ) : contributions.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No contributions found.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Total contributions:{" "}
              <span className="font-medium text-foreground">
                {total.toLocaleString()}
              </span>
            </div>
            
            <div className="ml-10">
                <ActivityCalendar
              data={contributions}
              theme={{ light: palette.light, dark: palette.dark }}
              blockSize={11}
              blockMargin={3}
              fontSize={12}
              labels={{
                totalCount: `Total contributions in ${new Date().getFullYear()}`,
                legend: { less: "Less", more: "More" },
              }}
            />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
