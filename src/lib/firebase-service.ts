import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, onSnapshot, Timestamp, setDoc, limit,
  QueryConstraint, serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, signOut, updateProfile
} from 'firebase/auth';
import { db, auth, storage, googleProvider } from './firebase';
import type { User, LeaveRequest, LeaveBalance, Organization, Notification, LeaveType } from '@/types';
import { generateId } from './utils';

// AUTH
export const authService = {
  async signIn(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  },
  async signUp(email: string, password: string, displayName: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    return cred;
  },
  async signInWithGoogle() {
    return signInWithPopup(auth, googleProvider);
  },
  async signOut() {
    return signOut(auth);
  },
};

// USERS
export const userService = {
  async getUser(uid: string): Promise<User | null> {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? { uid: snap.id, ...snap.data() } as User : null;
  },
  async createUser(uid: string, userData: Omit<User, 'uid'>) {
    await setDoc(doc(db, 'users', uid), { ...userData, createdAt: new Date().toISOString() });
  },
  async updateUser(uid: string, data: Partial<User>) {
    await updateDoc(doc(db, 'users', uid), data);
  },
  async getOrganizationUsers(organizationId: string): Promise<User[]> {
    const q = query(collection(db, 'users'), where('organizationId', '==', organizationId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ uid: d.id, ...d.data() }) as User);
  },
  subscribeToOrgUsers(organizationId: string, cb: (users: User[]) => void) {
    const q = query(collection(db, 'users'), where('organizationId', '==', organizationId));
    return onSnapshot(q, snap => cb(snap.docs.map(d => ({ uid: d.id, ...d.data() }) as User)));
  },
};

// LEAVE REQUESTS
export const leaveService = {
  async createLeave(data: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'>) {
    const ref = await addDoc(collection(db, 'leaves'), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return ref.id;
  },
  async updateLeave(id: string, data: Partial<LeaveRequest>) {
    await updateDoc(doc(db, 'leaves', id), { ...data, updatedAt: new Date().toISOString() });
  },
  async getUserLeaves(userId: string): Promise<LeaveRequest[]> {
    const q = query(collection(db, 'leaves'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as LeaveRequest);
  },
  async getOrgLeaves(organizationId: string): Promise<LeaveRequest[]> {
    const q = query(collection(db, 'leaves'), where('organizationId', '==', organizationId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as LeaveRequest);
  },
  async getPendingApprovals(managerId: string, role: string, organizationId: string): Promise<LeaveRequest[]> {
    let constraints: QueryConstraint[] = [where('organizationId', '==', organizationId)];
    if (role === 'manager') {
      constraints.push(where('managerId', '==', managerId), where('status', '==', 'pending'));
    } else {
      constraints.push(where('status', '==', 'manager_approved'));
    }
    const q = query(collection(db, 'leaves'), ...constraints, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as LeaveRequest);
  },
  subscribeToUserLeaves(userId: string, cb: (leaves: LeaveRequest[]) => void) {
    const q = query(collection(db, 'leaves'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }) as LeaveRequest)));
  },
  subscribeToOrgLeaves(organizationId: string, cb: (leaves: LeaveRequest[]) => void) {
    const q = query(collection(db, 'leaves'), where('organizationId', '==', organizationId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }) as LeaveRequest)));
  },
};

// LEAVE BALANCE
export const balanceService = {
  async getBalance(userId: string, year: number): Promise<LeaveBalance | null> {
    const id = `${userId}_${year}`;
    const snap = await getDoc(doc(db, 'leave_balances', id));
    return snap.exists() ? snap.data() as LeaveBalance : null;
  },
  async initBalance(userId: string, year: number, policy: any): Promise<void> {
    const id = `${userId}_${year}`;
    const balance: LeaveBalance = {
      userId, year,
      annual: policy.annual || 21,
      sick: policy.sick || 10,
      maternity: policy.maternity || 90,
      paternity: policy.paternity || 5,
      unpaid: policy.unpaid || 999,
      emergency: policy.emergency || 3,
      compensatory: policy.compensatory || 5,
      used: { annual: 0, sick: 0, maternity: 0, paternity: 0, unpaid: 0, emergency: 0, compensatory: 0 },
    };
    await setDoc(doc(db, 'leave_balances', id), balance);
  },
  async updateUsed(userId: string, year: number, leaveType: LeaveType, days: number) {
    const id = `${userId}_${year}`;
    const snap = await getDoc(doc(db, 'leave_balances', id));
    if (snap.exists()) {
      const data = snap.data() as LeaveBalance;
      const used = { ...data.used, [leaveType]: (data.used[leaveType] || 0) + days };
      await updateDoc(doc(db, 'leave_balances', id), { used });
    }
  },
  subscribeToBalance(userId: string, year: number, cb: (b: LeaveBalance | null) => void) {
    const id = `${userId}_${year}`;
    return onSnapshot(doc(db, 'leave_balances', id), snap => {
      cb(snap.exists() ? snap.data() as LeaveBalance : null);
    });
  },
};

// NOTIFICATIONS
export const notificationService = {
  async create(data: Omit<Notification, 'id' | 'createdAt'>) {
    await addDoc(collection(db, 'notifications'), { ...data, createdAt: new Date().toISOString() });
  },
  async markRead(id: string) {
    await updateDoc(doc(db, 'notifications', id), { isRead: true });
  },
  subscribeToNotifications(userId: string, cb: (notifs: Notification[]) => void) {
    const q = query(collection(db, 'notifications'), where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(20));
    return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Notification)));
  },
};

// FILE UPLOAD
export const uploadFile = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
