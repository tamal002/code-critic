/**
 * Retrieves dashboard statistics for the currently authenticated user.
 *
 * This function performs the following steps:
 * 1. Authenticates the user by retrieving the session using request headers.
 * 2. Throws an error if the user is not authenticated.
 * 3. Retrieves the GitHub token for the authenticated user.
 * 4. Throws an error if the GitHub token is not found.
 * 5. Initializes the Octokit client with the GitHub token to interact with the GitHub API.
 * 6. Fetches the GitHub username of the authenticated user via the Octokit client.
 * 7. Throws an error if the GitHub username is not found.
 * 8. Sets the total number of connected repositories to a dummy value (30) as a placeholder.
 * 9. Fetches the user's contribution calendar data from GitHub using the provided token and username.
 * 10. Extracts the total number of commits from the contribution calendar.
 * 11. Fetches the total number of pull requests (PRs) created by the user using the GitHub search API.
 * 12. Extracts the total PR count from the search results.
 * 13. Sets the total number of reviews to a dummy value (38) as a placeholder.
 * 14. Returns an object containing the total number of repositories, commits, PRs, and reviews.
 * 15. If any error occurs during the process, logs the error and returns zeroed statistics.
 *
 * @returns An object containing the user's total repositories, commits, PRs, and reviews.
 */
/**
 * Retrieves the monthly activity statistics for the currently authenticated user over the last 6 months.
 *
 * This function performs the following steps:
 * 1. Authenticates the user by retrieving the session using request headers.
 * 2. Throws an error if the user is not authenticated.
 * 3. Retrieves the GitHub token for the authenticated user.
 * 4. Throws an error if the GitHub token is not found.
 * 5. Initializes the Octokit client with the GitHub token to interact with the GitHub API.
 * 6. Fetches the GitHub username of the authenticated user via the Octokit client.
 * 7. Throws an error if the GitHub username is not found.
 * 8. Sets the total number of connected repositories to a dummy value (30) as a placeholder.
 * 9. Fetches the user's contribution calendar data from GitHub using the provided token and username.
 * 10. Returns an empty array if the contribution calendar or its weeks property is missing.
 * 11. Initializes a monthly activity object for the last 6 months, setting commits, PRs, and reviews to zero for each month.
 * 12. Aggregates the number of commits per month from the contribution calendar data.
 * 13. Generates sample review data (as a placeholder) and aggregates the number of reviews per month.
 * 14. Calculates the date 6 months ago from the current date.
 * 15. Fetches all pull requests authored by the user in the last 6 months using the GitHub search API.
 * 16. Aggregates the number of PRs per month from the fetched pull request data.
 * 17. Returns an array of objects, each representing a month with the corresponding counts of commits, PRs, and reviews.
 * 18. If any error occurs during the process, logs the error and returns an empty array.
 *
 * @returns An array of objects, each containing the month name and the user's commits, PRs, and reviews for that month.
 */

"use server";

import {
  fetchUserContribution,
  getGithubToken,
} from "@/app/module/github/lib/github";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { Octokit } from "octokit";


export async function getContributionStats() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const token = await getGithubToken();

        // Get the actual GitHub username from the GitHub API
        const octokit = new Octokit({ auth: token });

        const { data: user } = await octokit.rest.users.getAuthenticated();
        const username = user.login;

        const calendar = await fetchUserContribution(token, username);

        if (!calendar) {
            return null;
        }

        const contributions = calendar.weeks.flatMap((week: any) =>
            week.contributionDays.map((day: any) => ({
                date: day.date,
                count: day.contributionCount,
                level: Math.min(4, Math.floor(day.contributionCount / 3)), // Convert to 0-4 scale
            }))
        )

        return {
            contributions,
            totalContributions:calendar.totalContributions
        }

    } catch (error) {
console.error("Error fetching contribution stats:", error);
    return null;
    }
}



