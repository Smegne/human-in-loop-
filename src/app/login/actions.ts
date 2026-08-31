"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    const data = Object.fromEntries(formData);
    await signIn("credentials", { ...data, redirectTo: "/admin" });
  } catch (error) {
    if (error instanceof AuthError) {
      console.error("AuthError caught in authenticate:", error.type, error.message);
      
      // Return the detailed error message for debugging on the frontend
      return `AuthError (${error.type}): ${error.cause?.err?.message || error.message || "Unknown error"}`;
    }
    
    // In Next.js, signIn() throws a NEXT_REDIRECT error on success.
    // If the error message includes NEXT_REDIRECT, it means login was successful.
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      console.log("Login action redirecting...");
    } else {
      console.error("Unexpected error in authenticate:", error);
      if (error instanceof Error) {
        return `Unexpected Error: ${error.message}`;
      }
    }
    
    throw error;
  }
}
