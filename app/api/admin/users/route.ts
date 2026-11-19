
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { verifyAdmin } from "@/lib/firebase/verifyAdmin";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// GET: Mengambil seluruh pengguna
export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 }
      );
    }

    const snapshot = await adminDb.collection("users").get();

    const users = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        uid: doc.id,
        nama: data.nama || "",
        email: data.email || "",
        alamat: data.alamat || "",
        jenisKelamin: data.jenisKelamin || "",
        role: data.role || "user",
        status: data.status || "aktif",
        createdAt: data.createdAt || null,
      };
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil data pengguna" },
      { status: 500 }
    );
  }
}

// POST: Membuat pengguna baru
export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const {
      nama,
      email,
      password,
      alamat,
      jenisKelamin,
      role,
    } = body;

    if (
      !nama?.trim() ||
      !email?.trim() ||
      !password ||
      !alamat?.trim() ||
      !["L", "P"].includes(jenisKelamin) ||
      !["admin", "user"].includes(role)
    ) {
      return NextResponse.json(
        { success: false, message: "Data pengguna tidak lengkap atau tidak valid" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    let createdUser;

    try {
      createdUser = await adminAuth.createUser({
        email: email.trim().toLowerCase(),
        password,
        displayName: nama.trim(),
        disabled: false,
      });

      await adminDb.collection("users").doc(createdUser.uid).set({
        uid: createdUser.uid,
        nama: nama.trim(),
        email: email.trim().toLowerCase(),
        alamat: alamat.trim(),
        jenisKelamin,
        role,
        status: "aktif",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: "Pengguna berhasil ditambahkan",
        uid: createdUser.uid,
      });
    } catch (error) {
      // Jika penulisan Firestore gagal, hapus akun Auth yang baru dibuat.
      if (createdUser) {
        await adminAuth.deleteUser(createdUser.uid).catch(() => {});
      }

      throw error;
    }
  } catch (error: any) {
    console.error("CREATE USER ERROR:", error);

    let message = "Gagal membuat pengguna";

    if (error.code === "auth/email-already-exists") {
      message = "Email sudah digunakan";
    } else if (error.code === "auth/invalid-email") {
      message = "Format email tidak valid";
    } else if (error.code === "auth/weak-password") {
      message = "Password terlalu lemah";
    }

    return NextResponse.json(
      { success: false, message },
      { status: 400 }
    );
  }
}

// PATCH: Mengubah data pengguna
export async function PATCH(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const {
      uid,
      nama,
      email,
      password,
      alamat,
      jenisKelamin,
      role,
      status,
    } = body;

    if (
      !uid ||
      !nama?.trim() ||
      !email?.trim() ||
      !alamat?.trim() ||
      !["L", "P"].includes(jenisKelamin) ||
      !["admin", "user"].includes(role) ||
      !["aktif", "nonaktif"].includes(status)
    ) {
      return NextResponse.json(
        { success: false, message: "Data pengguna tidak valid" },
        { status: 400 }
      );
    }

    const userRef = adminDb.collection("users").doc(uid);
    const snapshot = await userRef.get();

    if (!snapshot.exists) {
      return NextResponse.json(
        { success: false, message: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    // Mencegah admin menonaktifkan atau menghapus hak admin dirinya sendiri.
    if (
      uid === admin.uid &&
      (role !== "admin" || status !== "aktif")
    ) {
      return NextResponse.json(
        { success: false, message: "Anda tidak dapat menonaktifkan atau mengubah role akun sendiri" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const authUpdate: {
      email: string;
      displayName: string;
      disabled: boolean;
      password?: string;
    } = {
      email: normalizedEmail,
      displayName: nama.trim(),
      disabled: status !== "aktif",
    };

    if (password?.trim()) {
      if (password.length < 6) {
        return NextResponse.json(
          { success: false, message: "Password minimal 6 karakter" },
          { status: 400 }
        );
      }

      authUpdate.password = password;
    }

    await adminAuth.updateUser(uid, authUpdate);

    await userRef.update({
      nama: nama.trim(),
      email: normalizedEmail,
      alamat: alamat.trim(),
      jenisKelamin,
      role,
      status,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Data pengguna berhasil diperbarui",
    });
  } catch (error: any) {
    console.error("UPDATE USER ERROR:", error);

    let message = "Gagal memperbarui pengguna";

    if (error.code === "auth/email-already-exists") {
      message = "Email sudah digunakan pengguna lain";
    } else if (error.code === "auth/user-not-found") {
      message = "Akun Firebase Authentication tidak ditemukan";
    } else if (error.code === "auth/invalid-email") {
      message = "Format email tidak valid";
    }

    return NextResponse.json(
      { success: false, message },
      { status: 400 }
    );
  }
}

// DELETE: Menghapus pengguna
export async function DELETE(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 }
      );
    }

    const { uid } = await req.json();

    if (!uid) {
      return NextResponse.json(
        { success: false, message: "UID tidak ditemukan" },
        { status: 400 }
      );
    }

    if (uid === admin.uid) {
      return NextResponse.json(
        { success: false, message: "Anda tidak dapat menghapus akun sendiri" },
        { status: 400 }
      );
    }

    const userRef = adminDb.collection("users").doc(uid);
    const snapshot = await userRef.get();

    if (!snapshot.exists) {
      return NextResponse.json(
        { success: false, message: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    await adminAuth.deleteUser(uid);
    await userRef.delete();

    return NextResponse.json({
      success: true,
      message: "Pengguna berhasil dihapus",
    });
  } catch (error: any) {
    console.error("DELETE USER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.code === "auth/user-not-found"
          ? "Akun Authentication tidak ditemukan"
          : "Gagal menghapus pengguna",
      },
      { status: 400 }
    );
  }
}
