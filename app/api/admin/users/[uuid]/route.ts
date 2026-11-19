import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { verifyAdmin } from "@/lib/auth";
import { FieldValue } from "firebase-admin/firestore";

type Context = {
  params: Promise<{ uuid: string }>;
};

export async function PATCH(req: NextRequest, context: Context) {
  const admin = await verifyAdmin(req);

  if (!admin) {
    return NextResponse.json(
      { message: "Akses ditolak" },
      { status: 403 }
    );
  }

  try {
    const { uuid } = await context.params;

    if (uuid === admin.uid) {
      return NextResponse.json(
        { message: "Tidak dapat mengubah akun sendiri melalui menu ini" },
        { status: 400 }
      );
    }

    const {
      nama,
      email,
      alamat,
      jenisKelamin,
      status,
      password,
    } = await req.json();

    const docRef = adminDb.collection("users").doc(uuid);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    if (
      (nama !== undefined && !nama.trim()) ||
      (email !== undefined && !email.trim()) ||
      (alamat !== undefined && !alamat.trim()) ||
      (jenisKelamin !== undefined && !["L", "P"].includes(jenisKelamin)) ||
      (status !== undefined && !["aktif", "nonaktif"].includes(status)) ||
      (password !== undefined && password.length < 6)
    ) {
      return NextResponse.json(
        { message: "Data tidak valid" },
        { status: 400 }
      );
    }

    await adminAuth.updateUser(uuid, {
      ...(nama !== undefined && { displayName: nama.trim() }),
      ...(email !== undefined && { email: email.trim() }),
      ...(password && { password }),
      ...(status !== undefined && { disabled: status === "nonaktif" }),
    });

    await docRef.update({
      ...(nama !== undefined && { nama: nama.trim() }),
      ...(email !== undefined && { email: email.trim() }),
      ...(alamat !== undefined && { alamat: alamat.trim() }),
      ...(jenisKelamin !== undefined && { jenisKelamin }),
      ...(status !== undefined && { status }),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: "Data user berhasil diperbarui",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal memperbarui user";

    return NextResponse.json(
      { message },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest, context: Context) {
  const admin = await verifyAdmin(req);

  if (!admin) {
    return NextResponse.json(
      { message: "Akses ditolak" },
      { status: 403 }
    );
  }

  try {
    const { uuid } = await context.params;

    if (uuid === admin.uid) {
      return NextResponse.json(
        { message: "Tidak dapat menghapus akun sendiri" },
        { status: 400 }
      );
    }

    const docRef = adminDb.collection("users").doc(uuid);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    await adminAuth.deleteUser(uuid);
    await docRef.delete();

    return NextResponse.json({
      success: true,
      message: "User berhasil dihapus",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal menghapus user";

    return NextResponse.json(
      { message },
      { status: 400 }
    );
  }
}