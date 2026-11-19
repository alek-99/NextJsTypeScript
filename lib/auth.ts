import { NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function verifyAdmin(req: NextRequest) {
  try {
    const token = req.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    if (!token) {
      return null;
    }

    const decoded = await adminAuth.verifyIdToken(token);

    const snapshot = await adminDb
      .collection("users")
      .doc(decoded.uid)
      .get();

    if (!snapshot.exists) return null;

    const user = snapshot.data();

    if (
      user?.role !== "admin" ||
      user?.status !== "aktif"
    ) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}