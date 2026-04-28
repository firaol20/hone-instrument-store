'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';
import { KeyRound, Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.forgotPassword(email);
      if (response.data.success) {
        setIsSent(true);
        toast.success('Reset link sent to your email');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send reset link');
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
              Reset <span className="text-orange-600">Password.</span>
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              {isSent 
                ? "We've sent a recovery link to your inbox."
                : "Enter your email and we'll send you a link to get back into your account."}
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-10">
            {!isSent ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-xl border-slate-200 focus:ring-orange-600 focus:border-orange-600 h-12 pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-950 hover:bg-orange-600 text-white py-6 rounded-xl font-bold text-base transition-all duration-300 shadow-lg hover:shadow-orange-600/20"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            ) : (
              <div className="space-y-6 text-center">
                <div className="p-4 bg-orange-50 text-orange-900 rounded-xl border border-orange-200/50 text-sm font-medium leading-relaxed">
                  If an account exists for <span className="font-bold">{email}</span>, you will receive password reset instructions.
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSent(false)}
                  className="w-full py-6 rounded-xl font-bold border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Try a different email
                </Button>
              </div>
            )}

            <div className="mt-8 text-center">
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-orange-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to log in
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
