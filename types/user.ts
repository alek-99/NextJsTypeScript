export type UserRole = "admin" | "user";

export type UserStatus = "aktif" | "nonaktif";

export interface UserData {
  uid: string;
  nama: string;
  email: string;
  alamat: string;
  jenisKelamin: "L" | "P";
  role: UserRole;
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}