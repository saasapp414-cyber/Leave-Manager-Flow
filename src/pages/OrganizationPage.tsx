import { useState } from 'react';
import { Building2, Save, Users, Calendar, Settings2, Shield } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

const WORKING_DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function OrganizationPage() {
  const [saving, setSaving] = useState(false);
  const [workingDays, setWorkingDays] = useState([1,2,3,4,5]);
  const [policy, setPolicy] = useState({
    annual:21, sick:10, maternity:90, paternity:5, emergency:3, compensatory:5,
    carryForward:true, maxCarryForward:5, approvalFlow:'double',
  });

  const toggleDay = (d: number) => {
    setWorkingDays(prev => prev.includes(d) ? prev.filter(x=>x!==d) : [...prev,d].sort());
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    toast.success('Organization settings saved!');
  };

  return (
    <div>
      <Header title="Organization" subtitle="Configure company-wide settings and policies" />
      <div className="p-8">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Plan Badge */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-brand-500/20 to-purple-500/20 border border-brand-500/30">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-brand-400" />
              <div>
                <p className="font-semibold text-slate-200">Pro Plan</p>
                <p className="text-xs text-slate-400">Unlimited employees · Priority support</p>
              </div>
            </div>
            <Badge className="bg-brand-500/30 text-brand-300 border-brand-500/40">Active</Badge>
          </div>

          {/* Leave Policy */}
          <Card>
            <CardContent>
              <div className="flex items-center gap-2 mb-5">
                <Calendar className="w-5 h-5 text-brand-400" />
                <h2 className="font-semibold text-slate-100">Leave Policy (Days/Year)</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  {key:'annual',label:'Annual Leave'},
                  {key:'sick',label:'Sick Leave'},
                  {key:'maternity',label:'Maternity Leave'},
                  {key:'paternity',label:'Paternity Leave'},
                  {key:'emergency',label:'Emergency Leave'},
                  {key:'compensatory',label:'Compensatory'},
                ].map(({key,label}) => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">{label}</label>
                    <input type="number" min={0} max={365}
                      value={policy[key as keyof typeof policy] as number}
                      onChange={e => setPolicy({...policy, [key]: Number(e.target.value)})}
                      className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500/50"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-200">Carry Forward</p>
                    <p className="text-xs text-slate-500">Allow unused leaves to carry to next year</p>
                  </div>
                  <input type="checkbox" checked={policy.carryForward}
                    onChange={e => setPolicy({...policy, carryForward: e.target.checked})}
                    className="w-4 h-4 accent-brand-500" />
                </div>
                {policy.carryForward && (
                  <Input label="Max Carry Forward Days" type="number" value={policy.maxCarryForward}
                    onChange={e => setPolicy({...policy, maxCarryForward: Number(e.target.value)})} className="w-40" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Approval Flow */}
          <Card>
            <CardContent>
              <div className="flex items-center gap-2 mb-5">
                <Settings2 className="w-5 h-5 text-brand-400" />
                <h2 className="font-semibold text-slate-100">Approval Workflow</h2>
              </div>
              <div className="space-y-3">
                {[
                  { value:'single', label:'Single Level', desc:'HR Admin approves directly', icon:'1️⃣' },
                  { value:'double', label:'Two Level', desc:'Manager approves → HR approves', icon:'2️⃣' },
                  { value:'manager', label:'Manager Only', desc:'Manager is the final approver', icon:'👔' },
                ].map(opt => (
                  <label key={opt.value}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      policy.approvalFlow === opt.value
                        ? 'border-brand-500/50 bg-brand-500/10'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-800/30'
                    }`}>
                    <input type="radio" name="approvalFlow" value={opt.value}
                      checked={policy.approvalFlow === opt.value}
                      onChange={e => setPolicy({...policy, approvalFlow: e.target.value})}
                      className="accent-brand-500" />
                    <span className="text-lg">{opt.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{opt.label}</p>
                      <p className="text-xs text-slate-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Working Days */}
          <Card>
            <CardContent>
              <div className="flex items-center gap-2 mb-5">
                <Users className="w-5 h-5 text-brand-400" />
                <h2 className="font-semibold text-slate-100">Working Days</h2>
              </div>
              <div className="flex gap-2 flex-wrap">
                {WORKING_DAYS.map((d, i) => (
                  <button key={i} onClick={() => toggleDay(i)}
                    className={`w-12 h-12 rounded-xl text-sm font-medium transition-all ${
                      workingDays.includes(i)
                        ? 'bg-brand-500 text-white shadow-glow-sm'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}>
                    {d}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-3">{workingDays.length} working days per week</p>
            </CardContent>
          </Card>

          <Button onClick={handleSave} loading={saving} size="lg" className="w-full">
            <Save className="w-4 h-4" /> Save Organization Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
