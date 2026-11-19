import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { verifyAdmin } from "@/lib/auth";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);

  if (!admin) {
    return NextResponse.json(
      { message: "Akses ditolak" },
      { status: 403 }
    );
  }

  const snapshot = await adminDb.collection("users").get();

  const users = snapshot.docs.map((doc) => ({
    uid: doc.id,
    ...doc.data(),
  }));

  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);

  if (!admin) {
    return NextResponse.json(
      { message: "Akses ditolak" },
      { status: 403 }
    );
  }

  try {
    const {
      nama,
      email,
      password,
      alamat,
      jenisKelamin,
      status,
    } = await req.json();

    if (
      !nama?.trim() ||
      !email?.trim() ||
      !password ||
      !alamat?.trim() ||
      !["L", "P"].includes(jenisKelamin) ||
      !["aktif", "nonaktif"].includes(status)
    ) {
      return NextResponse.json(
        { message: "Data tidak lengkap atau tidak valid" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    const userRecord = await adminAuth.createUser({
      email: email.trim(),
      password,
      displayName: nama.trim(),
      disabled: status === "nonaktif",
    });

    try {
      await adminDb.collection("users").doc(userRecord.uid).set({
        uid: userRecord.uid,
        nama: nama.trim(),
        email: email.trim(),
        alamat: alamat.trim(),
        jenisKelamin,
        role: "user",
        status,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } catch (error) {
      await adminAuth.deleteUser(userRecord.uid);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "User berhasil ditambahkan",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";

    return NextResponse.json(
      { message },
      { status: 400 }
    );
  }
}