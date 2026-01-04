"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { deleteWebhook } from "../../github/lib/github";

// Fetch user profile action
export async function getUserProfile() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique(
        {
            where: {
                id: session.user.id,
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true, 
                createdAt: true,
            }
        }
    );

    return user;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

// Update user profile action
export async function updateUserProfile(
    data: {
        name?: string,
        email?: string
    }
){
    try {
        const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const updateUser = await prisma.user.update({
        where: {
            id: session.user.id,
        },
        data: {
            name: data.name,
            email: data.email,
        },
        select: {
            id: true,
            name: true,
            email: true,
        }
    });

    revalidatePath("/dashboard/settings", "layout");

    return {
        success: true,
        user: updateUser,
    };

    } catch (error) {
        console.error("Error updating user profile:", error);
        return {
        success: false,
        error: (error as Error).message,
        }
    }
}


// Fetch connected repositories action
export async function getConnectedRepositories() {
    try {
        const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Fetch connected repositories for the user
    const repository = await prisma.repository.findMany({
        where: {
            userId: session.user.id,
        },
        select: {
            id: true,
            name: true,
            url: true,
            createdAt: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return repository;
    } catch (error) {
        console.error("Error fetching connected repositories:", error);
        return [];
    }
}


// disconnect repository 
export async function disconnectRepository(repositoryId: string) {
    try {
        const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // fetch repository to ensure it exists and belongs to the user
    const repository = await prisma.repository.findUnique({
        where: {
            id: repositoryId,
            userId: session.user.id,
        }
    });

    // if repository not found, throw error
    if(!repository){
        throw new Error("Repository not found");
    }

    // delete webhook from GitHub
    await deleteWebhook(repository.owner, repository.name);

    // delete repository from database
    await prisma.repository.delete({
        where: {
            id: repositoryId,
            userId: session.user.id,
        }
    });

    revalidatePath("/dashboard/repository", "page");
    revalidatePath("/dashboard/settings", "page");

    return {
        success: true,
    };

    } catch (error) {
        console.error("Error disconnecting repository:", error);
        return {
        success: false,
        error: "Failed to disconnect the repository",
        }
    }
}


// disconnect all repositories at once 
export async function disconnectAllRepositories() {
    try {
            const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // fetch repository to ensure it exists and belongs to the user
    const repository = await prisma.repository.findMany({
        where: {
            userId: session.user.id,
        }
    });

    // delete webhook from GitHub and delete repository from database
    for(const repo of repository){
        await deleteWebhook(repo.owner, repo.name);
        await prisma.repository.delete({
            where: {
                id: repo.id,
                userId: session.user.id,
            }
        });
    }

    // revalidate paths: It means to refresh the cache for these paths so that the next request gets the updated data.
    revalidatePath("/dashboard/repository", "layout");
    revalidatePath("/dashboard/settings", "layout");

    return {
        success: true,
    };

    } catch (error) {
        console.error("Error disconnecting all repositories:", error);
        return {
        success: false,
        error: "Failed to disconnect all repositories",
        }
    }
}

