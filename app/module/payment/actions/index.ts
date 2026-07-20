"use server";
import { auth } from "@/lib/auth";
import {
  getRemainingLimit,
  updateUserTier,
} from "@/app/module/payment/lib/subscription";
import { headers } from "next/headers";
import { polarClient } from "@/app/module/payment/config/polar";
import prisma from "@/lib/db";

// interface for the subscription data which includes user information and their limits based on subscription tier and usage
export interface SubscriptionData {
  user: {
    id: string;
    name: string;
    email: string;
    subscriptionTier: string;
    subscriptionStatus: string | null;
    polarCustomerId: string | null;
    polarSubscriptionId: string | null;
  } | null;

  limits: {
    tier: "free" | "pro";
    repositories: {
      current: number;
      limit: number | null;
      canAdd: boolean;
    };
    reviews: {
      [repositoryId: string]: {
        current: number;
        limit: number | null;
        canAdd: boolean;
      };
    };
  } | null;
}



export async function getSubscriptionData(): Promise<SubscriptionData> {
  // getting session to check if user is authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { user: null, limits: null };
  }

  // getting user from the database
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    return { user: null, limits: null };
  }

  const limits = await getRemainingLimit(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      subscriptionTier: user.subscriptionTier || "free",
      subscriptionStatus: user.subscriptionStatus || null,
      polarCustomerId: user.polarCustomerId || null,
      polarSubscriptionId: user.polarSubscriptionId || null,
    },

    limits,
  };
}



export async function syncSubscriptionStatus() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        throw new Error("Not authenticated");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user || !user.polarCustomerId) {
        return { success: false, message: "No Polar customer ID found" };
    }

    try {
        // Fetch subscriptions from Polar
        const result = await polarClient.subscriptions.list({
            customerId: user.polarCustomerId,
        });

        const subscriptions = result.result?.items || [];

        // Find the most relevant subscription (active or most recent)
        const activeSub = subscriptions.find((sub: any) => sub.status === 'actived');
        const latestSub = subscriptions[0]; // Assuming API returns sorted or we should sort

        if (activeSub) {
            await updateUserTier(user.id, "pro", "activated");
            return { success: true, status: "ACTIVE" };
        } else if (latestSub) {
            // If latest is canceled/expired
            const status = latestSub.status === 'canceled' ? "cancelled" : "expired";
            // Only downgrade if we are sure it's not active
            if (latestSub.status !== 'activated') {
                await updateUserTier(user.id, "free", status);
            }
            return { success: true, status };
        }

        return { success: true, status: "NO_SUBSCRIPTION" };
    } catch (error) {
        console.error("Failed to sync subscription:", error);
        return { success: false, error: "Failed to sync with Polar" };
    }
}