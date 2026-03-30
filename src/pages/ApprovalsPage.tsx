import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, MessageSquare, Filter } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { useAuthStore } from '@/store/auth-store';
import { leaveService, notificationService, balanceService } from '@/lib/firebase-service';
import { LEAVE_TYPE_CONFIG, STATUS_CONFIG, formatDate } from '@/lib/utils';
import type { LeaveRequest } from '@/types';
import toast from 'react-hot-toast';

export default function ApprovalsPage() {
  const { user } = useAuthStore();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<LeaveRequest | null>(null);
  const [action, setAction] = useState<'approve'|'reject'|null>(null);
  const [comment, setComment] = useState('');
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) return;
    const fetchLeaves = async () => {
      const data = await leaveService.getPendingApprovals(user.uid, user.role, user.organizationId);
      setLeaves(data);
      setLoading(false);
    };
    fetchLeaves();
    const unsub = leaveService.subscribeToOrgLeaves(user.organizationId, (all) => {
      const pending = all.filter(l => {
        if (user.role === 'manager') return l.managerId === user.uid && l.status === 'pending';
        if (user.role === 'hr_admin' || user.role === 'super_admin') return l.status === 'manager_approved' || l.status === 'pending';
        return false;
      });
      setLeaves(pending);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const handleAction = async () => {
    if (!selected || !action || !user) return;
    setProcessing(true);
    try {
      const now = new Date().toISOString();
      const isHR = user.role === 'hr_admin' || user.role === 'super_admin';
      let newStatus: 'approved'|'rejected'|'manager_approved';
      
      if (action === 'approve') {
        if (isHR) {
          newStatus = 'approved';
          await balanceService.updateUsed(selected.userId, new Date().getFullYear(), selected.leaveType, selected.days);
        } else {
          newStatus = 'manager_approved';
        }
      } else {
        newStatus = 'rejected';
      }

      await leaveService.updateLeave(selected.id, {
        status: newStatus,
        ...(isHR ? { hrApprovedBy: user.uid, hrApprovedAt: now, hrComment: comment } 
                 : { managerApprovedBy: user.uid, managerApprovedAt: now, managerComment: comment }),
      });

      await notificationService.create({
        userId: selected.userId,
        title: `Leave ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        message: `Your ${LEAVE_TYPE_CONFIG[selected.leaveType].label} request has been ${action === 'approve' ? (isHR ? 'fully approved' : 'approved by manager') : 'rejected'}. ${comment ? `Note: ${comment}` : ''}`,
        type: action === 'approve' ? 'success' : 'error',
        isRead: false,
        relatedId: selected.id,
      });

      toast.success(`Leave ${action}d successfully`);
      setSelected(null); setAction(null); setComment('');
    } catch {
      toast.error('Action failed');
    } finally {
      setProcessing(false);
    }
  };

  const filtered = filter === 'all' ? leaves : leaves.filter(l => l.status === filter);

  return (
    <div>
      <Header title="Approvals" subtitle={`${leaves.length} pending request${leaves.length !== 1 ? 's' : ''}`} />
      <div className="p-8 space-y-4">
        <div className="flex gap-3">
          <Select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            options={[
              {value:'all', label:'All Pending'},
              {value:'pending', label:'Awaiting Manager'},
              {value:'manager_approved', label:'Awaiting HR'},
            ]}
            className="w-56"
          />
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <CheckCircle2 className="w-12 h-12 text-emerald-500/30 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">All caught up!</p>
              <p className="text-slate-600 text-sm mt-1">No pending approvals</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(l => {
              const cfg = LEAVE_TYPE_CONFIG[l.leaveType];
              const scfg = STATUS_CONFIG[l.status];
              return (
                <Card key={l.id} hover glow onClick={() => setSelected(l)}>
                  <CardContent className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${cfg.bgColor} flex items-center justify-center text-xl flex-shrink-0`}>{cfg.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-200">{l.userDisplayName}</p>
                        <span className="text-slate-600">·</span>
                        <p className="text-sm text-slate-400">{l.department}</p>
                      </div>
                      <p className="text-sm text-slate-400 mt-0.5">{cfg.icon} {cfg.label} · {l.days}d · {formatDate(l.startDate)} – {formatDate(l.endDate)}</p>
                      {l.reason && <p className="text-xs text-slate-500 mt-1 truncate">{l.reason}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <Badge dot dotColor={scfg.dotColor} className={`${scfg.bgColor} ${scfg.color}`}>{scfg.label}</Badge>
                      <p className="text-xs text-slate-600">{formatDate(l.createdAt, 'MMM dd')}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); setSelected(l); setAction('reject'); }}>
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </Button>
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); setSelected(l); setAction('approve'); }}>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={!!selected && !!action} onClose={() => { setSelected(null); setAction(null); setComment(''); }}
        title={`${action === 'approve' ? 'Approve' : 'Reject'} Leave Request`} size="sm">
        <div className="p-6 space-y-4">
          {selected && (
            <div className={`p-4 rounded-xl ${LEAVE_TYPE_CONFIG[selected.leaveType].bgColor} border border-slate-700/50`}>
              <p className="text-sm font-medium text-slate-200">{selected.userDisplayName}</p>
              <p className="text-xs text-slate-400 mt-1">{LEAVE_TYPE_CONFIG[selected.leaveType].label} · {selected.days} day(s)</p>
              <p className="text-xs text-slate-500">{formatDate(selected.startDate)} – {formatDate(selected.endDate)}</p>
            </div>
          )}
          <Textarea label="Comment (optional)" placeholder="Add a comment or reason..." value={comment}
            onChange={e => setComment(e.target.value)} rows={3} />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => { setSelected(null); setAction(null); }}>Cancel</Button>
            <Button
              className={`flex-1 ${action === 'reject' ? 'bg-red-500 hover:bg-red-600' : ''}`}
              loading={processing} onClick={handleAction}
            >
              {action === 'approve' ? <><CheckCircle2 className="w-4 h-4" /> Approve</> : <><XCircle className="w-4 h-4" /> Reject</>}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
