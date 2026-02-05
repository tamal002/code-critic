"use server";

import prisma from "@/lib/db";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";


export async function getReviews(){

    // Get the session from the auth API
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if(!session){
        throw new Error("Unauthorized");
    }


    // Fetch reviews for repositories owned by the authenticated user
    const reviews = await prisma.review.findMany({
        where: {
            repository: {
                userId: session.user.id
            }
        },
        include: {
            repository: true
        },
        orderBy: {
            createdAt: "desc"
        },
        take: 50
    });

    return reviews;
}