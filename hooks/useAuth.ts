
"use client";

import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth, authPersistence } from "@/lib/firebase/client";

interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    authPersistence
      .then(() => {
        if (cancelled) return;

        unsubscribe = onAuthStateChanged(
          auth,
          (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
          },
          () => {
            setUser(null);
            setLoading(false);
          }
        );
      })
      .catch((error) => {
        console.error("Auth persistence error:", error);
        setUser(null);
        setLoading(false);
      });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  return { user, loading };
}
