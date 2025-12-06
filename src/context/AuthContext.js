// src/context/AuthContext.js
import React, { useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase'; 
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null); 
  const [loading, setLoading] = useState(true);

  // Updated signup to accept additionalData (like documents)
  async function signup(email, password, fullName, role, additionalData = {}) {
    console.log("--- A. Inside AuthContext signup function ---"); 
    try {
      let finalRole = role.toLowerCase();
      if (finalRole === 'ngo') {
        finalRole = 'PendingNGO'; 
        console.log("Role set to PendingNGO");
      }

      console.log("--- B. Calling createUserWithEmailAndPassword... ---"); 
      const authUser = await createUserWithEmailAndPassword(auth, email, password);
      
      console.log("--- C. Auth user created. Saving to Firestore... ---"); 
      const userRef = doc(db, 'users', authUser.user.uid);
      
      // Merge basic info with any additional data (documents, phone, etc.)
      await setDoc(userRef, {
        uid: authUser.user.uid,
        email: email,
        fullName: fullName,
        role: finalRole,
        createdAt: new Date(),
        ...additionalData 
      });

      console.log("--- D. Firestore setDoc successful. ---"); 
      return authUser;
    } catch (err) {
      console.error("--- E. ERROR INSIDE AUTHCONTEXT: ---", err); 
      throw err; 
    }
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    setUserData(null); 
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          console.log("No user data found in Firestore!");
        }
      }
      setLoading(false);
    });

    return unsubscribe; 
  }, []);

  const value = {
    currentUser,
    userData,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}