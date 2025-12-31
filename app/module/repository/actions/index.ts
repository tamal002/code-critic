"use server";

import prisma from "@/lib/db";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import { getRespositories } from "../../github/lib/github";
import { createWebhook } from "../../github/lib/github";


// Fetch repositories with connection status
export const fetchRespositories = async (page:number = 1, perPage:number = 10) => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("unauthenticated");
    }

    // Fetch repositories from GitHub API
    const githubRepos = await getRespositories(page, perPage);

    // Fetch repositories from local database
    const dbRepos = await prisma.repository.findMany(
        {
            where: {
                userId: session.user.id
            }
        }
    );

    // Mark repositories as connected or not
    const connectedRepoIds = new Set(dbRepos.map(repo => repo.githubId));

    // Combine data
    return githubRepos.map((repo:any) => {
        return {
            ...repo,
            isConnected: connectedRepoIds.has(BigInt(repo.id))
        }
    });

}


// Connect a repository
export const connectRepository = async (owner: string, repo: string, githubId: bigint) => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("unauthenticated");
    }

    // TODO: check if user can connect more repositories

    // Create webhook on GitHub
    const webhook = await createWebhook(owner, repo);
    // Store repository in local database
    if(webhook){
        await prisma.repository.create({
            data: {
                githubId: BigInt(githubId),
                name: repo,
                owner: owner,
                fullName: `${owner}/${repo}`,
                url: `https://github.com/${owner}/${repo}`,
                userId: session.user.id
            }
        })
    }

    // TODO:  INFUTURE JUST INCREMENT THE CONNECTED REPO COUNT FOR THE USAGE TRACKING
    
    // TODO: TRIGGER REPOSITORY INDEXING FOR RAG (FIRE AND FORGET)

    return webhook;
}