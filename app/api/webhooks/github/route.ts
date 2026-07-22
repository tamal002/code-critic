import { NextRequest, NextResponse } from "next/server";
import { reviewPullRequest } from "@/app/module/ai/actions/index";


// Handle GitHub webhook events
export async function POST(req: NextRequest) {
    try {
        const text = await req.text();
        if (!text) {
            return NextResponse.json({ msg: "Empty request body" }, { status: 400 });
        }

        let body: any;
        const contentType = req.headers.get("content-type") || "";

        if (contentType.includes("application/x-www-form-urlencoded")) {
            const params = new URLSearchParams(text);
            const payload = params.get("payload");
            body = payload ? JSON.parse(payload) : {};
        } else {
            body = JSON.parse(text);
        }

        const event = req.headers.get("X-GitHub-Event");

        // Handle ping event
        if (event === "ping") {
            return NextResponse.json({ msg: "pong" }, { status: 200 });
        }

        // Handle pull request events
        if (event === "pull_request") {
            const action = body.action;
            const prNumber = body.number;
            const repo = body.repository?.full_name;

            if (repo && prNumber) {
                const [owner, repoName] = repo.split("/");

                if (action === "opened" || action === "reopened" || action === "synchronize") {
                    reviewPullRequest(owner, repoName, prNumber)
                        .then(() => console.log(`Review completed for ${repo}#${prNumber}`))
                        .catch((err: any) => console.error(`Review failed for ${repo}#${prNumber}:`, err));
                }
            }
        }

        // Process other events if needed
        return NextResponse.json({ msg: "Event processed" }, { status: 200 });
    } catch (error) {
        console.error("Error handling GitHub webhook:", error);
        return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
    }
}