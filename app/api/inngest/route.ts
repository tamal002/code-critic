import { serve } from "inngest/next";
import { inngestClient } from "../../../inngest/client";
import { indexRepository } from "../../../inngest/functions/index";

// Create an API that serves functions
export const { GET, POST, PUT } = serve({
  client: inngestClient,
  functions: [
    
    /* all required functions */
    indexRepository,
  ],
});