import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/config/firebase';
import { User, FirebaseError } from '@/types';

/**
 * Convert Firebase User to our User type
 */
const convertFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  // Get additional user data from Firestore
  const userDocRef = doc(db, 'users', firebaseUser.uid);
  const userDoc = await getDoc(userDocRef);
  const userData = userDoc.data();

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
    createdAt: userData?.createdAt?.toDate() || new Date(),
    lastLoginAt: userData?.lastLoginAt?.toDate() || new Date(),
  };
};

/**
 * Save or update user data in Firestore
 */
const saveUserToFirestore = async (firebaseUser: FirebaseUser, isNewUser = false) => {
  const userDocRef = doc(db, 'users', firebaseUser.uid);
  
  const userData = {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
    lastLoginAt: serverTimestamp(),
  };

  if (isNewUser) {
    // For new users, set createdAt timestamp
    await setDoc(userDocRef, {
      ...userData,
      createdAt: serverTimestamp(),
    });
  } else {
    // For existing users, only update lastLoginAt and other changeable fields
    await setDoc(userDocRef, userData, { merge: true });
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result: UserCredential = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    
    if (!firebaseUser) {
      throw new Error('No user data received from Google');
    }

    // Check if this is a new user
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    const isNewUser = !userDoc.exists();

    // Save user data to Firestore
    await saveUserToFirestore(firebaseUser, isNewUser);

    // Convert and return user data
    return await convertFirebaseUser(firebaseUser);
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Google sign-in error:', firebaseError);
    
    // Handle specific Firebase Auth errors
    switch (firebaseError.code) {
      case 'auth/popup-closed-by-user':
        throw new Error('Sign-in was cancelled. Please try again.');
      case 'auth/popup-blocked':
        throw new Error('Pop-up was blocked by your browser. Please allow pop-ups and try again.');
      case 'auth/network-request-failed':
        throw new Error('Network error. Please check your internet connection and try again.');
      case 'auth/too-many-requests':
        throw new Error('Too many failed attempts. Please try again later.');
      default:
        throw new Error(firebaseError.message || 'Failed to sign in with Google');
    }
  }
};

/**
 * Sign out current user
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Sign-out error:', firebaseError);
    throw new Error('Failed to sign out. Please try again.');
  }
};

/**
 * Get current user
 */
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      unsubscribe();
      if (firebaseUser) {
        try {
          const user = await convertFirebaseUser(firebaseUser);
          resolve(user);
        } catch (error) {
          console.error('Error converting Firebase user:', error);
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
};

/**
 * Subscribe to authentication state changes
 */
export const onAuthStateChange = (
  callback: (user: User | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        // Update last login time
        await saveUserToFirestore(firebaseUser, false);
        const user = await convertFirebaseUser(firebaseUser);
        callback(user);
      } catch (error) {
        console.error('Error in auth state change:', error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!auth.currentUser;
};

/**
 * Get current Firebase user (raw)
 */
export const getCurrentFirebaseUser = (): FirebaseUser | null => {
  return auth.currentUser;
};