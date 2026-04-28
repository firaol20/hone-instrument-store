'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { GoogleAuthButton } from '@/components/GoogleAuthButton';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        const { token, refreshToken, userId, email, role } = response.data.data;
        setAuth({ _id: userId, email, role }, token, refreshToken);
        toast.success('Welcome back!');
        router.push('/products');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100/50 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-100 rounded-full blur-[100px] -z-10" />

        <Card className="w-full max-w-md border-slate-200/60 shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
          <CardHeader className="pt-10 pb-6 text-center">
            <div className="mx-auto w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-slate-950/20">
              <KeyRound className="text-orange-500 w-6 h-6" />
            </div>
            <CardTitle className="text-3xl font-black tracking-tighter text-slate-900 uppercase">
              Welcome <span className="text-orange-600">Back.</span>
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              Sign in to manage your music gear.
            </CardDescription>
          </CardHeader>

          <GoogleAuthButton mode="signin" />

          <CardContent className="pb-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="rounded-xl border-slate-200 focus:ring-orange-600 focus:border-orange-600 h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Password</label>
                  <Link href="/forgot-password" className="text-[10px] font-bold text-orange-600 hover:underline uppercase tracking-tighter">
                    Forgot?
                  </Link>
                </div>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="rounded-xl border-slate-200 focus:ring-orange-600 focus:border-orange-600 h-12 pr-12 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-950 hover:bg-orange-600 text-white py-6 rounded-xl font-bold text-base transition-all duration-300 shadow-lg hover:shadow-orange-600/20"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">or</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>



            <div className="mt-8 text-center text-sm font-medium text-slate-500">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-orange-600 hover:text-orange-700 font-bold transition-colors">
                Create one
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
