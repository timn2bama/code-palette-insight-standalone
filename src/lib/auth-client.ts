import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: window.location.origin, // Base URL of your app
});

export const { signIn, signUp, signOut, useSession } = authClient;
