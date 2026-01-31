import { getRepoFileContent } from "@/app/module/github/lib/github";
import { inngestClient } from "@/inngest/client";
import prisma from "@/lib/db";
import { indexCodebase, generateEmbeddings } from "@/app/module/ai/lib/rag";



// demo function that responds to "test/hello.world" events
export const helloWorld = inngestClient.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);


// function to index a code repository when connected
export const indexRepository = inngestClient.createFunction(
  { id: "index-repository" }, // function unique ID
  {event: "repository/connected"}, // event trigger

  async ({event, step}) => { // handler function
    const { owner, repo, userId } = event.data;


    // step 1 : fetch files from GitHub of the connected repository
    const files = await step.run("fetch-files", async () => {

        // get user's github access token 
        const account = await prisma.account.findFirst({
          where: {
            userId: userId,
            providerId: "github",
          }
        });

        if(!account?.accessToken) {
            throw new Error("No GitHub account found");
        }

        return await getRepoFileContent(account.accessToken, owner, repo);
    });

    // step 2: index codebase
    await step.run("index-codebase", async () => {
        await indexCodebase(`${owner}/${repo}`, files);
    });

    return {status: true, indexedFiles: files.length};
  }
);



/**
 * Inngest function that demonstrates the foundational structure of serverless workflow creation.
 * 
 * @description
 * This function showcases the core pattern for defining Inngest functions using the `createFunction` method.
 * Inngest functions are automatically serialized and queued as event-driven workflows that can be triggered
 * remotely or via webhooks, enabling reliable, durable task execution.
 * 
 * @param {Object} config - Configuration object (first argument to createFunction)
 * @param {string} config.id - Unique identifier for this function across your Inngest workspace.
 *                              Used for tracking, logging, and referencing in the Inngest dashboard.
 * 
 * @param {Object} trigger - Event trigger configuration (second argument to createFunction)
 * @param {string} trigger.event - The event key that activates this function. Supports glob patterns.
 *                                  When this event is emitted (via inngest.send()), the function executes.
 * 
 * @param {Function} handler - Async handler function (third argument to createFunction)
 * @param {Object} handler.event - The payload object containing data from the triggering event.
 * @param {Object} handler.step - Inngest Step object providing resilience utilities:
 *   @param {Function} handler.step.sleep - Delays execution. Serialized into workflow state,
 *                                           resuming from this exact point after delay without
 *                                           re-executing earlier steps (durable execution).
 *   @param {Function} handler.step.run - Executes wrapped functions with automatic retry logic.
 *   @param {Function} handler.step.waitForEvent - Pauses until a matching event is received.
 *   @param {Function} handler.step.parallel - Executes multiple steps concurrently.
 *   @param {Function} handler.step.sendEvent - Emits events from within the workflow.
 * 
 * @serialization
 * Inngest automatically serializes the function's execution state. When a step completes,
 * the function's position is checkpointed. On resume (after sleep/wait), only unexecuted
 * steps run, preventing duplicate operations and enabling fault tolerance across service restarts.
 * 
 * @returns {Promise<{message: string}>} Workflow result returned to the event emitter and stored in logs.
 * 
 * @example
 * // Trigger this function:
 * // await inngest.send({
 * //   name: "test/hello.world",
 * //   data: { email: "user@example.com" }
 * // });
 * 
 * @see https://www.inngest.com/docs/functions
 * @see https://www.inngest.com/docs/functions/steps
 */
