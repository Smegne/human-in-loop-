import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./lib/db";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        console.log("Authorize called with email:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          throw new Error("Missing credentials");
        }

        try {
          const user = await db.user.findUnique({
            where: {
              email: credentials.email as string,
            },
          });

          if (!user || !user.password) {
            console.log("User not found or no password set for:", credentials.email);
            throw new Error("Invalid credentials");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            console.log("Invalid password for:", credentials.email);
            throw new Error("Invalid credentials");
          }

          console.log("Login successful for:", user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Error during authorization:", error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  trustHost: true,
});
