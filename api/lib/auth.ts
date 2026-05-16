import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import type { VercelRequest } from '@vercel/node';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
});

export async function verifyUser(req: VercelRequest) {
  const session = await auth.api.getSession({
    headers: req.headers as any,
  });

  if (!session || !session.user) return null;
  
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  };
}
