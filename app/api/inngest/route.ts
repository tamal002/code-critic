import { serve } from "inngest/next";
import { inngestClient } from "../../../inngest/client";
import { indexRepository } from "../../../inngest/functions/index";
import { generateReview } from "../../../inngest/functions/review";

// Create an API that serves functions
export const { GET, POST, PUT } = serve({
  client: inngestClient,
  signingKey: process.env.INNGEST_SIGNING_KEY,
  functions: [
    indexRepository,
    generateReview
  ],
});