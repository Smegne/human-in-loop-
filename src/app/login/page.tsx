import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const { registered } = await searchParams;

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded bg-[#101820] flex items-center justify-center">
            <span className="text-[#FEE715] font-bold text-xl tracking-tighter">
              DV
            </span>
          </div>
        </div>
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-[#101820]">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {registered === "true" && (
          <div className="mb-4 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            🎉 Account created successfully! Sign in to get started.
          </div>
        )}
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

