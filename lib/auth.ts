import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    disableSignUp: process.env.ALLOW_PUBLIC_SIGN_UP !== "true",
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
});
