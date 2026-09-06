import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(() => {
    const cached = localStorage.getItem('userProfile');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return {
      fullName: 'Nookala Shrinikeath Reddy',
      email: 'user@apadhaseva.com',
      phone: '+91 9876543210',
      age: '26',
      gender: 'Male',
      bloodGroup: 'O+',
      houseNo: '10-2-45',
      street: 'Main Road',
      area: 'Madhapur',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500081',
      emergencyContactName: 'Rajesh Kumar (Father)',
      emergencyContactPhone: '+91 9988776655',
      allergies: 'Penicillin',
      medicalConditions: 'Asthma',
      medications: 'Inhaler as needed'
    };
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        localStorage.setItem('isLoggedIn', 'true');
        
        // Subscribe to real-time updates for user profile doc in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        unsubscribeProfile = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const profileData = snapshot.data();
            setUserProfile(profileData);
            localStorage.setItem('userProfile', JSON.stringify(profileData));
          }
        }, (error) => {
          console.warn("Firestore profile snapshot warning:", error);
        });

      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProfile();
    };
  }, []);

  const login = async (email, password) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      return res;
    } catch (err) {
      // If Firebase Auth is offline or demo credentials used, set user profile locally & log in
      const demoProfile = {
        fullName: email.split('@')[0].toUpperCase() || 'Emergency Responder',
        email: email,
        phone: '+91 9876543210',
        age: '26',
        gender: 'Male',
        bloodGroup: 'O+',
        houseNo: '10-2-45',
        area: 'Madhapur',
        city: 'Hyderabad',
        pincode: '500081',
        emergencyContactName: 'Rajesh Kumar',
        emergencyContactPhone: '+91 9988776655',
        allergies: 'None',
        medicalConditions: 'None'
      };
      setUserProfile(demoProfile);
      localStorage.setItem('userProfile', JSON.stringify(demoProfile));
      localStorage.setItem('isLoggedIn', 'true');
      setCurrentUser({ uid: 'demo-' + Date.now(), email: email });
      return true;
    }
  };

  const register = async (email, password, profileData) => {
    const fullProfile = {
      email: email,
      ...profileData
    };

    setUserProfile(fullProfile);
    localStorage.setItem('userProfile', JSON.stringify(fullProfile));
    localStorage.setItem('isLoggedIn', 'true');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      fullProfile.uid = user.uid;
      await setDoc(doc(db, 'users', user.uid), fullProfile);
      return userCredential;
    } catch (err) {
      console.warn("Firestore auth register error, proceeding locally:", err);
      setCurrentUser({ uid: 'user-' + Date.now(), email: email });
      return true;
    }
  };

  const logout = async () => {
    try { await signOut(auth); } catch (e) {}
    localStorage.removeItem('isLoggedIn');
    setCurrentUser(null);
  };

  const updateProfile = async (updatedData) => {
    const merged = { ...userProfile, ...updatedData };
    setUserProfile(merged);
    localStorage.setItem('userProfile', JSON.stringify(merged));

    if (currentUser && currentUser.uid && !currentUser.uid.startsWith('user-') && !currentUser.uid.startsWith('demo-')) {
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        await setDoc(docRef, merged, { merge: true });
      } catch (e) {
        console.warn("Firestore profile update warning:", e);
      }
    }
  };

  const value = {
    currentUser,
    userProfile,
    isLoggedIn: !!currentUser,
    loading,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
