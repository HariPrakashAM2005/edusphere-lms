'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, User, Mail, Lock, School, ShieldAlert, Sun, Moon, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import ParticleBackground from '../../components/animations/ParticleBackground';
import { useTheme } from 'next-themes';

export default function RegisterPage() {
  const router = useRouter();
  const { register, error, clearError } = useAuth();
  const { theme, setTheme } = useTheme();

  // Wizard Steps: 1 = Role & Institution, 2 = Profile, 3 = Credentials
  const [step, setStep] = useState(1);

  // Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [institution, setInstitution] = useState('NIT001');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleDarkMode = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Password Strength calculations
  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (!pwd) return { score: 0, text: 'Empty', color: 'bg-gray-200' };
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;

    switch (strength) {
      case 1: return { score: 1, text: 'Weak', color: 'bg-rose-500' };
      case 2: return { score: 2, text: 'Medium', color: 'bg-amber-500' };
      case 3: return { score: 3, text: 'Strong', color: 'bg-yellow-500' };
      case 4: return { score: 4, text: 'Excellent', color: 'bg-emerald-500' };
      default: return { score: 0, text: 'Very Weak', color: 'bg-rose-600' };
    }
  };

  const passwordStrength = getPasswordStrength(password);

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    clearError();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!firstName || !lastName || !email) {
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = (e: React.MouseEvent) => {
    e.preventDefault();
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) return;

    setIsSubmitting(true);
    clearError();

    const res = await register({
      firstName,
      lastName,
      email,
      password,
      role,
      institutionId: institution,
    });

    setIsSubmitting(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  };

  // Animation directions for step slides
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-hidden">
      <ParticleBackground color="rgba(14, 184, 166, " particleCount={40} />

      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-850 transition"
          aria-label="Toggle Dark Mode"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-650" />}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 mb-6">
        <h2 className="text-4xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
          EduSphere
        </h2>
        <p className="mt-2 text-xs font-bold text-gray-550 dark:text-gray-400 uppercase tracking-widest">
          National Learning Management System
        </p>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <Card glass className="p-8 border border-gray-250/50 dark:border-gray-850/60 !rounded-3xl shadow-xl overflow-hidden">
          
          {success ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-emerald-500/25 border border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10">
                <Check className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-xl font-black">Account Created!</h3>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Registration successful. Redirecting you to login...
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              
              {/* Error messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-2xl bg-rose-50 dark:bg-rose-950/20 p-4 border border-rose-150 dark:border-rose-900/40"
                  >
                    <div className="flex items-center">
                      <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-455 mr-2.5 flex-shrink-0" />
                      <p className="text-xs font-semibold text-rose-800 dark:text-rose-350">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Progress Indicator */}
              <div className="flex items-center justify-between mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center flex-1 last:flex-none">
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                        step === s
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-110'
                          : step > s
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                      }`}
                    >
                      {step > s ? <Check className="h-4 w-4" /> : s}
                    </div>
                    {s < 3 && (
                      <div
                        className={`h-0.5 flex-1 mx-2 transition-all ${
                          step > s ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-800'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Multi-step forms */}
              <div className="relative overflow-hidden min-h-[260px] flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5"
                    >
                      <div>
                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">
                          Account Role
                        </label>
                        <div className="grid grid-cols-3 gap-2.5">
                          {['STUDENT', 'FACULTY', 'INSTITUTION_ADMIN'].map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => setRole(r)}
                              className={`py-3 px-2 text-[10px] font-black border rounded-xl transition-all ${
                                role === r
                                  ? 'bg-gradient-to-r from-blue-600 to-indigo-650 border-blue-600 text-white shadow-md shadow-blue-500/10'
                                  : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
                              }`}
                            >
                              {r === 'INSTITUTION_ADMIN' ? 'ADMIN' : r}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="institution" className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">
                          Academic Institution
                        </label>
                        <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 p-1">
                          <select
                            id="institution"
                            value={institution}
                            onChange={(e) => setInstitution(e.target.value)}
                            className="w-full pl-4 pr-10 py-3 bg-transparent border-none outline-none text-xs font-semibold appearance-none cursor-pointer text-gray-800 dark:text-gray-100"
                          >
                            <option value="NIT001">National Institute of Technology (NIT001)</option>
                            <option value="IIT001">Indian Institute of Technology (IIT001)</option>
                          </select>
                          <School className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <Button onClick={handleNextStep} className="!px-6">
                          Continue <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="First Name"
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          icon={User}
                        />
                        <Input
                          label="Last Name"
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          icon={User}
                        />
                      </div>

                      <Input
                        label="Email Address"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        icon={Mail}
                      />

                      <div className="pt-4 flex justify-between">
                        <Button variant="outline" onClick={handlePrevStep}>
                          <ArrowLeft className="h-4 w-4 mr-2" /> Back
                        </Button>
                        <Button onClick={handleNextStep} disabled={!firstName || !lastName || !email} className="!px-6">
                          Continue <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5"
                    >
                      <Input
                        label="Password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        icon={Lock}
                      />

                      {/* Password Strength Meter */}
                      {password && (
                        <div className="space-y-1.5 px-1 animate-fade-in">
                          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider">
                            <span className="text-gray-400">Strength:</span>
                            <span className={passwordStrength.score >= 3 ? 'text-emerald-500' : 'text-amber-500'}>
                              {passwordStrength.text}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${passwordStrength.color} transition-all duration-300`}
                              style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="pt-4 flex justify-between">
                        <Button variant="outline" onClick={handlePrevStep}>
                          <ArrowLeft className="h-4 w-4 mr-2" /> Back
                        </Button>
                        <Button type="submit" disabled={isSubmitting || passwordStrength.score < 2} className="!px-6">
                          {isSubmitting ? 'Registering...' : <><UserPlus className="h-4 w-4 mr-2" /> Register</>}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="text-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/80">
                <p className="text-xs text-gray-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="font-extrabold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>

            </form>
          )}

        </Card>
      </div>
    </div>
  );
}
