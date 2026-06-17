import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { UserRole } from '../../../types/auth';
import { Button } from '../../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Shield, GraduationCap, Users, User, Lock, Mail, BookOpen } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
    
    // Check if auth was successful (the store sets isAuthenticated)
    const { isAuthenticated, user } = useAuthStore.getState();
    if (isAuthenticated && user) {
      // Redirect based on role
      switch (user.role) {
        case 'super_admin':
        case 'admin':
          navigate('/dashboard');
          break;
        case 'teacher':
          navigate('/teacher');
          break;
        case 'parent':
          navigate('/parent');
          break;
        case 'student':
          navigate('/student');
          break;
        default:
          navigate('/dashboard');
      }
    }
  };

  const autofillDemo = (role: UserRole) => {
    setEmail(`${role}@camiedbehills.edu.gh`);
    setPassword(`${role}123`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
      {/* Premium Ambient Background Glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vh] rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vh] rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 blur-[120px] pointer-events-none" />
      
      {/* Dynamic Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 w-full max-w-6xl z-10">
        
        {/* Left column - Branding (Hidden on mobile/tablet viewport) */}
        <div className="hidden md:flex md:col-span-6 flex-col justify-center pr-4 text-left">
          {/* Circular Shield Badge */}
          <div className="w-28 h-28 flex items-center justify-center mb-6 hover:scale-[1.05] transition-transform duration-300 shrink-0">
            <img 
              src="/logo_transparent.png" 
              alt="Camied Behills Crest" 
              className="w-full h-full object-contain" 
            />
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-950 dark:text-white leading-tight font-heading">
            Camied Behills
            <span className="block text-sm font-bold text-primary-600 dark:text-primary-400 mt-2 uppercase tracking-widest font-body">
              International School
            </span>
          </h1>

          <h2 className="text-lg font-medium mt-4 text-slate-700 dark:text-slate-300 font-body">
            School Management System
          </h2>

          <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 max-w-md font-light leading-relaxed">
            Scientia Potestas Est — Knowledge is Power. Access your personalized portals, administrative tools, payroll structures, academic reporting, and campus canteen modules in one unified hub.
          </p>
          
          {/* Quick Demo Access Card */}
          <div className="mt-8 p-6 bg-white/65 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm max-w-md">
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <BookOpen size={12} />
              Quick Demo Access Accounts
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => autofillDemo('super_admin')}
                className="py-2.5 px-3 bg-white hover:bg-slate-50 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-all shadow-sm"
              >
                <Shield size={12} className="text-indigo-500" /> Admin Demo
              </button>
              <button
                type="button"
                onClick={() => autofillDemo('teacher')}
                className="py-2.5 px-3 bg-white hover:bg-slate-50 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-all shadow-sm"
              >
                <Users size={12} className="text-emerald-500" /> Teacher Demo
              </button>
              <button
                type="button"
                onClick={() => autofillDemo('parent')}
                className="py-2.5 px-3 bg-white hover:bg-slate-50 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-all shadow-sm"
              >
                <User size={12} className="text-amber-500" /> Parent Demo
              </button>
              <button
                type="button"
                onClick={() => autofillDemo('student')}
                className="py-2.5 px-3 bg-white hover:bg-slate-50 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-all shadow-sm"
              >
                <GraduationCap size={12} className="text-sky-500" /> Student Demo
              </button>
            </div>
          </div>
        </div>

        {/* Right column - Login Form Card */}
        <div className="col-span-1 md:col-span-6 flex flex-col justify-center items-center">
          {/* Mobile-only Branding Header */}
          <div className="flex md:hidden flex-col items-center text-center mb-6">
            <div className="w-16 h-16 flex items-center justify-center mb-3 shrink-0">
              <img src="/logo_transparent.png" alt="Camied Behills Crest" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">Camied Behills</h1>
            <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold uppercase tracking-wider">International School</p>
          </div>

          <Card glass className="w-full max-w-md border border-white/20 dark:border-slate-800/50 shadow-2xl rounded-2xl overflow-hidden p-6 sm:p-8">
            <CardHeader className="text-center pb-2 px-0 pt-0 border-none">
              <CardTitle className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">Welcome Back</CardTitle>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Sign in to your portal account</p>
            </CardHeader>
            <CardBody className="px-0 pb-0 pt-4">
              {error && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-450">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="e.g. admin@camiedbehills.edu.gh"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail size={18} />}
                  required
                />
                
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock size={18} />}
                  required
                />
                
                <div className="flex items-center justify-between mb-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 text-primary-600 focus:ring-primary-500" />
                    <span className="text-slate-500 dark:text-slate-400">Remember me</span>
                  </label>
                  <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold">Forgot password?</a>
                </div>

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-primary-600/10 hover:shadow-primary-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all" 
                  size="lg"
                  isLoading={isLoading}
                >
                  Sign In to Portal
                </Button>
              </form>

              {/* Mobile-only Quick Demo Access Drawer */}
              <div className="block md:hidden mt-6 pt-5 border-t border-slate-200/50 dark:border-slate-800/50">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center mb-3">
                  Quick Demo Access Accounts
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  <Button variant="secondary" size="sm" className="text-[10px] py-1.5" onClick={() => autofillDemo('super_admin')}>Admin</Button>
                  <Button variant="secondary" size="sm" className="text-[10px] py-1.5" onClick={() => autofillDemo('teacher')}>Teacher</Button>
                  <Button variant="secondary" size="sm" className="text-[10px] py-1.5" onClick={() => autofillDemo('parent')}>Parent</Button>
                  <Button variant="secondary" size="sm" className="text-[10px] py-1.5" onClick={() => autofillDemo('student')}>Student</Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
