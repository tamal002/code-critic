"use server";

import prisma from "@/lib/db";
import { getPullrequestDiff } from "../../github/lib/github";
import { inngestClient } from "@/inngest/client";
import { canCreateReview, incrementReviewCount } from "../../payment/lib/subscription";

// Review a pull request using AI
export async function reviewPullRequest(
  owner: string,
  repo: string,
  prNumber: number,
) {


    try {
        
    
  // Fetch repository details (including user and GitHub account) from the database
  const repository = await prisma.repository.findFirst({
    where: {
      owner,
      name: repo,
    },
    include: {
      user: {
        include: {
          accounts: {
            where: {
              providerId: "github",
            },
          },
        },
      },
    },
  });

  // Ensure repository exists
  if (!repository)
    throw new Error(`Repository ${owner}/${repo} not found in database. Please reconnect the
repository.`);


  const canRevie = await canCreateReview(repository.user.id, repository.id);
  if(!canRevie){
    throw new Error(`Review limit reached for user. Please upgrade your subscription or wait until the limit resets.`);
  }
  const githubAccount = repository.user.accounts[0];
  if (!githubAccount?.accessToken)
    throw new Error(
      `No GitHub account linked for user. Please reconnect your GitHub account.`,
    );

    const token  = githubAccount.accessToken;

    const {title} = await getPullrequestDiff(owner, repo, prNumber, token);


    // Trigger the Inngest function to handle the PR review asynchronously
    await inngestClient.send({
        name: "pr.review.requested",
        data: {
            owner,
            repo,
            prNumber,
            userId: repository.user.id,
        }
    });

    // Increment the review count for the user and repository
    await incrementReviewCount(repository.user.id, repository.id);

    return {success: true, message: "Review queued"};

    } catch (error) {
        try {
            const repository = await prisma.repository.findFirst({
                where: {
                  owner,
                  name: repo,
                }});

            if(repository){
                await prisma.review.create({
                    data: {
                        repositoryId: repository.id,
                        prNumber,
                        prTitle: "Failed to fetch PR details",
                        prUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
                        review: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        status: "failed",
                    }
                })
            }    
        } catch (dbError) {
            console.error("Failed to log review failure to database:", dbError);
        }
    }
}