// Get dashboard statistics for the authenticated user
export const getDashboardStats = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("unauthenticated");
    }

    const githubToken = await getGithubToken();
    if (!githubToken) {
      throw new Error("GitHub token not found");
    }

    // Initialize Octokit with the GitHub token
    const octokit = new Octokit({
      auth: githubToken,
    });

    // Fetch GitHub username from the linked account
    const { data: user } = await octokit.rest.users.getAuthenticated();
    const githubUsername = user.login;

    if (!githubUsername) {
      throw new Error("GitHub username not found");
    }

    // TODO: fetch total connected repos from db
    const totalRepos = 30; // dummy data

    // Fetch user contribution data
    const calendar = await fetchUserContribution(githubToken, githubUsername);

    // Extract total commits from contribution calendar
    const totalCommits = calendar.totalContributions || 0;

    // Fetch total PRs created by the user
    const { data: prs } = await octokit.rest.search.issuesAndPullRequests({
      q: `author:${githubUsername} type:pr`,
      per_page: 1,
    });
    // Extract total PRs count
    const totalPRs = prs.total_count || 0;

    // TODO: fetch total reviews from db
    const totalReviews = 38; // dummy data

    return {
      totalRepos,
      totalCommits,
      totalPRs,
      totalReviews,
    };
  } catch (error) {
    console.error("Error at getDashboardStats:", error);
    return {
      totalRepos: 0,
      totalCommits: 0,
      totalPRs: 0,
      totalReviews: 0,
    };
  }
};



// Get monthly activity for the authenticated user
/**
 * Fetches and aggregates the user's monthly GitHub activity for the last 6 months.
 *
 * This function performs the following steps:
 * 1. Authenticates the user and retrieves their GitHub token.
 * 2. Initializes Octokit with the user's GitHub token.
 * 3. Fetches the authenticated user's GitHub username.
 * 4. Retrieves the user's contribution calendar (commits) via `fetchUserContribution`.
 * 5. Initializes a monthly activity object for the last 6 months, with each month containing:
 *    - `commits`: number of commits
 *    - `prs`: number of pull requests
 *    - `reviews`: number of reviews
 *    Example:
 *    ```ts
 *    {
 *      January: { commits: 34, prs: 5, reviews: 10 },
 *      February: { commits: 20, prs: 3, reviews: 8 },
 *      ...
 *    }
 *    ```
 * 6. Aggregates commit counts per month from the contribution calendar.
 * 7. Generates sample review data (to be replaced with real data) and aggregates review counts per month.
 *    - Each review object format:
 *      ```ts
 *      {
 *        createdAt: Date;
 *      }
 *      ```
 * 8. Fetches pull requests created by the user in the last 6 months from GitHub and aggregates PR counts per month.
 *    - Each PR object format (from Octokit):
 *      ```ts
 *      {
 *        created_at: string; // ISO date string
 *        // ...other PR fields
 *      }
 *      ```
 * 9. Returns the aggregated monthly activity as an array of objects, each representing a month:
 *    ```ts
 *    [
 *      { name: "January", commits: 34, prs: 5, reviews: 10 },
 *      { name: "February", commits: 20, prs: 3, reviews: 8 },
 *      // ...
 *    ]
 *    ```
 *
 * @returns {Promise<Array<{ name: string; commits: number; prs: number; reviews: number }>>}
 *   An array of objects, each containing the month name and the counts of commits, PRs, and reviews.
 *   Returns an empty array if an error occurs or no data is available.
 */
