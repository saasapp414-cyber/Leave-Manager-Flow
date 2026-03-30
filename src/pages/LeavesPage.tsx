import { useState } from 'react';
import { Plus, Filter, Search, Calendar } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/auth-store';
import { useMyLeaves } from '@/hooks/useLeaves';
import { useBalance } from '@/hooks/useBalance';
import { leaveService, notificationService, balanceService } from '@/lib/firebase-service';
import { LEAVE_TYPE_CONFIG, STATUS_CONFIG, formatDate, calculateWorkingDays } from '@/lib/utils';
import type { LeaveType, LeaveStatus } from '@/types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const LEAVE_TYPE_OPTIONS = Object.entries(LEAVE_TYPE_CONFIG).map(([v,c]) => ({value:v, label:`${c.icon} ${c.label}`}));
const STATUS_FILTER_OPTIONS = [
  {value:'all', label:'All Status'},
  ...Object.entries(STATUS_CONFIG).map(([v,c]) => ({value:v, label:c.label})),
];

export default function LeavesPage() {
  const { user } = useAuthStore();
  const { leaves, loading } = useMyLeaves();
  const { balance } = useBalance();
  const [modal, setModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState({
    leaveType: 'annual' as LeaveType,
    startDate: '', endDate: '', reason: '', isHalfDay: false, halfDayPeriod: 'morning' as 'morning'|'afternoon' | null,
  });

  const days = form.startDate && form.endDate ? calculateWorkingDays(form.startDate, form.endDate) : 0;

  const filtered = leaves.filter(l => {
    const matchSearch = l.leaveType.includes(search.toLowerCase()) || l.reason?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.startDate || !form.endDate) return;
    if (days <= 0) { toast.error('Please select valid dates (no weekends)'); return; }
    const bal = balance?.[form.leaveType] || 0;
    const used = balance?.used?.[form.leaveType] || 0;
    if (form.leaveType !== 'unpaid' && (bal - used) < days) {
      toast.error('Insufficient leave balance'); return;
    }
    setSubmitting(true);
    try {
      await leaveService.createLeave({
        userId: user.uid,
        userDisplayName: user.displayName,
        userEmail: user.email,
        department: user.department,
        leaveType: form.leaveType,
        startDate: form.startDate,
        endDate: form.endDate,
        days: form.isHalfDay ? 0.5 : days,
        reason: form.reason,
        status: 'pending',
        managerId: user.managerId || user.uid,
        isHalfDay: form.isHalfDay,
        halfDayPeriod: form.isHalfDay ? form.halfDayPeriod : null,
        organizationId: user.organizationId,
      });
      toast.success('Leave request submitted!');
      setModal(false);
      setForm({ leaveType:'annual', startDate:'', endDate:'', reason:'', isHalfDay:false, halfDayPeriod:'morning' });
    } catch (err) {
      toast.error('Failed to submit request');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (leaveId: string) => {
    try {
      await leaveService.updateLeave(leaveId, { status:'cancelled' });
      toast.success('Leave cancelled');
    } catch { toast.error('Failed to cancel'); }
  };

  return (
    <div>
      <Header title="My Leaves" subtitle="Track and manage your leave requests"
        action={{ label:'Request Leave', onClick:() => setModal(true) }} />
      <div className="p-8 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search leaves..."
              className="w-full bg-slate-900/80 border border-slate-800/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500/50"
            />
          </div>
          <Select options={STATUS_FILTER_OPTIONS} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="sm:w-48" />
        </div>

        {/* Leave Cards */}
        {loading ? (
          <div className="text-center py-16 text-slate-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No leaves found</p>
              <p className="text-slate-600 text-sm mt-1">Submit a new request to get started</p>
              <Button className="mt-4" onClick={() => setModal(true)}><Plus className="w-4 h-4" /> Request Leave</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(l => {
              const cfg = LEAVE_TYPE_CONFIG[l.leaveType];
              const scfg = STATUS_CONFIG[l.status];
              return (
                <Card key={l.id} hover>
                  <CardContent className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${cfg.bgColor} flex items-center justify-center text-xl flex-shrink-0`}>{cfg.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-slate-200">{cfg.label}</p>
                        {l.isHalfDay && <Badge className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">Half Day</Badge>}
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {formatDate(l.startDate)} — {formatDate(l.endDate)} · <span className="text-brand-400">{l.days}d</span>
                      </p>
                      {l.reason && <p className="text-xs text-slate-600 mt-1 truncate">{l.reason}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge dot dotColor={scfg.dotColor} className={`${scfg.bgColor} ${scfg.color}`}>{scfg.label}</Badge>
                      <p className="text-xs text-slate-600">{formatDate(l.createdAt, 'MMM dd')}</p>
                      {l.status === 'pending' && (
                        <button onClick={() => handleCancel(l.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Cancel</button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Request Leave" size="md">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Select label="Leave Type" options={LEAVE_TYPE_OPTIONS} value={form.leaveType}
            onChange={e => setForm({...form, leaveType: e.target.value as LeaveType})} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" type="date" value={form.startDate}
              onChange={e => setForm({...form, startDate: e.target.value})} required
              min={format(new Date(), 'yyyy-MM-dd')} />
            <Input label="End Date" type="date" value={form.endDate}
              onChange={e => setForm({...form, endDate: e.target.value})} required
              min={form.startDate || format(new Date(), 'yyyy-MM-dd')} />
          </div>
          {days > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-500/10 border border-brand-500/20">
              <Calendar className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <p className="text-sm text-brand-300">{form.isHalfDay ? 0.5 : days} working day{days > 1 && !form.isHalfDay ? 's' : ''} requested</p>
            </div>
          )}
          <div className="flex items-center gap-3">
            <input type="checkbox" id="halfday" checked={form.isHalfDay}
              onChange={e => setForm({...form, isHalfDay: e.target.checked})}
              className="w-4 h-4 rounded accent-brand-500" />
            <label htmlFor="halfday" className="text-sm text-slate-300">Half Day</label>
            {form.isHalfDay && (
              <Select options={[{value:'morning',label:'Morning'},{value:'afternoon',label:'Afternoon'}]}
                value={form.halfDayPeriod}
                onChange={e => setForm({...form, halfDayPeriod: e.target.value as 'morning'|'afternoon'})}
                className="flex-1" />
            )}
          </div>
          <Textarea label="Reason" placeholder="Briefly describe the reason..." value={form.reason}
            onChange={e => setForm({...form, reason: e.target.value})} rows={3} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={submitting}>Submit Request</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
