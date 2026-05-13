"use client";

import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  HelpCircle,
  Lock,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, API_BASE_URL, ApiError } from "@/lib/api";
import { setSession } from "@/lib/auth";

const avatars = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felicia",
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams?.get("next") ?? null;
  const justRegistered = searchParams?.get("registered") === "1";
  const prefillIdentifier = searchParams?.get("identifier") ?? "";
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: prefillIdentifier,
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(
    justRegistered ? "Pendaftaran berhasil. Silakan login dengan akun Anda." : null,
  );

  useEffect(() => {
    if (prefillIdentifier) {
      setFormData((prev) => ({ ...prev, identifier: prefillIdentifier }));
    }
  }, [prefillIdentifier]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.identifier.trim())
      newErrors.identifier = "Email atau username diperlukan";
    if (!formData.password) newErrors.password = "Password diperlukan";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setInfoMessage(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await api.post<{
        code: number;
        message: string;
        data: { access_token: string; refresh_token: string };
      }>(
        "/login",
        {
          identifier: formData.identifier.trim(),
          password: formData.password,
        },
        { auth: false },
      );
      const session = setSession(
        res?.data?.access_token ?? "",
        res?.data?.refresh_token,
      );

      if (nextPath) {
        router.push(nextPath);
        return;
      }

      if (session?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else if (err instanceof TypeError) {
        setServerError(
          `Tidak bisa terhubung ke server (${API_BASE_URL}). Pastikan backend sedang berjalan dan CORS mengizinkan origin ini.`,
        );
      } else {
        setServerError(
          err instanceof Error ? err.message : "Login gagal. Periksa kembali kredensial Anda.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Brand Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-[#0f192d] via-[#131b2e] to-[#1a2540] relative overflow-hidden flex-col justify-between p-8">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-blue-400 blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-orange-400 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-teal-400 blur-2xl"></div>
        </div>

        <div className="relative z-10">
          <div className="text-xs font-semibold text-primary mb-8 tracking-widest">
            EVENT MANAGEMENT EXCELLENCE
          </div>

          <h1 className="text-white text-5xl font-bold leading-tight mb-6">
            Connect.
            <br />
            Learn.
            <br />
            Grow.
          </h1>
          <p className="text-gray-300 text-base leading-relaxed max-w-md">
            Experience the next generation of event orchestration. Curated
            environments, seamless registration, and professional networking.
          </p>
        </div>

        {/* Social Proof */}
        <div className="relative z-10 flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-lg border border-white/20 w-fit">
          <div className="flex -space-x-3">
            {avatars.map((avatar, idx) => (
              <img
                key={idx}
                src={avatar}
                alt="user"
                className="w-8 h-8 rounded-full border-2 border-[#131b2e]"
              />
            ))}
          </div>
          <p className="text-gray-200 text-sm">
            Joined by 10k+ professionals this month
          </p>
        </div>
      </div>

      {/* Right Panel - Form Section */}
      <div className="w-full lg:w-1/2 bg-white dark:bg-[#0f192d] flex flex-col justify-center px-6 sm:px-8 md:px-12 py-8">
        <div className="max-w-md mx-auto w-full">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground text-xl font-bold">
                ⊞
              </span>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Selamat Datang Kembali
            </h2>
            <p className="text-muted-foreground">
              Please enter your credentials to access the panel.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {serverError && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <p>{serverError}</p>
              </div>
            )}
            {infoMessage && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                <p>{infoMessage}</p>
              </div>
            )}
            {/* Identifier (email atau username) */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Email atau Username
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  name="identifier"
                  autoComplete="username"
                  value={formData.identifier}
                  onChange={handleChange}
                  placeholder="name@company.com atau username"
                  className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-border bg-muted/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              {errors.identifier && (
                <p className="text-destructive text-sm mt-1">{errors.identifier}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-foreground">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-primary text-sm font-semibold hover:underline"
                >
                  Lupa Password
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 rounded-lg border-2 border-border bg-muted/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-sm mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-border bg-muted/30 text-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <label
                htmlFor="rememberMe"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Ingat saya di perangkat ini
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <span className="text-lg">→</span>
                </>
              )}
            </button>

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <p className="text-muted-foreground text-sm">
                Don&apos;t have an account yet?{" "}
                <Link
                  href="/register"
                  className="text-primary font-semibold hover:underline"
                >
                  Register your interest
                </Link>
              </p>
            </div>
          </form>

          {/* Help Button */}
          <div className="absolute bottom-6 right-6 lg:bottom-8 lg:right-8">
            <button className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors">
              <HelpCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
