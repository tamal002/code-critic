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

    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000",
    trustedOrigins: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      process.env.NEXT_PUBLIC_APP_BASE_URL,
    ].filter(Boolean) as string[],

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
                            productId: process.env.POLAR_PRODUCT_ID || "990fd738-6693-4a26-98ee-e495ffa20f92",
                            slug: "codecritic" 
                        }
                    ],
                    successUrl: process.env.POLAR_SUCCESS_URL || "/dashboard/subscription?success=true",
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
                    const customerId = payload.data.customerId;

                    // getting user using the polar customerId
                    const user = await prisma.user.findUnique({
                      where : {
                        polarCustomerId: customerId
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
                    const customerId = payload.data.customerId;

                    // getting user using the polar customerId
                    const user = await prisma.user.findUnique({
                      where : {
                        polarCustomerId: customerId
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
                    const customerId = payload.data.customerId;

                    // getting user using the polar customerId
                    const user = await prisma.user.findUnique({
                      where : {
                        polarCustomerId: customerId
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
                    const customerId = payload.data.customerId;

                    if (!customerId) return;

                    // getting user using the polar customerId
                    const user = await prisma.user.findUnique({
                      where : {
                        polarCustomerId: customerId
                      }
                    });

                    // updating the db status
                    if(user){
                      const userId = user.id;
                      await updateUserTier(userId, "pro" as SubscriptionTier, "activated" as SubscriptionStatus);
                    }
                  },

                  onCustomerCreated: async (payload) => {
                    if (!payload.data.email) return;

                    const user = await prisma.user.findUnique({
                      where: {
                        email: payload.data.email
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