import { inngestClient } from "../client";
import { getPullrequestDiff, postReviewComment } from "@/app/module/github/lib/github";
import { retrieveContext } from "@/app/module/ai/lib/rag";
import prisma from "@/lib/db";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export const generateReview = inngestClient.createFunction(
  { id: "generate-review", concurrency: 5 },
  { event: "pr.review.requested" },
  async ({ event, step }) => {
    const { owner, repo, prNumber, userId } = event.data;

    // Step 1: Fetch PR data
    const { diff, title, description, token } = await step.run(
      "fetch-pr-data",
      async () => {
        // Fetch repository details (including user and GitHub account) from the database
        const account = await prisma.account.findFirst({
          where: {
            userId,
            providerId: "github",
          },
        });

        if (!account?.accessToken) {
          throw new Error(
            "No GitHub account linked for user. Please reconnect your GitHub account.",
          );
        }

        const token = account.accessToken;

        // Get the pull request diff, title, and description
        const data = await getPullrequestDiff(owner, repo, prNumber, token);

        return { ...data, token };
      },
    );

    // Step 2: Retrieve context from Pinecone
    const context = await step.run("retrieve-context", async () => {
      const query = `Review the following pull request titled "${title}" with description "${description}".`;
      return await retrieveContext(query, `${owner}/${repo}`);
    });

    // Step 3: Generate review using AI
    const review = await step.run("generate-ai-review", async () => {
      const prompt = `
You are an expert senior software engineer acting as a professional code reviewer.

Your task is to analyze the following pull request and produce a **clear, accurate, and constructive code review**.
Base your review strictly on the inputs provided. Do NOT guess missing context.

────────────────────────────────────────────
PULL REQUEST INPUTS
────────────────────────────────────────────

Pull Request Title:
${title}

Pull Request Description:
${description || "No description provided."}

Context from Codebase (may be empty or partial):
${context && context.length ? context.join("\n\n") : "No additional context provided."}

Code Changes (Unified Diff — source of truth):
${diff}

────────────────────────────────────────────
IMPORTANT REVIEW RULES
────────────────────────────────────────────
- The DIFF is the primary source of truth.
- The title and description describe intent but may be incomplete or incorrect.
- Context may help interpret behavior but must not be assumed complete.
- If intent and implementation do not match, explicitly call it out.
- Review ONLY files and lines present in the diff.
- Do NOT invent files, functions, APIs, or requirements.
- If something cannot be determined, say so clearly instead of guessing.

────────────────────────────────────────────
REQUIRED OUTPUT FORMAT (MARKDOWN)
────────────────────────────────────────────
Your response MUST be written in markdown and contain the following sections,
using the exact headers listed below and in the same order.

---

## 1. Walkthrough
- Provide a file-by-file explanation of the changes.
- For each file:
  - Describe what changed
  - Explain why the change matters
- If the diff affects only one file, state that clearly.
- Do NOT explain unchanged legacy code.

---

## 2. Sequence Diagram (if applicable)
- Include this section ONLY if the changes introduce or modify runtime flow,
  interactions between components, or request/response behavior.
- If not applicable, explicitly write: "Not applicable."

- Use a valid Mermaid JS sequence diagram.
- Wrap the diagram in a fenced block exactly like this:

\`\`\`mermaid
sequenceDiagram
    participant A
    participant B
    A->>B: example flow
\`\`\`

⚠️ Mermaid rules (must follow):
- Keep the diagram simple.
- Do NOT use quotes, parentheses, braces, or special characters in labels or notes.
- Do NOT include long sentences in messages.
- Ensure syntax is valid and renderable.

---

## 3. Summary
- Brief overview of what the pull request does.
- State whether the approach appears sound, risky, or unclear.
- Keep this section concise.

---

## 4. Strengths
- Highlight what is done well.
- Focus on correctness, clarity, or good design decisions.
- Avoid generic praise.

---

## 5. Issues
- Identify real problems such as:
  - Bugs or incorrect behavior
  - Security or data safety concerns
  - Edge cases not handled
  - Design or maintainability risks
- Be specific and reference the diff when possible.
- If no major issues are found, say so explicitly.

---

## 6. Suggestions
- Provide concrete, actionable improvements.
- Focus on:
  - Readability
  - Maintainability
  - Minor performance optimizations
- Do NOT rewrite the entire implementation.

---

## 7. Poem
- End the review with a short, light-hearted poem (2–4 lines).
- The poem should creatively summarize the essence of the changes.
- Keep it tasteful, technical-friendly, and brief.

────────────────────────────────────────────
TONE AND STYLE
────────────────────────────────────────────
- Be professional, constructive, and respectful.
- Assume the author is competent.
- Avoid absolute or condescending language.
- Prefer clarity over verbosity.

Your goal is to deliver a review comparable to what a senior engineer would leave on a production pull request.
`;

    // 
      const {text} = await generateText({
        model: google("gemini-2.5-flash"),
        prompt
      });

      return text;
    });

    
    // Step 4: Post review comment on PR
    await step.run("post-comment", async() => {
        await postReviewComment(owner, repo, prNumber, review, token);
    });


    // Step 5: Save review in database
    await step.run("save-review", async () => {
        // Save the review in the database
        const repository = await prisma.repository.findFirst({
            where: {
                owner,
                name: repo,
            }
        });

        if(repository){
            await prisma.review.create({
                data: {
                    repositoryId: repository.id,
                    prNumber,
                    prTitle: title,
                    prUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
                    review,
                    status: "completed"
                }
            })
        }
    })

    return {success: true};
  },
);
