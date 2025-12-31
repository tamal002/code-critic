import { NextRequest, NextResponse } from "next/server";



// Handle GitHub webhook events
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const event = req.headers.get("X-GitHub-Event");

        if(event === "ping"){
            return NextResponse.json({msg: "pong"}, {status: 200});
        }

        //TODO: process other events like push, pull_request, etc.

        return NextResponse.json({msg: "Event processed"}, {status: 200});
    } catch (error) {
        console.error("Error handling GitHub webhook:", error);
        return NextResponse.json({msg: "Internal Server Error"}, {status: 500});
    }
}