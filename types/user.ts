export type UserRole = "admin" | "santri";

export interface UserData {
    uid : string;
    name : string;
    email : string;
    role : UserRole;
};