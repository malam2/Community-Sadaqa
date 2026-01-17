import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiUrl } from "@/lib/query-client";

const AUTH_KEY = "@local_ummah_auth";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  communityId: string;
  isGuest?: boolean;
}

export function createGuestUser(): AuthUser {
  return {
    id: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    email: "",
    displayName: "Guest",
    communityId: "local_ummah",
    isGuest: true,
  };
}

export async function getStoredUser(): Promise<AuthUser | null> {
  try {
    const data = await AsyncStorage.getItem(AUTH_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch {
    return null;
  }
}

export async function storeUser(user: AuthUser): Promise<void> {
  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export async function clearUser(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_KEY);
}

export async function signup(
  email: string,
  password: string,
  displayName: string,
): Promise<AuthUser> {
  const response = await fetch(
    new URL("/api/auth/signup", getApiUrl()).toString(),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, displayName }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create account");
  }

  await storeUser(data.user);
  return data.user;
}

export async function login(
  email: string,
  password: string,
): Promise<AuthUser> {
  const response = await fetch(
    new URL("/api/auth/login", getApiUrl()).toString(),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to login");
  }

  await storeUser(data.user);
  return data.user;
}

export async function logout(): Promise<void> {
  await clearUser();
}

export async function updateDisplayName(
  userId: string,
  displayName: string,
): Promise<AuthUser> {
  const response = await fetch(
    new URL(`/api/users/${userId}`, getApiUrl()).toString(),
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update name");
  }

  await storeUser(data);
  return data;
}
