import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle2, XCircle, Users, TrendingUp, Zap } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth-store';
import { useMyLeaves } from '@/hooks/useLeaves';
import { useBalance } from '@/hooks/useBalance';
import { LEAVE_TYPE_CONFIG, STATUS_CONFIG, formatDate } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, subMonths, startOfMonth } from 'date-fns';
import type { LeaveType } from '@/types';

const stagger = { hidden:{opacity:0,y:20}, show:{opacity:1,y:0} };

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { leaves, loading } = useMyLeaves();
  const { balance } = useBalance();

  const stats = useMemo(() => {
    const pending = leaves.filter(l => l.status === 'pending' || l.status === 'manager_approved').length;
    const approved = leaves.filter(l => l.status === 'approved').length;
    const rejected = leaves.filter(l => l.status === 'rejected').length;
    const totalDays = leaves.filter(l => l.status === 'approved').reduce((a,l) => a+l.days, 0);
    return { pending, approved, rejected, totalDays };
  }, [leaves]);

  const chartData = useMemo(() => {
    return Array.from({length:6}, (_,i) => {
      const m = subMonths(new Date(), 5-i);
      const mStr = format(m,'yyyy-MM');
      const count = leaves.filter(l => l.createdAt?.startsWith(mStr) && l.status==='approved').length;
      return { month: format(m,'MMM'), count };
    });
  }, [leaves]);

  const balanceItems = balance ? Object.entries(LEAVE_TYPE_CONFIG).map(([type, cfg]) => {
    const total = balance[type as LeaveType] || 0;
    const used = balance.used?.[type as LeaveType] || 0;
    const remaining = Math.max(0, total - used);
    return { type: type as LeaveType, cfg, total, used, remaining };
  }).filter(b => b.total > 0 && b.type !== 'unpaid') : [];

  const recentLeaves = leaves.slice(0, 5);

  return (
    <div>
      <Header
        title={`Good ${new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, ${user?.displayName?.split(' ')[0]} 👋`}
        subtitle={`${format(new Date(), 'EEEE, MMMM dd yyyy')} • ${user?.department}`}
      />
      <div className="p-8 space-y-6">

        {/* Stat cards */}
        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.08 }}}}
          initial="hidden" animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { label:'Pending', value: stats.pending, icon: Clock, color:'text-yellow-400', bg:'bg-yellow-500/10', border:'border-yellow-500/20' },
            { label:'Approved', value: stats.approved, icon: CheckCircle2, color:'text-emerald-400', bg:'bg-emerald-500/10', border:'border-emerald-500/20' },
            { label:'Rejected', value: stats.rejected, icon: XCircle, color:'text-red-400', bg:'bg-red-500/10', border:'border-red-500/20' },
            { label:'Days Taken', value: stats.totalDays, icon: Calendar, color:'text-brand-400', bg:'bg-brand-500/10', border:'border-brand-500/20' },
          ].map((s, i) => (
            <motion.div key={i} variants={stagger}>
              <Card className={`border ${s.border} ${s.bg}`}>
                <CardContent className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center flex-shrink-0`}>
                    <s.icon className={`w-6 h-6 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-100">{s.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leave Balance */}
          <Card className="lg:col-span-1">
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-100">Leave Balance</h2>
                <span className="text-xs text-slate-500">{new Date().getFullYear()}</span>
              </div>
              {balanceItems.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">No balance data. Contact HR.</p>
              ) : (
                <div className="space-y-3">
                  {balanceItems.map(({ type, cfg, total, used, remaining }) => (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{cfg.icon}</span>
                          <span className="text-xs font-medium text-slate-300">{cfg.label}</span>
                        </div>
                        <span className="text-xs text-slate-400">{remaining}/{total}</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${cfg.bgColor.replace('/20','')}`}
                          style={{ width: total > 0 ? `${(remaining/total)*100}%` : '0%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chart */}
          <Card className="lg:col-span-2">
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-100">Leave Trend</h2>
                <Badge variant="info" className="text-xs">Last 6 Months</Badge>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} barSize={28}>
                  <XAxis dataKey="month" tick={{fill:'#64748b', fontSize:12}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill:'#64748b', fontSize:12}} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{background:'#0f172a', border:'1px solid #1e293b', borderRadius:'12px', color:'#e2e8f0'}}
                    cursor={{fill:'rgba(99,102,241,0.05)'}}
                  />
                  <Bar dataKey="count" radius={[6,6,0,0]}>
                    {chartData.map((_,i) => (
                      <Cell key={i} fill={i === chartData.length-1 ? '#6366f1' : '#1e293b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Leaves */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-100">Recent Requests</h2>
              <a href="/leaves" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">View all →</a>
            </div>
            {recentLeaves.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No leave requests yet</p>
                <p className="text-slate-600 text-xs mt-1">Your recent requests will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentLeaves.map(l => {
                  const cfg = LEAVE_TYPE_CONFIG[l.leaveType];
                  const scfg = STATUS_CONFIG[l.status];
                  return (
                    <div key={l.id} className="flex items-center justify-between py-3 border-b border-slate-800/50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${cfg.bgColor} flex items-center justify-center text-base`}>{cfg.icon}</div>
                        <div>
                          <p className="text-sm font-medium text-slate-200">{cfg.label}</p>
                          <p className="text-xs text-slate-500">{formatDate(l.startDate)} — {formatDate(l.endDate)} · {l.days}d</p>
                        </div>
                      </div>
                      <Badge dot dotColor={scfg.dotColor} className={`${scfg.bgColor} ${scfg.color}`}>{scfg.label}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
