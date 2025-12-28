
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
        }
    }

    try {
        const response : ContributionData = await octokit.graphql(query, { username });
        return response.user.contributionsCollection.contributionCalendar;
    } catch (error) {
        console.error("Error at fetchUserContribution:", error);
        throw error;
    }
}
