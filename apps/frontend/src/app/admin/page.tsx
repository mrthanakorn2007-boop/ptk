"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import schoolConfig from "@/data/school-config.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React. FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Redirect to admin dashboard
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="flex flex-col items-center space-y-4">
        <Image
          src={schoolConfig. images. logo}
          alt={`${schoolConfig.name.en} Logo`}
          width={24}
          height={15}
          priority
          className="w-auto h-24 md:h-40 object-contain drop-shadow-sm"
        />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ผู้ดูแลระบบ
          </h1>
          <p className="text-sm text-gray-500">
            Administrator Login
          </p>
        </div>
      </div>

      <div className="w-full max-w-sm p-4 rounded-xl">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@schoolptk.ac.th"
              className="bg-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="bg-white"
              value={password}
              onChange={(e) => setPassword(e.target. value)}
              disabled={loading}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-brand-secondary hover:bg-brand-secondary/90 text-white"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            เข้าสู่ระบบ (Sign In)
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-6">
          <p className="text-xs text-center text-gray-500">
            For authorized administrators only • ผู้ดูแลระบบเท่านั้น
          </p>
        </div>

        {/* Back to Main */}
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            ← กลับหน้าหลัก (Back to Home)
          </Link>
        </div>
      </div>
    </div>
  );
}
