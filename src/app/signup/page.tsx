import SignupForm from "./SignupForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | DV Monitor",
  description: "Sign up for a DV Monitor account to get started.",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded bg-[#101820] flex items-center justify-center">
            <span className="text-[#FEE715] font-bold text-xl tracking-tighter">
              DV
            </span>
          </div>
        </div>

        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-[#101820]">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          Set up your DV Monitor account in seconds
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="bg-white px-6 py-10 shadow sm:rounded-lg sm:px-12">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
