"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { connectRepository } from "../actions/index";
import {toast} from "sonner";

// Hook to connect a repository
export const useConnectRepository = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({owner, repo, githubId}: {owner: string, repo: string, githubId: bigint}) => connectRepository(owner, repo, githubId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['repositories']});
            toast.success("Repository connected successfully");
        },
        onError: (error) => {
            toast.error("Failed to connect repository");
            console.error("Error at use-connect-repository.ts", error);
        }
    })
}