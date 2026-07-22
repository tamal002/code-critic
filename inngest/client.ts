import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngestClient = new Inngest({
  id: "code-critic",
  eventKey: process.env.INNGEST_EVENT_KEY,
  isDev: process.env.INNGEST_SIGNING_KEY ? false : undefined,
});