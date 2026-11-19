
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function GET(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Token tidak ditemukan" },
        { status: 401 }
      );
    }

    const token = authorization.slice(7);

    // Verifikasi token Firebase
    const decoded = await adminAuth.verifyIdToken(token, true);

    const snapshot = await adminDb
      .collection("users")
      .doc(decoded.uid)
      .get();

    if (!snapshot.exists) {
      return NextResponse.json(
        { success: false, message: "Data pengguna tidak ditemukan" },
        { status: 403 }
      );
    }

    const user = snapshot.data();

    if (user?.status !== "aktif") {
      return NextResponse.json(
        { success: false, message: "Akun tidak aktif" },
        { status: 403 }
      );
    }

    if (!["admin", "user"].includes(user?.role)) {
      return NextResponse.json(
        { success: false, message: "Role tidak valid" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        uid: decoded.uid,
        nama: user.nama,
        email: user.email,
        alamat: user.alamat,
        jenisKelamin: user.jenisKelamin,
        role: user.role,
        status: user.status,
      },
    });

  } catch (error) {
    console.error("[AUTH ME ERROR]:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Sesi tidak valid atau telah kedaluwarsa",
      },
      { status: 401 }
    );
  }
}
