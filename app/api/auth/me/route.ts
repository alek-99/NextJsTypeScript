
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

// export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Token tidak ditemukan" },
        { status: 401 }
      );
    }

    const token = authorization.substring(7);

    // Verifikasi token Firebase
    const decoded = await adminAuth.verifyIdToken(token, true);

    // Ambil data user Firestore
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
        { success: false, message: "Akun Anda telah dinonaktifkan" },
        { status: 403 }
      );
    }

    if (!["admin", "user"].includes(user?.role)) {
      return NextResponse.json(
        { success: false, message: "Role pengguna tidak valid" },
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

  } catch (error: unknown) {
    console.error("[AUTH ME ERROR]:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan autentikasi";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 401 }
    );
  }
}
