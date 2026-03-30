export type UserRole = 'employee' | 'manager' | 'hr_admin' | 'super_admin';

export type LeaveType = 
  | 'annual' 
  | 'sick' 
  | 'maternity' 
  | 'paternity' 
  | 'unpaid' 
  | 'emergency'
  | 'compensatory';

export type LeaveStatus = 'pending' | 'manager_approved' | 'approved' | 'rejected' | 'cancelled';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  department: string;
  position: string;
  managerId?: string;
  organizationId: string;
  joinDate: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface LeaveBalance {
  userId: string;
  year: number;
  annual: number;
  sick: number;
  maternity: number;
  paternity: number;
  unpaid: number;
  emergency: number;
  compensatory: number;
  used: Record<LeaveType, number>;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userDisplayName: string;
  userEmail: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  managerId?: string;
  managerApprovedBy?: string;
  managerApprovedAt?: string;
  managerComment?: string;
  hrApprovedBy?: string;
  hrApprovedAt?: string;
  hrComment?: string;
  attachmentURL?: string;
  isHalfDay: boolean;
  halfDayPeriod?: 'morning' | 'afternoon' | '';
  createdAt: string;
  updatedAt: string;
  organizationId: string;
}

export interface Organization {
  id: string;
  name: string;
  logo?: string;
  domain?: string;
  plan: 'free' | 'pro' | 'enterprise';
  settings: OrgSettings;
  createdAt: string;
}

export interface OrgSettings {
  workingDays: number[];
  holidays: Holiday[];
  leavePolicy: LeavePolicy;
  requireAttachment: boolean;
  autoApproveAfterDays?: number;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'national' | 'regional' | 'company';
}

export interface LeavePolicy {
  annual: number;
  sick: number;
  maternity: number;
  paternity: number;
  emergency: number;
  compensatory: number;
  carryForward: boolean;
  maxCarryForward: number;
  approvalFlow: 'single' | 'double';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalEmployees: number;
  onLeaveToday: number;
  pendingApprovals: number;
  leavesThisMonth: number;
}
