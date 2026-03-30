import { useState } from 'react';
import { Plus, Search, Users, Shield, MoreVertical, Mail, Phone } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { useAuthStore } from '@/store/auth-store';
import { userService, balanceService, authService } from '@/lib/firebase-service';
import { ROLE_CONFIG, getInitials } from '@/lib/utils';
import type { User, UserRole } from '@/types';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

const ROLE_OPTIONS = Object.entries(ROLE_CONFIG).map(([v,c]) => ({value:v, label:c.label}));
const DEPT_OPTIONS = ['Engineering','Product','Design','Marketing','Sales','HR','Finance','Operations','Legal'].map(d=>({value:d,label:d}));

export default function EmployeesPage() {
  const { user } = useAuthStore();
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [modal, setModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    displayName:'', email:'', password:'temp@1234', role:'employee' as UserRole,
    department:'Engineering', position:'', phone:'',
  });

  useEffect(() => {
    if (!user) return;
    const unsub = userService.subscribeToOrgUsers(user.organizationId, (data) => {
      setEmployees(data.filter(u => u.uid !== user.uid));
      setLoading(false);
    });
    return unsub;
  }, [user?.organizationId]);

  const filtered = employees.filter(e => {
    const matchSearch = e.displayName.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || e.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const cred = await authService.signUp(form.email, form.password, form.displayName);
      const newUser = {
        email: form.email, displayName: form.displayName, role: form.role,
        department: form.department, position: form.position, phone: form.phone,
        organizationId: user.organizationId, managerId: user.uid,
        joinDate: new Date().toISOString().split('T')[0], isActive: true,
        createdAt: new Date().toISOString(),
      };
      await userService.createUser(cred.user.uid, newUser);
      await balanceService.initBalance(cred.user.uid, new Date().getFullYear(), {});
      toast.success(`${form.displayName} added! They can login with temp@1234`);
      setModal(false);
      setForm({ displayName:'', email:'', password:'temp@1234', role:'employee', department:'Engineering', position:'', phone:'' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to add employee');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (emp: User) => {
    await userService.updateUser(emp.uid, { isActive: !emp.isActive });
    toast.success(`${emp.displayName} ${emp.isActive ? 'deactivated' : 'activated'}`);
  };

  return (
    <div>
      <Header title="Employees" subtitle={`${employees.length} team members`}
        action={{ label:'Add Employee', onClick: () => setModal(true) }} />
      <div className="p-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, department..."
              className="w-full bg-slate-900/80 border border-slate-800/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500/50" />
          </div>
          <Select options={[{value:'all',label:'All Roles'},...ROLE_OPTIONS]}
            value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="sm:w-48" />
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="text-center py-16">
            <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400">No employees found</p>
          </CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(emp => {
              const roleCfg = ROLE_CONFIG[emp.role];
              return (
                <Card key={emp.uid} hover glow>
                  <CardContent>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/30 to-brand-700/30 border border-brand-500/20 flex items-center justify-center text-brand-300 font-bold text-sm">
                          {getInitials(emp.displayName)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200">{emp.displayName}</p>
                          <p className="text-xs text-slate-500">{emp.position || emp.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${emp.isActive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                        <button onClick={() => toggleStatus(emp)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                          {emp.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Mail className="w-3 h-3" /> {emp.email}
                      </div>
                      {emp.phone && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Phone className="w-3 h-3" /> {emp.phone}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/50">
                      <Badge className="text-xs bg-slate-800 text-slate-400 border-slate-700">{emp.department}</Badge>
                      <Badge className={`text-xs ${roleCfg.color} bg-slate-800/50 border-slate-700/50`}>
                        <Shield className="w-3 h-3" /> {roleCfg.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Employee" size="md">
        <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Full Name" placeholder="Jane Smith" value={form.displayName}
              onChange={e => setForm({...form, displayName: e.target.value})} required className="col-span-2" />
            <Input label="Email" type="email" placeholder="jane@company.com" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})} required />
            <Input label="Temp Password" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} required />
            <Select label="Role" options={ROLE_OPTIONS} value={form.role}
              onChange={e => setForm({...form, role: e.target.value as UserRole})} />
            <Select label="Department" options={DEPT_OPTIONS} value={form.department}
              onChange={e => setForm({...form, department: e.target.value})} />
            <Input label="Position / Title" placeholder="Senior Engineer" value={form.position}
              onChange={e => setForm({...form, position: e.target.value})} className="col-span-2" />
            <Input label="Phone" placeholder="+91 98765 43210" value={form.phone}
              onChange={e => setForm({...form, phone: e.target.value})} className="col-span-2" />
          </div>
          <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-xs text-yellow-400">Employee will receive an email to set their password. They can login with the temp password initially.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={submitting}><Plus className="w-4 h-4" /> Add Employee</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
