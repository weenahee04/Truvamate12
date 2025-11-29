import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// ⚠️ TODO: ใส่ Firebase Config ของคุณที่นี่
// ไปที่ Firebase Console > Project Settings > Your Apps > Web App
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// User Profile Interface
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  createdAt: Date;
  wallet: number;
}

// Auth Service
export const authService = {
  // สมัครสมาชิก
  async register(email: string, password: string, displayName: string, phone?: string): Promise<UserProfile> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update display name
      await updateProfile(user, { displayName });
      
      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || email,
        displayName,
        phoneNumber: phone,
        createdAt: new Date(),
        wallet: 0
      };
      
      await setDoc(doc(db, 'users', user.uid), userProfile);
      
      return userProfile;
    } catch (error: any) {
      throw new Error(getErrorMessage(error.code));
    }
  },

  // เข้าสู่ระบบ
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      throw new Error(getErrorMessage(error.code));
    }
  },

  // เข้าสู่ระบบด้วย Google
  async loginWithGoogle(): Promise<User> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user profile exists, if not create one
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        const userProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'User',
          createdAt: new Date(),
          wallet: 0
        };
        await setDoc(doc(db, 'users', user.uid), userProfile);
      }
      
      return user;
    } catch (error: any) {
      throw new Error(getErrorMessage(error.code));
    }
  },

  // ออกจากระบบ
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error('เกิดข้อผิดพลาดในการออกจากระบบ');
    }
  },

  // ส่งอีเมลรีเซ็ตรหัสผ่าน
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(getErrorMessage(error.code));
    }
  },

  // ดึงข้อมูล User Profile
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  // ฟังการเปลี่ยนแปลง Auth State
  onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  }
};

// Error messages in Thai
function getErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'อีเมลนี้ถูกใช้งานแล้ว';
    case 'auth/invalid-email':
      return 'รูปแบบอีเมลไม่ถูกต้อง';
    case 'auth/operation-not-allowed':
      return 'การเข้าสู่ระบบถูกปิดใช้งาน';
    case 'auth/weak-password':
      return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    case 'auth/user-disabled':
      return 'บัญชีนี้ถูกระงับการใช้งาน';
    case 'auth/user-not-found':
      return 'ไม่พบบัญชีผู้ใช้นี้';
    case 'auth/wrong-password':
      return 'รหัสผ่านไม่ถูกต้อง';
    case 'auth/invalid-credential':
      return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
    case 'auth/too-many-requests':
      return 'มีการพยายามเข้าสู่ระบบมากเกินไป กรุณารอสักครู่';
    case 'auth/popup-closed-by-user':
      return 'การเข้าสู่ระบบถูกยกเลิก';
    default:
      return 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
  }
}

export default authService;
