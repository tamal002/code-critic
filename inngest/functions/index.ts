import { inngest } from "@/inngest/client";



// demo function that responds to "test/hello.world" events
export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);


/*

PINECONE_API_KEY=
pcsk_7FJP8R_3pxhF5arpJParLjpMEGYGpHHiJfnw98vuWoGL6ij77ErR9QvCsYMUQBYSwRT3wh




*/



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
