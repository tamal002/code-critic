import { polarClient } from "@polar-sh/better-auth"
import { createAuthClient } from "better-auth/react"



export const {signIn, signOut, signUp, useSession, checkout, customer} = createAuthClient({
    
    baseURL: process.env.BETTER_AUTH_URL as string,
    plugins : [polarClient()]
})