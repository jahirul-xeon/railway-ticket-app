import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export type Profile = {
  uid: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
};

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  initializing: boolean;
  signup: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: {
    firstName: string;
    lastName: string;
    phone: string;
  }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function loadProfile(uid: string): Promise<Profile | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    const d = snap.data() as Omit<Profile, 'uid' | 'fullName'>;
    return {
      uid,
      firstName: d.firstName ?? '',
      lastName: d.lastName ?? '',
      fullName: `${d.firstName ?? ''} ${d.lastName ?? ''}`.trim(),
      email: d.email ?? '',
      phone: d.phone ?? '',
    };
  } catch (e) {
    // Most likely a Firestore rules / permissions issue — don't let it
    // bubble up as an unhandled rejection from the auth listener.
    console.warn('loadProfile failed:', (e as Error)?.message);
    return null;
  }
}

// If a signed-in user has no users/{uid} document (e.g. it failed to write
// during signup because Firestore rules were locked), recreate it from the
// Auth displayName so the profile shows names again.
async function healProfile(u: User): Promise<Profile | null> {
  try {
    const parts = (u.displayName ?? '').trim().split(/\s+/).filter(Boolean);
    const firstName = parts[0] ?? '';
    const lastName = parts.slice(1).join(' ');
    await setDoc(
      doc(db, 'users', u.uid),
      { firstName, lastName, email: u.email ?? '', phone: '', createdAt: serverTimestamp() },
      { merge: true }
    );
    return {
      uid: u.uid,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim(),
      email: u.email ?? '',
      phone: '',
    };
  } catch {
    return null;
  }
}

async function resolveProfile(u: User): Promise<Profile | null> {
  const existing = await loadProfile(u.uid);
  if (existing) return existing;
  return healProfile(u);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setProfile(u ? await resolveProfile(u) : null);
      setInitializing(false);
    });
    return unsub;
  }, []);

  const signup: AuthContextValue['signup'] = async ({
    firstName,
    lastName,
    email,
    phone,
    password,
  }) => {
    const cred = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );
    const fullName = `${firstName} ${lastName}`.trim();
    await updateProfile(cred.user, { displayName: fullName });
    // users table equivalent (firstName, lastName, Email, Phone).
    await setDoc(doc(db, 'users', cred.user.uid), {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      createdAt: serverTimestamp(),
    });
    setProfile(await loadProfile(cred.user.uid));
  };

  const login: AuthContextValue['login'] = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    setProfile(await loadProfile(cred.user.uid));
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserProfile: AuthContextValue['updateUserProfile'] = async ({
    firstName,
    lastName,
    phone,
  }) => {
    if (!auth.currentUser) throw new Error('Not signed in.');
    const uid = auth.currentUser.uid;
    const fullName = `${firstName} ${lastName}`.trim();
    await setDoc(
      doc(db, 'users', uid),
      { firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim() },
      { merge: true }
    );
    await updateProfile(auth.currentUser, { displayName: fullName });
    setProfile((prev) => ({
      uid,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName,
      email: prev?.email ?? auth.currentUser?.email ?? '',
      phone: phone.trim(),
    }));
  };

  const value = useMemo(
    () => ({ user, profile, initializing, signup, login, logout, updateUserProfile }),
    [user, profile, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
