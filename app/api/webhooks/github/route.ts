import { NextRequest, NextResponse } from "next/server";
import { reviewPullRequest } from "@/app/module/ai/actions/index";


// Handle GitHub webhook events
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const event = req.headers.get("X-GitHub-Event");

        // Handle ping event
        if(event === "ping"){
            return NextResponse.json({msg: "pong"}, {status: 200});
        }


        // Handle pull request events
        if(event === "pull_request"){
            const action = body.action;
            const prNumber = body.number;
            const repo = body.repository.full_name;

            const [owner, repoName] = repo.split("/");

            if(action === "opened" || action === "reopened"){
                reviewPullRequest(owner, repoName, prNumber).
                then(() => console.log(`Review completed for ${repo}#${prNumber}`)).
                catch((err: any) => console.error(`Review failed for ${repo}#${prNumber}:`, err));
            }
        }

        //TODO: process other events like push, pull_request, etc.

        return NextResponse.json({msg: "Event processed"}, {status: 200});
    } catch (error) {
        console.error("Error handling GitHub webhook:", error);
        return NextResponse.json({msg: "Internal Server Error"}, {status: 500});
    }
}