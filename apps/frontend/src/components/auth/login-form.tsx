"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const email = `${studentId}@schoolptk.ac.th`;
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.refresh();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">เข้าสู่ระบบ</h1>
        <p className="text-sm text-gray-500">
          ลงชื่อเข้าใช้ด้วยบัญชีโรงเรียนหรือรหัสนักเรียน
        </p>
      </div>

      <CardContent className="p-0 space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="grid gap-2">
          <Button
            variant="outline"
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border-gray-200"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FcGoogle className="mr-2 h-5 w-5" />
            )}
            เข้าสู่ระบบด้วย @schoolptk.ac.th
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">
              หรือ เข้าสู่ระบบ ด้วยรหัสนักเรียน
            </span>
          </div>
        </div>

        <form onSubmit={handleStudentLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentId">รหัสนักเรียน (Student ID)</Label>
            <div className="relative">
              <Input
                id="studentId"
                placeholder="เช่น 41430"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                disabled={loading}
                required
                className="pr-32 bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">เลขประจำตัวประชาชน (Citizen ID)</Label>
            <Input
              id="password"
              type="password"
              placeholder="•••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              className="pr-32 bg-white"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-brand-secondary hover:bg-brand-secondary/90 text-white"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            เข้าสู่ระบบ
          </Button>
        </form>
      </CardContent>
    </div>
  );
}
