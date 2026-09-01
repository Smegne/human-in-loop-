"use client";

import { useActionState } from "react";
import { signup, SignupState } from "./actions";
import Link from "next/link";
import { useState } from "react";

const initialState: SignupState = {};

export default function SignupForm() {
  const [state, formAction, isPending] = useActionState(signup, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "EMPLOYEE" | "">("");

  return (
    <form action={formAction} className="space-y-5">
      {/* General error */}
      {state.errors?.general && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-600">{state.errors.general[0]}</p>
        </div>
      )}

      {/* Full Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
          Full Name
        </label>
        <div className="mt-2">
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="John Doe"
            className={`block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#101820] sm:text-sm transition ${
              state.errors?.name ? "ring-red-400 focus:ring-red-500" : "ring-gray-300"
            }`}
          />
          {state.errors?.name && (
            <p className="mt-1 text-xs text-red-500">{state.errors.name[0]}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="signup-email" className="block text-sm font-medium leading-6 text-gray-900">
          Email address
        </label>
        <div className="mt-2">
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className={`block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#101820] sm:text-sm transition ${
              state.errors?.email ? "ring-red-400 focus:ring-red-500" : "ring-gray-300"
            }`}
          />
          {state.errors?.email && (
            <p className="mt-1 text-xs text-red-500">{state.errors.email[0]}</p>
          )}
        </div>
      </div>

      {/* Role Selection */}
      <div>
        <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
          Account Role
        </label>
        <input type="hidden" name="role" value={selectedRole} />
        <div className="grid grid-cols-2 gap-3">
          {/* ADMIN card */}
          <button
            type="button"
            onClick={() => setSelectedRole("ADMIN")}
            className={`relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-sm font-medium transition-all duration-200 focus:outline-none ${
              selectedRole === "ADMIN"
                ? "border-[#101820] bg-[#101820] text-[#FEE715] shadow-md"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
            }`}
          >
            {/* Shield icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span>Admin</span>
            {selectedRole === "ADMIN" && (
              <span className="absolute top-2 right-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </button>

          {/* EMPLOYEE card */}
          <button
            type="button"
            onClick={() => setSelectedRole("EMPLOYEE")}
            className={`relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-sm font-medium transition-all duration-200 focus:outline-none ${
              selectedRole === "EMPLOYEE"
                ? "border-[#101820] bg-[#101820] text-[#FEE715] shadow-md"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
            }`}
          >
            {/* User icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <span>Employee</span>
            {selectedRole === "EMPLOYEE" && (
              <span className="absolute top-2 right-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </button>
        </div>
        {state.errors?.role && (
          <p className="mt-1 text-xs text-red-500">{state.errors.role[0]}</p>
        )}
        {!state.errors?.role && !selectedRole && (
          <p className="mt-1 text-xs text-gray-400">Select your account type to continue.</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="signup-password" className="block text-sm font-medium leading-6 text-gray-900">
          Password
        </label>
        <div className="mt-2 relative">
          <input
            id="signup-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            placeholder="Min. 8 characters"
            className={`block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#101820] sm:text-sm transition ${
              state.errors?.password ? "ring-red-400 focus:ring-red-500" : "ring-gray-300"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {state.errors?.password && (
          <p className="mt-1 text-xs text-red-500">{state.errors.password[0]}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="signup-confirm-password" className="block text-sm font-medium leading-6 text-gray-900">
          Confirm Password
        </label>
        <div className="mt-2 relative">
          <input
            id="signup-confirm-password"
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            required
            placeholder="Re-enter your password"
            className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#101820] sm:text-sm transition"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showConfirm ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Submit */}
      <div className="pt-1">
        <button
          type="submit"
          disabled={isPending || !selectedRole}
          id="signup-submit-btn"
          className="flex w-full justify-center rounded-md bg-[#FEE715] px-3 py-2 text-sm font-semibold leading-6 text-[#101820] shadow-sm hover:bg-[#e6d013] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FEE715] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Creating account...
            </span>
          ) : (
            "Create account"
          )}
        </button>
      </div>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#101820] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
