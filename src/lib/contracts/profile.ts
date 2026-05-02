import type { UserRole } from "@/lib/api/types";

export interface ProfileDto {
  id: string;
  slug?: string;
  email: string;
  role: UserRole;
  profile?: {
    first_name?: string | null;
    last_name?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
  } | null;
  stats?: {
    active_listings?: number;
  } | null;
}

export interface ProfileModel {
  id: string;
  slug: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  fullName: string;
  initials: string;
  avatarUrl: string | null;
  bio: string;
  phone: string;
  activeListings: number;
}

const normalize = (value?: string | null): string => value?.trim() ?? "";

export function mapProfileDto(dto: ProfileDto): ProfileModel {
  const firstName = normalize(dto.profile?.first_name);
  const lastName = normalize(dto.profile?.last_name);
  const joinedName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const emailPrefix = normalize(dto.email.split("@")[0]);
  const fullName = joinedName || emailPrefix || "User";
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return {
    id: dto.id,
    slug: dto.slug ?? dto.id,
    email: dto.email,
    role: dto.role,
    firstName,
    lastName,
    fullName,
    initials: initials || "U",
    avatarUrl: dto.profile?.avatar_url ?? null,
    bio: normalize(dto.profile?.bio),
    phone: normalize(dto.profile?.phone),
    activeListings: dto.stats?.active_listings ?? 0,
  };
}
