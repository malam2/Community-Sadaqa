export type PostType = "request" | "offer";

export type PostCategory =
  | "food"
  | "baby_supplies"
  | "ride"
  | "essentials"
  | "consulting"
  | "shelter"
  | "other";

export type PostStatus = "open" | "fulfilled" | "hidden";

export type ContactPreference = "in_app" | "phone" | "email" | "any";

export interface Post {
  id: string;
  communityId: string;
  type: PostType;
  category: PostCategory;
  title: string;
  description: string;
  isAnonymous: boolean;
  authorId: string;
  authorDisplayName?: string;
  createdAt: number;
  status: PostStatus;
  urgent: boolean;
  contactPreference: ContactPreference;
  contactPhone?: string;
  contactEmail?: string;
}

export interface Report {
  id: string;
  postId: string;
  reporterId: string;
  reason: "scam" | "illegal" | "harassment" | "other";
  details?: string;
  createdAt: number;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email?: string;
  communityId: string;
  createdAt: number;
}

export const CATEGORIES: { value: PostCategory; label: string }[] = [
  { value: "food", label: "Food" },
  { value: "baby_supplies", label: "Baby Supplies" },
  { value: "ride", label: "Ride" },
  { value: "essentials", label: "Essentials" },
  { value: "consulting", label: "Consulting/Advice" },
  { value: "shelter", label: "Temporary Shelter" },
  { value: "other", label: "Other" },
];

export const CONTACT_PREFERENCES: {
  value: ContactPreference;
  label: string;
}[] = [
  { value: "in_app", label: "In-App Only" },
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "any", label: "Any Method" },
];

export function getCategoryLabel(category: PostCategory): string {
  const found = CATEGORIES.find((c) => c.value === category);
  return found ? found.label : category;
}

export function getContactPreferenceLabel(pref: ContactPreference): string {
  const found = CONTACT_PREFERENCES.find((c) => c.value === pref);
  return found ? found.label : pref;
}

export function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}
