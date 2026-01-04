"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  getConnectedRepositories,
  disconnectRepository,
  disconnectAllRepositories,
} from "../actions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ExternalLink, Trash2, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const ConnectedRepositoryList = () => {
  // Query client for react-query
  const queryClient = useQueryClient();

  // State for disconnect all repositories dialog
  const [disconnectAllRepoButtonOpen, setDisconnectAllRepoButtonOpen] =
    useState(false);

  // Fetch connected repositories
  const { data: connectedRepositories, isLoading } = useQuery({
    queryKey: ["connected-repositories"],
    queryFn: getConnectedRepositories,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Mutation to disconnect a single repository
  const { mutate: disconnectRepo } = useMutation({
    mutationFn: async (repositoryId: string) => {
      return await disconnectRepository(repositoryId);
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Repository disconnected successfully");
        queryClient.invalidateQueries({ queryKey: ["connected-repositories"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      } else {
        toast.error(`Error disconnecting repository: ${data.error}`);
      }
    },
    onError: (error: any) => {
      toast.error(`Error disconnecting repository: ${error.message}`);
    },
  });

  // Mutation to disconnect all repositories
  const { mutate: disconnectAllRepos } = useMutation({
    mutationFn: async () => {
      return await disconnectAllRepositories();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("All repositories disconnected successfully");
        queryClient.invalidateQueries({ queryKey: ["connected-repositories"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        setDisconnectAllRepoButtonOpen(false);
      } else {
        toast.error(`Error disconnecting all repositories: ${data.error}`);
      }
    },
    onError: (error: any) => {
      toast.error(`Error disconnecting all repositories: ${error.message}`);
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connected Repositories</CardTitle>
          <CardDescription>
            Loading your connected repositories...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="animate-spin text-muted-foreground" />
            <span>Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Connected Repositories</CardTitle>
            <CardDescription>
              Manage your connected GitHub repositories
            </CardDescription>
          </div>
          {connectedRepositories && connectedRepositories.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setDisconnectAllRepoButtonOpen(true)}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Disconnect All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!connectedRepositories || connectedRepositories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No repositories connected yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {connectedRepositories.map((repo: any) => (
              <div
                key={repo.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline flex items-center gap-2"
                  >
                    {repo.name}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => disconnectRepo(repo.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Disconnect All Confirmation Dialog */}
      <AlertDialog
        open={disconnectAllRepoButtonOpen}
        onOpenChange={setDisconnectAllRepoButtonOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect All Repositories?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will disconnect all your connected repositories. You
              can reconnect them later from the Repository page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => disconnectAllRepos()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Disconnect All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ConnectedRepositoryList;
