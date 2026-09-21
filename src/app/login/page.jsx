import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
              Member Portal
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-3 mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-sm text-slate-600">Sign in to your Par For Purpose account</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-8">
            <LoginForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
