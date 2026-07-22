"use server";

import prisma from "@/lib/db";


// Define subscription tiers and statuses
export type SubscriptionTier = "free" | "pro";
export type SubscriptionStatus = "activated" | "cancelled" | "expired" | null;


// interface for user limits based on subscription tier and usage
export interface UserLimits {
    tier: SubscriptionTier;
    repositories: {
        current: number;
        limit: number | null;
        canAdd: boolean;
    };
    reviews: Record<string, {
        current: number;
        limit: number | null;
        canAdd: boolean;
    }>
};


// Define limits for each subscription tier and usage tracking 
const TIER_LIMITS = {
    free: {
        repositories: 3,
        reviewsPerRepository: 5,
    },
    pro: {
        repositories: null, // unlimited
        reviewsPerRepository: null, // unlimited
    },
} as const;


// Function to get user's subscription tier and status
export async function getUserTier(userId: string) : Promise<SubscriptionTier> {
    
    // fetch user's subscription tier and status from the database
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionTier: true },
    });

    // return the subscription tier, defaulting to "free" if not set
    return (user?.subscriptionTier as SubscriptionTier) || "free";
}


// Function to get user's usage
async function getUserUsage(userId: string) {
    let usage = await prisma.userUsage.findUnique({
        where: { userId },
    });
    
    if(!usage){
        usage = await prisma.userUsage.create({
            data: {
                userId,
                repositoryCount: 0,
                reviewCount: {},
            },
        });
    }
    return usage;
}


// Function to check if user can connect a new repository based on their subscription tier and current usage
export async function canConnectRepository(userId: string) : Promise<boolean> {
    const userTier: SubscriptionTier = await getUserTier(userId);
    if(userTier === "pro"){
        return true; // Pro users have no limits
    }
    // For free users, check if they have reached the repository limit
    const userUsage = await getUserUsage(userId);
    const userRepoLimit = TIER_LIMITS[userTier].repositories;
    return userUsage.repositoryCount < userRepoLimit;
}


// Function to check if user can create a new review for a specific repository based on their subscription tier and current usage
export async function canCreateReview(userId:string, repoId: string) : Promise<boolean> {
    const userTier: SubscriptionTier = await getUserTier(userId);
    if(userTier === "pro"){
        return true; // Pro users have no limits
    }
    // For free users, check if they have reached the review limit for the specific repository
    const userUsage = await getUserUsage(userId);
    const reviewCount = userUsage.reviewCount as Record<string, number>;
    const currentCount = reviewCount[repoId] || 0;
    const reviewLimit = TIER_LIMITS[userTier].reviewsPerRepository;
    return currentCount < reviewLimit;
}


// Function to increment the repository count for a user, creating a usage record if it doesn't exist
export async function incrementRepositoryCount(userId: string): Promise<void> {

    // Increment the repository count for the user, creating a usage record if it doesn't exist
    await prisma.userUsage.upsert({
        where: { userId },
        create: {
            userId,
            repositoryCount: 1,
            reviewCount: {},
        },
        update: {
            repositoryCount: {
                increment: 1
            }
        }
    });
}


// Function to increment the review count for a specific repository for a user, creating a usage record if it doesn't exist
export async function decrementRepositoryCount(userId: string): Promise<void> {
    // Decrement the repository count for the user
    const userUsage = await getUserUsage(userId);
    await prisma.userUsage.update({
        where: {userId},
        data: {
            repositoryCount: Math.max(0, userUsage.repositoryCount - 1)
        }
    });
}


// Function to increment the review count for a specific repository for a user, creating a usage record if it doesn't exist
export async function incrementReviewCount(userId: string, repoId: string): Promise<void> {
    // Increment the review count for the specific repository for the user, creating a usage record if it doesn't exist
    const userUsage = await getUserUsage(userId);
    const reviewCount = userUsage.reviewCount as Record<string, number>;
    reviewCount[repoId] = (reviewCount[repoId] || 0) + 1;
    // Update the review count in the database
    await prisma.userUsage.update({
        where: {userId},
        data: {
            reviewCount: reviewCount
        }
    });
}


export async function getRemainingLimit(userId: string): Promise<UserLimits> {

    // fetching user's subscription tier and usage to calculate remaining limits.
    const userTier: SubscriptionTier = await getUserTier(userId);
    const userUsage = await getUserUsage(userId);

    // calculating repository limit details
    const countOfConnectedfRepository = userUsage.repositoryCount;
    const userLimit = TIER_LIMITS[userTier].repositories;
    const canAddRepository = await canConnectRepository(userId);

    // calculating review limit details for each repository
    let userReviewDetails: Record<string, {
        current: number;
        limit: number | null;
        canAdd: boolean;
    }> = {};
    // fetch all connected repositories for the user to calculate review limits for each repository
    const connectedRepositories = await prisma.repository.findMany({
        where: { userId },
        select: { id: true },
    });
    const reviewLimitPerRepo = TIER_LIMITS[userTier].reviewsPerRepository;
    const currentReviewCount = userUsage.reviewCount as Record<string, number> || {};

    // Loop through connected repositories to calculate review limits for each repository
    for(const repo of connectedRepositories){
        const repoId = repo.id;
        const currentRepoReviewCount = currentReviewCount[repoId] || 0;
        userReviewDetails[repoId] = {
            current: currentRepoReviewCount,
            limit: reviewLimitPerRepo,
            canAdd: reviewLimitPerRepo === null ? true : currentRepoReviewCount < reviewLimitPerRepo,
        }
    }
    
    // constructing the remaining limit details object to return.
    const remainingLimitDetails: UserLimits = {
        tier: userTier,
        repositories: {
            current: countOfConnectedfRepository,
            limit: userLimit,
            canAdd: canAddRepository,
        },
        reviews: userReviewDetails,
    }; 

    return remainingLimitDetails
}


// Function to update user's subscription tier and status in the database
export async function updateUserTier (
    userId: string,
    tier: SubscriptionTier,
    status: SubscriptionStatus
) : Promise<void> {
    
    // Update the user's subscription tier and status in the database
    await prisma.user.update({
        where: {id: userId},
        data: {
            subscriptionTier: tier,
            subscriptionStatus: status,
        }
    })
}


// Function to update user's polarCustomerId in the database
export async function updatePolarCustomerId(userId: string, customerId: string): Promise<void> {
    // Update the user's polarCustomerId in the database
    await prisma.user.update({
        where: {id: userId},
        data: {
            polarCustomerId: customerId,
        }
    })
}