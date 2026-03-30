import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { authService, userService, balanceService } from '@/lib/firebase-service';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser, setFirebaseUser } = useAuthStore();
  const [mode, setMode] = useState<'login'|'signup'>('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', password:'' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        debugger
        const cred = await authService.signIn(form.email, form.password);
        const user = cred.user;

// 🔥 force token propagation
await user.getIdToken(true);
        const userData = await userService.getUser(cred.user.uid);
        if (!userData) { toast.error('Account not fully set up. Contact admin.'); setLoading(false); return; }
        setFirebaseUser(cred.user);
        setUser(userData);
        toast.success(`Welcome back, ${userData.displayName.split(' ')[0]}!`);
        navigate('/dashboard');
      } else {
        const cred = await authService.signUp(form.email, form.password, form.name);
        const newUser = {
          email: form.email,
          displayName: form.name,
          role: 'super_admin' as const,
          department: 'Administration',
          position: 'Super Admin',
          organizationId: cred.user.uid,
          joinDate: new Date().toISOString().split('T')[0],
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        await userService.createUser(cred.user.uid, newUser);
        await balanceService.initBalance(cred.user.uid, new Date().getFullYear(), {});
        setFirebaseUser(cred.user);
        setUser({ uid: cred.user.uid, ...newUser });
        toast.success('Organization created! Welcome to LeaveFlow.');
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-60" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0" style={{backgroundImage:'radial-gradient(circle at 1px 1px, rgba(99,102,241,0.08) 1px, transparent 0)', backgroundSize:'40px 40px'}} />

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-glow mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white">LeaveFlow</h1>
          <p className="text-slate-400 mt-1 text-sm">Professional Leave Management</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex bg-slate-800/80 rounded-xl p-1 mb-6">
            {(['login','signup'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode===m ? 'bg-brand-500 text-white shadow-glow-sm' : 'text-slate-400 hover:text-slate-200'}`}>
                {m === 'login' ? 'Sign In' : 'Create Org'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <Input label="Organization / Your Name" placeholder="Acme Corp" value={form.name}
                onChange={e => setForm({...form, name: e.target.value})} required />
            )}
            <Input label="Email Address" type="email" placeholder="admin@company.com" value={form.email}
              leftIcon={<Mail className="w-4 h-4" />}
              onChange={e => setForm({...form, email: e.target.value})} required />
            <div className="relative">
              <Input label="Password" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                leftIcon={<Lock className="w-4 h-4" />}
                onChange={e => setForm({...form, password: e.target.value})} required />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-9 text-slate-500 hover:text-slate-300 transition-colors">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button type="submit" className="w-full" loading={loading} size="lg">
              {mode === 'login' ? 'Sign In' : (
                <><Sparkles className="w-4 h-4" /> Create Organization</>
              )}
            </Button>
          </form>

          {mode === 'login' && (
            <div className="mt-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-xs text-slate-400 font-medium mb-2">Demo Accounts</p>
              <div className="space-y-1">
                {[
                  {role:'Super Admin', email:'superadmin@demo.com'},
                  {role:'HR Admin', email:'hr@demo.com'},
                  {role:'Manager', email:'manager@demo.com'},
                  {role:'Employee', email:'emp@demo.com'},
                ].map(d => (
                  <button key={d.email} onClick={() => setForm({...form, email:d.email, password:'demo123'})}
                    className="w-full text-left text-xs text-slate-500 hover:text-brand-400 transition-colors py-0.5">
                    <span className="text-slate-400">{d.role}:</span> {d.email}
                  </button>
                ))}
                <p className="text-xs text-slate-600 mt-1">Password: demo123</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