export const getMonthlyActivity = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("unauthenticated");
    }

    const githubToken = await getGithubToken();
    if (!githubToken) {
      throw new Error("GitHub token not found");
    }

    // Initialize Octokit with the GitHub token
    const octokit = new Octokit({
      auth: githubToken,
    });

    // Fetch GitHub username from the linked account
    const { data: user } = await octokit.rest.users.getAuthenticated();
    const githubUsername = user.login;

    if (!githubUsername) {
      throw new Error("GitHub username not found");
    }

    // TODO: fetch total connected repos from db
    const totalRepos = 30; // dummy data

    // Fetch user contribution data
    const calendar = await fetchUserContribution(githubToken, githubUsername);
    if (!calendar || !calendar.weeks) {
      return [];
    }

    // activity formatting
    const monthlyActivity: {
      [key: string]: { commits: number; prs: number; reviews: number };
    } = {};

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Initialize last 6 months with zero activity
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = monthNames[date.getMonth()];
      monthlyActivity[monthKey] = { commits: 0, prs: 0, reviews: 0 };
    }

    // Aggregate commits per month (not considering PRs and reviews for now)
    /*
        example: 
        From calendar data:
        {
          January: { commits: 34, prs: 5, reviews: 10 },
          February: { commits: 20, prs: 3, reviews: 8 },
          ...
        }
        
        final Monthly Activity:
        [
          { name: "January", commits: 34, prs: 5, reviews: 10 },
            { name: "February", commits: 20, prs: 3, reviews: 8 },
            ...]

    */
    calendar.weeks.forEach((week: any) => {
      week.contributionDays.forEach((day: any) => {
        const date = new Date(day.date);
        const monthKey = monthNames[date.getMonth()];
        if (monthlyActivity[monthKey]) {
          monthlyActivity[monthKey].commits += day.contributionCount;
        }
      });
    });

    // Fetch reviews from database for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // TODO: REVIEWS'S REAL DATA
    const generateSampleReviews = () => {
      const sampleReviews = [];
      const now = new Date();

      // Generate random reviews over the past 6 months
      for (let i = 0; i < 45; i++) {
        const randomDaysAgo = Math.floor(Math.random() * 180); // Random day in last 6 months
        const reviewDate = new Date(now);
        reviewDate.setDate(reviewDate.getDate() - randomDaysAgo);

        sampleReviews.push({
          createdAt: reviewDate,
        });
      }

      return sampleReviews;
    };

    const reviews = generateSampleReviews();

    reviews.forEach((review) => {
      const monthKey = monthNames[review.createdAt.getMonth()];
      if (monthlyActivity[monthKey]) {
        monthlyActivity[monthKey].reviews += 1;
      }
    });

    // Fetch PRs from GitHub created by the user in the last 6 months
    const { data: prs } = await octokit.rest.search.issuesAndPullRequests({
      q: `author:${user.login} type:pr created:>${
        sixMonthsAgo.toISOString().split("T")[0]
      }`,
      per_page: 100,
    });

    // Aggregate PRs per month
    prs.items.forEach((pr: any) => {
      const date = new Date(pr.created_at);
      const monthKey = monthNames[date.getMonth()];
      if (monthlyActivity[monthKey]) {
        monthlyActivity[monthKey].prs += 1;
      }
    });

    // Format the result as an array
    return Object.keys(monthlyActivity).map((name) => ({
      name,
      ...monthlyActivity[name],
    }));
  } catch (error) {
    console.error("Error at getMonthlyActivity:", error);
    return [];
  }
};


