'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';
import { KeyRound, Lock, ArrowRight } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token');
      router.push('/login');
    }
  }, [token, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (passwords.password !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!token) return;

    setLoading(true);
    try {
      const response = await authAPI.resetPassword(token, passwords.password);
      if (response.data.success) {
        setIsSuccess(true);
        toast.success('Password updated successfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <Card className="w-full max-w-md border-slate-200/60 shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
      <CardHeader className="pt-10 pb-6 text-center">
        <div className="mx-auto w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-slate-950/20">
          <KeyRound className="text-orange-500 w-6 h-6" />
        </div>
        <CardTitle className="text-3xl font-black tracking-tighter text-slate-900 uppercase">
          New <span className="text-orange-600">Password.</span>
        </CardTitle>
        <CardDescription className="text-slate-500 font-medium">
          {isSuccess 
            ? "Your password has been successfully reset!"
            : "Please enter a new password for your account."}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-10">
        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={passwords.password}
                  onChange={handleInputChange}
                  className="rounded-xl border-slate-200 focus:ring-orange-600 focus:border-orange-600 h-12 pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={passwords.confirmPassword}
                  onChange={handleInputChange}
                  className="rounded-xl border-slate-200 focus:ring-orange-600 focus:border-orange-600 h-12 pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-950 hover:bg-orange-600 text-white py-6 rounded-xl font-bold text-base transition-all duration-300 shadow-lg hover:shadow-orange-600/20 mt-4"
            >
              {loading ? 'Reseting...' : 'Reset Password'}
            </Button>
          </form>
        ) : (
          <div className="space-y-6 text-center">
            <Button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full bg-orange-600 hover:bg-slate-950 text-white py-6 rounded-xl font-bold text-base transition-all duration-300 shadow-lg group"
            >
              Continue to Login
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100/50 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-100 rounded-full blur-[100px] -z-10" />

        <Suspense fallback={
          <div className="w-full max-w-md p-8 text-center bg-white rounded-3xl shadow-xl">
            <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Security Context...</p>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </main>
    </div>
  );
}
