'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, LogIn } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    // Simple mock logic for admin session
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/dashboard');
    }, 1200);
  };

  return (
    <div className="w-full max-w-md p-4 relative z-10">
      
      {/* Decorative floating icon */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 p-4 rounded-3xl bg-blue-600/30 border border-blue-500/30 text-white shadow-xl shadow-blue-500/20 backdrop-blur-md animate-float">
        <Shield className="h-8 w-8" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.2 }}
        className="glass-card rounded-3xl p-8 border border-white/20 dark:border-slate-800/60 shadow-2xl space-y-6"
      >
        <div className="text-center pt-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Admin Portal
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            Authenticate to enter control center
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              required
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-xs font-semibold transition"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type="password"
              required
              placeholder="Access Key"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-xs font-semibold transition"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center cursor-pointer"
          >
            {isSubmitting ? (
              'Authenticating...'
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-2" /> Sign In
              </>
            )}
          </button>
        </form>
      </motion.div>

    </div>
  );
}