// overview of data formation flow
/*

  1️⃣ getDashboardStats — Data Formation Flow
Step 1: Session resolution
const session = await auth.api.getSession(...)


Result

session = {
  user: {
    id: "user_123",
    email: "dev@example.com"
  }
}


👉 Used only to authorize the request.

Step 2: GitHub token from DB
const githubToken = await getGithubToken();


Result

githubToken = "gho_xxxxxxxxxxxxxxxxx"


👉 Used for all GitHub API calls.

Step 3: Authenticated GitHub user
const { data: user } = await octokit.rest.users.getAuthenticated();


Result

user = {
  login: "octocat",
  id: 583231,
  avatar_url: "...",
  ...
}


Extracted:

githubUsername = "octocat"

Step 4: Contribution calendar (GraphQL)
const calendar = await fetchUserContribution(token, username);


Raw shape

calendar = {
  totalContributions: 412,
  weeks: [
    {
      contributionDays: [
        {
          date: "2025-01-03",
          contributionCount: 4,
          color: "#239a3b"
        },
        {
          date: "2025-01-04",
          contributionCount: 0,
          color: "#ebedf0"
        }
      ]
    },
    ...
  ]
}

Step 5: Total commits
const totalCommits = calendar.totalContributions;


Result

totalCommits = 412

Step 6: Pull Request search
const { data: prs } = await octokit.rest.search.issuesAndPullRequests(...)


Result

prs = {
  total_count: 87,
  items: [  not used here  ] // not used here
}


Extracted:

totalPRs = 87

Step 7: Final dashboard object
return {
  totalRepos: 30,
  totalCommits: 412,
  totalPRs: 87,
  totalReviews: 38
};


📊 Final Shape

{
  totalRepos: number,
  totalCommits: number,
  totalPRs: number,
  totalReviews: number
}

2️⃣ getMonthlyActivity — Data Formation Flow

This function is more interesting because data is incrementally aggregated.

Step 1: Initialize last 6 months
monthlyActivity = {
  April:    { commits: 0, prs: 0, reviews: 0 },
  May:      { commits: 0, prs: 0, reviews: 0 },
  June:     { commits: 0, prs: 0, reviews: 0 },
  July:     { commits: 0, prs: 0, reviews: 0 },
  August:   { commits: 0, prs: 0, reviews: 0 },
  September:{ commits: 0, prs: 0, reviews: 0 }
}


🧱 This is your aggregation bucket.

Step 2: Aggregate commits from calendar

From calendar:

{
  date: "2025-07-12",
  contributionCount: 3
}


Processing logic:

monthKey = "July"
monthlyActivity["July"].commits += 3;

After all weeks processed:
monthlyActivity = {
  April:    { commits: 12, prs: 0, reviews: 0 },
  May:      { commits: 34, prs: 0, reviews: 0 },
  June:     { commits: 29, prs: 0, reviews: 0 },
  July:     { commits: 41, prs: 0, reviews: 0 },
  August:   { commits: 19, prs: 0, reviews: 0 },
  September:{ commits: 7,  prs: 0, reviews: 0 }
}

Step 3: Sample review generation (placeholder)

Generated:

reviews = [
  { createdAt: 2025-07-02 },
  { createdAt: 2025-07-14 },
  { createdAt: 2025-05-09 },
  ...
]


Aggregation:

monthlyActivity["July"].reviews += 1;

After reviews:
monthlyActivity = {
  April:    { commits: 12, prs: 0, reviews: 6 },
  May:      { commits: 34, prs: 0, reviews: 9 },
  June:     { commits: 29, prs: 0, reviews: 7 },
  July:     { commits: 41, prs: 0, reviews: 11 },
  August:   { commits: 19, prs: 0, reviews: 8 },
  September:{ commits: 7,  prs: 0, reviews: 4 }
}

Step 4: Pull Requests (search API)

Each PR:

{
  created_at: "2025-06-18T12:34:56Z"
}


Aggregation:

monthlyActivity["June"].prs += 1;

After PRs:
monthlyActivity = {
  April:    { commits: 12, prs: 2, reviews: 6 },
  May:      { commits: 34, prs: 5, reviews: 9 },
  June:     { commits: 29, prs: 7, reviews: 7 },
  July:     { commits: 41, prs: 9, reviews: 11 },
  August:   { commits: 19, prs: 4, reviews: 8 },
  September:{ commits: 7,  prs: 1, reviews: 4 }
}

Step 5: Final output formatting
Object.keys(monthlyActivity).map(...)

Final API Response
[
  { name: "April", commits: 12, prs: 2, reviews: 6 },
  { name: "May", commits: 34, prs: 5, reviews: 9 },
  { name: "June", commits: 29, prs: 7, reviews: 7 },
  { name: "July", commits: 41, prs: 9, reviews: 11 },
  { name: "August", commits: 19, prs: 4, reviews: 8 },
  { name: "September", commits: 7, prs: 1, reviews: 4 }
]


📈 Perfect for charts / dashboards

 */