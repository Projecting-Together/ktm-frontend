import type { User, UserRole, UserStatus } from "@/lib/api/types";

export type AuthUserDto = Partial<User> & {
  id: string;
  email: string;
};

export interface AuthUserModel {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  fullName: string;
  initials: string;
  avatarUrl: string | null;
}

const DEFAULT_ROLE: UserRole = "renter";
const DEFAULT_STATUS: UserStatus = "active";

const normalize = (value?: string | null): string => value?.trim() ?? "";

export function mapAuthUserDto(dto: AuthUserDto | null | undefined): AuthUserModel | null {
  if (!dto) return null;

  const firstName = normalize(dto.profile?.first_name);
  const lastName = normalize(dto.profile?.last_name);
  const fullNameFromProfile = [firstName, lastName].filter(Boolean).join(" ").trim();
  const emailPrefix = normalize(dto.email.split("@")[0]);
  const fullName = fullNameFromProfile || emailPrefix || "User";
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return {
    id: dto.id,
    email: dto.email,
    role: dto.role ?? DEFAULT_ROLE,
    status: dto.status ?? DEFAULT_STATUS,
    isVerified: dto.is_verified ?? false,
    fullName,
    initials: initials || "U",
    avatarUrl: dto.profile?.avatar_url ?? null,
  };
}
