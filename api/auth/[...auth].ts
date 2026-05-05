import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../lib/prisma";
import { VercelRequest, VercelResponse } from "@vercel/node";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { method, url, headers, body } = req;
    const host = headers.host || 'localhost';
    const protocol = headers['x-forwarded-proto'] || 'http';
    
    // Better Auth expects a standard Request object
    const response = await auth.handler(new Request(`${protocol}://${host}${url}`, {
        method,
        headers: headers as any,
        body: method !== 'GET' && method !== 'HEAD' ? JSON.stringify(body) : undefined,
    }));

    res.status(response.status);
    const responseHeaders = Object.fromEntries(response.headers.entries());
    Object.entries(responseHeaders).forEach(([key, value]) => res.setHeader(key, value));
    
    const responseBody = await response.text();
    res.send(responseBody);
}
