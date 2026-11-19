
import { NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function verifyAdmin(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return null;
    }

    const token = authorization.slice(7);

    const decoded = await adminAuth.verifyIdToken(token, true);

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
  } catch (error) {
    console.error("VERIFY ADMIN ERROR:", error);
    return null;
  }
}
