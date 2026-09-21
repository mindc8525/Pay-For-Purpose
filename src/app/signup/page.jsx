import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SignupForm } from "@/features/auth/signup-form";
import Link from "next/link";
import { Suspense } from "react";

function SignupContent() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
          Get Started
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-3 mb-2 tracking-tight">Create Your Account</h1>
        <p className="text-sm text-slate-600">
          Join Par For Purpose to enter monthly draws, track your rounds, and empower vetted charities.
        </p>
      </div>
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-8">
        <SignupForm />
        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-700 font-semibold hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Suspense fallback={<div className="text-slate-500">Loading...</div>}>
          <SignupContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
