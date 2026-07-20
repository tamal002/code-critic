import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db";
import { polar, checkout, portal, usage, webhooks } from "@polar-sh/better-auth";
import {polarClient} from "@/app/module/payment/config/polar";
import { updateUserTier, SubscriptionTier, SubscriptionStatus, updatePolarCustomerId } from "@/app/module/payment/lib/subscription";


export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", 
    }),

    baseURL: process.env.NEXT_PUBLIC_APP_BASE_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000",
    trustedOrigins: [
    "http://localhost:3000",
    "https://mannered-matilda-incongrously.ngrok-free.dev",
  ],

    socialProviders: { 
    github: { 
      clientId: process.env.GITHUB_CLIENT_ID as string, 
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
      scope: ["repo"]
    }, 
  }, 

  plugins: [
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    products: [
                        {
                            productId: "990fd738-6693-4a26-98ee-e495ffa20f92",
                            slug: "codecritic" 
                        }
                    ],
                    successUrl: process.env.POLAR_SUCCESS_URL,
                    authenticatedUsersOnly: true
                }),

                portal({
                  returnUrl: process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000/dashboard",
                }),

                usage(),

                webhooks({
                  secret: process.env.POLAR_WEBHOOK_SECRET as string,

                  
                  onSubscriptionActive: async (payload) => {
                    // extracting customerId from payload
                    const cutomerId = payload.data.customerId;

                    // getting user using the polar customerId
                    const user = await prisma.user.findUnique({
                      where : {
                        polarCustomerId: cutomerId
                      }
                    });

                    // updating the db status
                    if(user){
                      const userId = user.id;
                      await updateUserTier(userId, "pro" as SubscriptionTier, "activated" as SubscriptionStatus);
                    }

                  },

                  onSubscriptionCanceled: async (payload) => {
                    // extracting customerId from payload
                    const cutomerId = payload.data.customerId;

                    // getting user using the polar customerId
                    const user = await prisma.user.findUnique({
                      where : {
                        polarCustomerId: cutomerId
                      }
                    });

                    // updating the db status
                    if(user){
                      const userId = user.id;
                      await updateUserTier(userId, user.subscriptionTier as SubscriptionTier, "cancelled" as SubscriptionStatus);
                    }
                  },

                  onSubscriptionRevoked: async (payload) => {
                    // extracting customerId from payload
                    const cutomerId = payload.data.customerId;

                    // getting user using the polar customerId
                    const user = await prisma.user.findUnique({
                      where : {
                        polarCustomerId: cutomerId
                      }
                    });

                    // updating the db status
                    if(user){
                      const userId = user.id;
                      await updateUserTier(userId, "free" as SubscriptionTier, "expired" as SubscriptionStatus);
                    }
                  },

                  onOrderPaid: async (payload) => {
                    // extracting customerId from payload
                    const cutomerId = payload.data.customerId;

                    // getting user using the polar customerId
                    const user = await prisma.user.findUnique({
                      where : {
                        polarCustomerId: cutomerId
                      }
                    });

                    // updating the db status
                    if(user){
                      const userId = user.id;
                      await updateUserTier(userId, "pro" as SubscriptionTier, "activated" as SubscriptionStatus);
                    }
                  },

                  onCustomerCreated: async (payload) => {
                    const user = await prisma.user.findUnique({
                      where: {
                        email: payload.data.email!
                      }
                    });

                    if(user){
                      await updatePolarCustomerId(user.id, payload.data.id);
                    }
                  }
                })
            ],
        })
    ]
});