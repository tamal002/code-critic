"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Star, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useRef } from "react";
import { useRepository } from "@/app/module/repository/hooks/use-repository";
import {useConnectRepository} from "@/app/module/repository/hooks/use-connect-repository";

// Define the Repository interface
interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  isConnected?: boolean;
}

const RepositoryPage = () => {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRepository();

  // Hook to connect repository
  const {mutate: connectRepo} = useConnectRepository();

  const [localConnectingId, setLocalConnectingId] = useState<number | null>(
    null
  );

  const [searchQuery, setSearchQuery] = useState<string>("");

  // Flatten the paginated data
  const allRepositories: Repository[] =
    data?.pages.flatMap((page) => page) || [];

  // Filter repositories based on search query
  const filteredRepositories: Repository[] = allRepositories.filter(
    (repo: Repository) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle connect repository action
  const handleConnect = (repo: Repository) => {
    setLocalConnectingId(repo.id);
    connectRepo({
      owner: repo.full_name.split("/")[0],
      repo: repo.name,
      githubId: BigInt(repo.id),
    },
  {
      onSettled: () => {
        setLocalConnectingId(null);
      }
  });
  };

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="w-full">
      {/* Page header aligned with sidebar theming */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Repositories
          </h1>
          <p className="text-muted-foreground">
            Manage and view all your GitHub repositories
          </p>
        </div>

        {/* Search */}
        <div className="relative mt-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search repositories..."
            className="pl-9 h-11"
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-10">
        {isLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-card">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <Skeleton className="h-9 w-28 rounded-md" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <Card className="border-destructive/40">
            <CardContent className="pt-6">
              <p className="text-destructive">
                Failed to load repositories. Please try again.
              </p>
            </CardContent>
          </Card>
        ) : filteredRepositories.length === 0 ? (
          <Card className="bg-card">
            <CardContent className="py-16 text-center">
              <Search className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No repositories match your search"
                  : "No repositories yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRepositories.map((repo) => (
              <Card
                key={repo.id}
                className="bg-card hover:bg-accent/40 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* Left */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-amber-500 mb-2">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium">
                          {repo.stargazers_count}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-3 mb-2 flex-wrap">
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg md:text-xl font-semibold hover:text-primary transition-colors flex items-center gap-2"
                        >
                          {repo.name}
                          <ExternalLink className="h-4 w-4 opacity-70" />
                        </a>
                        {repo.language && (
                          <Badge
                            variant="secondary"
                            className="px-2 py-0.5 text-xs"
                          >
                            {repo.language}
                          </Badge>
                        )}
                      </div>

                      {repo.description && (
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                          {repo.description}
                        </p>
                      )}

                      {repo.topics && repo.topics.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {repo.topics.slice(0, 3).map((topic) => (
                            <Badge
                              key={topic}
                              variant="outline"
                              className="text-xs"
                            >
                              {topic}
                            </Badge>
                          ))}
                          {repo.topics.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{repo.topics.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right */}
                    <Button
                      onClick={() => handleConnect(repo)} 
                      disabled={localConnectingId === repo.id || repo.isConnected}
                      className={`md:self-center cursor-pointer ${
                        repo.isConnected ? "bg-green-500 text-white cursor-default" : ""
                      }`}
                    >
                      {
                        repo.isConnected ? "Connected" : localConnectingId === repo.id
                        ? "Connecting..."
                        : "Connect"
                      }
                      {}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Infinite scroll observer */}
            <div ref={observerTarget} className="flex justify-center py-8">
              {isFetchingNextPage && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-6 h-6 rounded-full border-2 border-border border-t-primary animate-spin" />
                  <p>Loading more repositories...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepositoryPage;
