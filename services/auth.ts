
import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase/config";
import { UserData } from "@/types/user";

export async function login(email: string, password: string) {
  try {
    //  Login Firebase Authentication
    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    const firebaseUser = credential.user;

    console.log("AUTH BERHASIL:", firebaseUser.uid);

    //  Ambil data pengguna dari Firestore
    const userRef = doc(db, "user", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    console.log("FIRESTORE DOCUMENT:", userSnap.exists());

    // Validasi dokumen pengguna
    if (!userSnap.exists()) {
      await signOut(auth);
      throw new Error(
        "Dokumen pengguna tidak ditemukan di Firestore"
      );
    }

    //  Ambil data pengguna
    const userData = userSnap.data();

    console.log("USER DATA:", userData);

    // Validasi role
    if (!["admin", "user"].includes(userData.role)) {
      await signOut(auth);
      throw new Error("Role pengguna tidak valid");
    }

    // Return data pengguna
    return {
      uid: firebaseUser.uid,
      name: userData.name ?? "",
      email: firebaseUser.email ?? "",
      role: userData.role,
    } as UserData;

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    throw error;
  }
}

export async function logout() {
  await signOut(auth);
}
