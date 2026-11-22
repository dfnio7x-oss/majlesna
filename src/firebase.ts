import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  getAuth,
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  initializeAuth,
  signInWithPopup,
  signOut,
  type Auth,
} from 'firebase/auth';
import { doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import type { Language } from './types/game';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

function createResilientAuth(): Auth {
  if (typeof window === 'undefined') {
    return getAuth(app);
  }
  try {
    // Prefer IndexedDB & localStorage persistence with popupRedirectResolver instead of fragile sessionStorage redirects.
    return initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch {
    // Fallback cleanly if Auth was already initialized during module evaluation
    return getAuth(app);
  }
}

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = createResilientAuth();

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Firebase Firestore client is offline — verify firebase-applet-config.json.');
    }
    return false;
  }
}

/**
 * Primary Google Sign-In flow via direct popup (invoked synchronously inside click handlers
 * to preserve user-gesture context and avoid Brave/Safari sessionStorage partitioning errors
 * seen with signInWithRedirect).
 */
export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
}

export async function signOutFirebase() {
  return signOut(auth);
}

export function parseFirebaseAuthError(error: unknown, lang: Language): {
  code: string;
  message: string;
} {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code ?? '')
      : '';
  const rawMsg = error instanceof Error ? error.message : String(error ?? '');
  const isMissingInitialState =
    code === 'auth/missing-initial-state' || rawMsg.toLowerCase().includes('missing initial state');

  if (code === 'auth/popup-blocked') {
    return {
      code,
      message:
        lang === 'ar'
          ? 'قام المتصفح بحظر نافذة تسجيل Google المنبثقة. اسمح بالنوافذ المنبثقة لهذا الموقع (أو خفّف درع Brave مؤقتاً) ثم أعد المحاولة أو سجّل باسم المستخدم وكلمة المرور.'
          : 'Your browser blocked the Google sign-in popup. Allow popups for this site or sign in with username & password.',
    };
  }
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return {
      code,
      message:
        lang === 'ar'
          ? 'تم إغلاق نافذة تسجيل الدخول عبر Google قبل الاكتمال. اضغط للمحاولة مرة أخرى.'
          : 'Google sign-in popup was closed before completing. Tap to try again.',
    };
  }
  if (isMissingInitialState) {
    return {
      code: code || 'auth/missing-initial-state',
      message:
        lang === 'ar'
          ? 'تعذر قراءة حالة الجلسة بسبب عزل التخزين في المتصفح (مثل درع Brave). فعّل النوافذ المنبثقة وتخزين الموقع أو استخدم تسجيل الدخول باسم المستخدم وكلمة المرور.'
          : 'Browser storage partitioning blocked the auth session state (e.g. Brave Shields). Allow site cookies/popups or sign in with username & password.',
    };
  }
  if (code === 'auth/unauthorized-domain') {
    return {
      code,
      message:
        lang === 'ar'
          ? 'هذا النطاق غير مضاف في قائمة النطاقات المصرح بها في إعدادات Firebase Auth (Authorized Domains).'
          : 'This domain is not yet listed in Firebase Auth Authorized Domains.',
    };
  }
  if (code === 'auth/network-request-failed') {
    return {
      code,
      message:
        lang === 'ar'
          ? 'تعذر الاتصال بخدمة المصادقة. تحقق من اتصالك بالإنترنت وأعد المحاولة.'
          : 'Network error while contacting authentication service. Please check your connection.',
    };
  }
  if (code === 'auth/operation-not-supported-in-this-environment') {
    return {
      code,
      message:
        lang === 'ar'
          ? 'بيئة التصفح الحالية تمنع تخزين الجلسات (مثل وضع التصفح الخفي المقيد). افتح الصفحة في نافذة عادية أو استخدم اسم المستخدم وكلمة المرور.'
          : 'Storage is disabled in this browser context. Open in a normal tab or sign in with username & password.',
    };
  }

  return {
    code: code || 'auth/unknown',
    message:
      lang === 'ar'
        ? 'تعذر إكمال تسجيل Google. يمكنك المحاولة مجدداً أو المتابعة باسم المستخدم وكلمة المرور.'
        : 'Could not complete Google sign-in. You can retry or continue with username & password.',
  };
}

// Run startup connectivity check
if (typeof window !== 'undefined') {
  void testConnection();
}
