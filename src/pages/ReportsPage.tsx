import { useMemo } from 'react';
import { BarChart2, TrendingUp, Users, Calendar, Download } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOrgLeaves } from '@/hooks/useLeaves';
import { LEAVE_TYPE_CONFIG, STATUS_CONFIG, formatDate } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, subMonths } from 'date-fns';
import type { LeaveType, LeaveStatus } from '@/types';

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#06b6d4','#f59e0b','#10b981','#f97316'];

export default function ReportsPage() {
  const { leaves, loading } = useOrgLeaves();

  const monthlyData = useMemo(() => {
    return Array.from({length:6}, (_,i) => {
      const m = subMonths(new Date(), 5-i);
      const mStr = format(m,'yyyy-MM');
      const monthLeaves = leaves.filter(l => l.createdAt?.startsWith(mStr));
      return {
        month: format(m,'MMM yy'),
        approved: monthLeaves.filter(l => l.status === 'approved').length,
        pending: monthLeaves.filter(l => l.status === 'pending' || l.status === 'manager_approved').length,
        rejected: monthLeaves.filter(l => l.status === 'rejected').length,
      };
    });
  }, [leaves]);

  const leaveTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    leaves.filter(l => l.status === 'approved').forEach(l => {
      counts[l.leaveType] = (counts[l.leaveType] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      name: LEAVE_TYPE_CONFIG[type as LeaveType]?.label || type,
      value: count,
    }));
  }, [leaves]);

  const deptData = useMemo(() => {
    const depts: Record<string, number> = {};
    leaves.filter(l => l.status === 'approved').forEach(l => {
      depts[l.department] = (depts[l.department] || 0) + l.days;
    });
    return Object.entries(depts).sort((a,b) => b[1]-a[1]).slice(0,6).map(([dept, days]) => ({ dept, days }));
  }, [leaves]);

  const stats = useMemo(() => ({
    total: leaves.length,
    approved: leaves.filter(l => l.status === 'approved').length,
    pending: leaves.filter(l => l.status === 'pending' || l.status === 'manager_approved').length,
    totalDays: leaves.filter(l => l.status === 'approved').reduce((a,l) => a + l.days, 0),
  }), [leaves]);

  const downloadCSV = () => {
    const headers = ['Employee','Department','Leave Type','Start','End','Days','Status','Applied On'];
    const rows = leaves.map(l => [
      l.userDisplayName, l.department, LEAVE_TYPE_CONFIG[l.leaveType]?.label,
      formatDate(l.startDate), formatDate(l.endDate), l.days, STATUS_CONFIG[l.status]?.label,
      formatDate(l.createdAt),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `leave-report-${format(new Date(),'yyyy-MM-dd')}.csv`; a.click();
  };

  return (
    <div>
      <Header title="Reports" subtitle="Organization-wide leave analytics"
        action={{ label:'Export CSV', onClick: downloadCSV }} />
      <div className="p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {label:'Total Requests', value:stats.total, icon:Calendar, color:'text-brand-400'},
            {label:'Approved', value:stats.approved, icon:TrendingUp, color:'text-emerald-400'},
            {label:'Pending', value:stats.pending, icon:Users, color:'text-yellow-400'},
            {label:'Total Days', value:stats.totalDays, icon:BarChart2, color:'text-purple-400'},
          ].map((s, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-3">
                <s.icon className={`w-8 h-8 ${s.color} flex-shrink-0`} />
                <div>
                  <p className="text-2xl font-bold text-slate-100">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend */}
          <Card>
            <CardContent>
              <h2 className="font-semibold text-slate-100 mb-4">Monthly Breakdown</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData} barSize={20}>
                  <XAxis dataKey="month" tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{background:'#0f172a',border:'1px solid #1e293b',borderRadius:'12px',color:'#e2e8f0'}} />
                  <Bar dataKey="approved" fill="#10b981" radius={[4,4,0,0]} name="Approved" />
                  <Bar dataKey="pending" fill="#f59e0b" radius={[4,4,0,0]} name="Pending" />
                  <Bar dataKey="rejected" fill="#ef4444" radius={[4,4,0,0]} name="Rejected" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Leave Type Distribution */}
          <Card>
            <CardContent>
              <h2 className="font-semibold text-slate-100 mb-4">By Leave Type</h2>
              {leaveTypeData.length === 0 ? (
                <div className="flex items-center justify-center h-52 text-slate-600 text-sm">No approved leaves yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={leaveTypeData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {leaveTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{background:'#0f172a',border:'1px solid #1e293b',borderRadius:'12px',color:'#e2e8f0'}} />
                    <Legend formatter={(v) => <span style={{color:'#94a3b8',fontSize:'12px'}}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Dept breakdown */}
          <Card className="lg:col-span-2">
            <CardContent>
              <h2 className="font-semibold text-slate-100 mb-4">Days Taken by Department</h2>
              {deptData.length === 0 ? (
                <div className="text-center py-8 text-slate-600 text-sm">No data available</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={deptData} layout="vertical" barSize={16}>
                    <XAxis type="number" tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false} />
                    <YAxis dataKey="dept" type="category" tick={{fill:'#94a3b8',fontSize:12}} axisLine={false} tickLine={false} width={100} />
                    <Tooltip contentStyle={{background:'#0f172a',border:'1px solid #1e293b',borderRadius:'12px',color:'#e2e8f0'}} />
                    <Bar dataKey="days" fill="#6366f1" radius={[0,4,4,0]} name="Days" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent All Leaves Table */}
        <Card>
          <CardContent>
            <h2 className="font-semibold text-slate-100 mb-4">All Leave Records</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    {['Employee','Department','Type','Duration','Days','Status','Applied'].map(h => (
                      <th key={h} className="text-left py-3 px-2 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leaves.slice(0,20).map(l => {
                    const cfg = LEAVE_TYPE_CONFIG[l.leaveType];
                    const scfg = STATUS_CONFIG[l.status];
                    return (
                      <tr key={l.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-2 text-slate-300 font-medium">{l.userDisplayName}</td>
                        <td className="py-3 px-2 text-slate-500">{l.department}</td>
                        <td className="py-3 px-2"><span className={`${cfg.color} text-xs`}>{cfg.icon} {cfg.label}</span></td>
                        <td className="py-3 px-2 text-slate-500 text-xs">{formatDate(l.startDate,'MMM dd')} – {formatDate(l.endDate,'MMM dd')}</td>
                        <td className="py-3 px-2 text-brand-400 font-medium">{l.days}d</td>
                        <td className="py-3 px-2"><Badge dot dotColor={scfg.dotColor} className={`${scfg.bgColor} ${scfg.color} text-xs`}>{scfg.label}</Badge></td>
                        <td className="py-3 px-2 text-slate-600 text-xs">{formatDate(l.createdAt,'MMM dd')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
