import { useState } from 'react';
import { User, Bell, Shield, Building2, Save } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { userService } from '@/lib/firebase-service';
import toast from 'react-hot-toast';

const TABS = [
  { id:'profile', label:'Profile', icon: User },
  { id:'notifications', label:'Notifications', icon: Bell },
  { id:'security', label:'Security', icon: Shield },
];

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    displayName: user?.displayName || '',
    phone: user?.phone || '',
    department: user?.department || '',
    position: user?.position || '',
  });

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await userService.updateUser(user.uid, form);
      setUser({ ...user, ...form });
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update'); } finally { setSaving(false); }
  };

  return (
    <div>
      <Header title="Settings" subtitle="Manage your account and preferences" />
      <div className="p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex gap-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-1.5">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium flex-1 justify-center transition-all ${
                  tab === t.id ? 'bg-brand-500 text-white shadow-glow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}>
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>

          {tab === 'profile' && (
            <Card>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xl font-bold shadow-glow">
                    {user?.displayName?.split(' ').map((n:string) => n[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100">{user?.displayName}</p>
                    <p className="text-sm text-slate-500">{user?.email}</p>
                    <p className="text-xs text-brand-400 mt-0.5">{user?.role?.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Name" value={form.displayName} onChange={e => setForm({...form, displayName: e.target.value})} />
                  <Input label="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 98765 43210" />
                  <Input label="Department" value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
                  <Input label="Position / Title" value={form.position} onChange={e => setForm({...form, position: e.target.value})} />
                </div>
                <Button onClick={handleSave} loading={saving}><Save className="w-4 h-4" /> Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {tab === 'notifications' && (
            <Card>
              <CardContent className="space-y-4">
                <h2 className="font-medium text-slate-200">Notification Preferences</h2>
                {[
                  { label:'Leave approved', desc:'When your leave is approved by HR' },
                  { label:'Leave rejected', desc:'When your leave is rejected' },
                  { label:'New approval request', desc:'When someone applies under you' },
                  { label:'Leave balance reminder', desc:'Monthly balance summary' },
                ].map(n => (
                  <div key={n.label} className="flex items-center justify-between py-3 border-b border-slate-800/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{n.label}</p>
                      <p className="text-xs text-slate-500">{n.desc}</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-brand-500" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {tab === 'security' && (
            <Card>
              <CardContent className="space-y-4">
                <h2 className="font-medium text-slate-200">Security Settings</h2>
                <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
                  <p className="text-sm text-brand-300">Password changes are managed through Firebase Authentication. Use the forgot password flow on the login page to reset.</p>
                </div>
                <div className="space-y-3 pt-2">
                  {[
                    { label:'Two-Factor Authentication', desc:'Add extra security (via Firebase)', badge:'Coming Soon' },
                    { label:'Session Management', desc:'Manage active sessions', badge:'Pro' },
                    { label:'API Access', desc:'Generate API keys for integrations', badge:'Enterprise' },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between py-3 border-b border-slate-800/50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-200">{s.label}</p>
                        <p className="text-xs text-slate-500">{s.desc}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-lg bg-slate-800 text-slate-500 border border-slate-700">{s.badge}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
