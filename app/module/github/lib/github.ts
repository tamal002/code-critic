"use server";

import { Octokit } from "octokit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

/**
 *
 * * Get GitHub access token for the authenticated user
 * * @returns {Promise<string | null>} GitHub access token or null if not found
 *
 */
export const getGithubToken = async (): Promise<string | null> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("unauthenticated");
  }

  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "github",
    },
  });

  if (!account?.accessToken) {
    throw new Error("No GitHub account found");
  }

  return account.accessToken;
};

/**
 * Fetch user contribution data from GitHub GraphQL API
 * @param accessToken
 * @param username
 * @returns Contribution data
 */
export const fetchUserContribution = async (
  accessToken: string | null,
  username: string
) => {
  const octokit = new Octokit({
    auth: accessToken,
  });

  const query = `
    query($username: String!) {
      user(login: $username){
        contributionsCollection {
            contributionCalendar {
                totalContributions
                weeks {
                    contributionDays {
                        date
                        contributionCount
                        color
                    }
                }
            }
        }
      } 
    }
    `;

  interface ContributionData {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: {
            flatMap(arg0: (week: any) => any): unknown;
            forEach(arg0: (week: any) => void): unknown;
            contributionDays: {
              date: string | Date;
              contributionCount: number;
              color: string;
            };
          };
        };
      };
    };
  }

  try {
    const response: ContributionData = await octokit.graphql(query, {
      username,
    });
    return response.user.contributionsCollection.contributionCalendar;
  } catch (error) {
    console.error("Error at fetchUserContribution:", error);
    throw error;
  }
};

export const getRespositories = async (
  page: number = 1,
  perPage: number = 10
) => {
  const accessToken = await getGithubToken();
  const octokit = new Octokit({
    auth: accessToken || undefined,
  });
  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    order: "desc",
    visibility: "all",
    page: page,
    per_page: perPage,
  });

  return data;
};

// Create a webhook for a given repository
export const createWebhook = async (owner: string, repo: string) => {
  const accessToken = await getGithubToken();
  if (!accessToken) {
    throw new Error("GitHub access token not found");
  }
  const octokit = new Octokit({
    auth: accessToken,
  });

  // Add webhook creation logic here
  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/webhooks/github`;

  // Check if webhook already exists
  const { data: hooks } = await octokit.rest.repos.listWebhooks({
    owner,
    repo,
  });
  const existingHook = hooks.find((hook) => hook.config.url === webhookUrl);
  if (existingHook) {
    return existingHook;
  }

  // Create new webhook
  const { data } = await octokit.rest.repos.createWebhook({
    owner,
    repo,
    config: {
      url: webhookUrl,
      content_type: "json",
    },
    events: ["pull_request"],
  });
  return data;
};

// Delete a webhook from a given repository
export const deleteWebhook = async (owner: string, repo: string) => {
  const accessToken = await getGithubToken();
  if (!accessToken) {
    throw new Error("GitHub access token not found");
  }

  // Initialize Octokit with the access token
  const octokit = new Octokit({
    auth: accessToken,
  });
  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/webhooks/github`;

  // listing existing webhooks to find the one to delete
  const { data: hooks } = await octokit.rest.repos.listWebhooks({
    owner,
    repo,
  });

  // Find the webhook with the matching URL
  const hookToDelete = hooks.find((hook) => hook.config.url === webhookUrl);

  // Delete the webhook
  if (hookToDelete) {
    await octokit.rest.repos.deleteWebhook({
      owner,
      repo,
      hook_id: hookToDelete.id,
    });
    return true;
  } else return false;
};
