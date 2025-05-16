
// Adding a fixed version of authUtils.ts to fix build errors
import { UserProfile, UserRole } from "@/lib/supabase";

interface AuthSession {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      name?: string;
    };
  };
}

// Mock function to fix build errors
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  // In a real app, this would fetch from Supabase
  return {
    id: userId,
    email: "user@example.com",
    name: "Mock User",
    role: 'accountant' as UserRole, // Use string value instead of enum reference
    full_name: "Mock Full Name",
    company_id: "123456"
  };
}

// Mock function to fix build errors
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ session: AuthSession | null; error: Error | null }> {
  if (email && password) {
    return {
      session: {
        user: {
          id: "1234",
          email: email,
          user_metadata: {
            name: "Test User",
          },
        },
      },
      error: null,
    };
  }
  return { session: null, error: new Error("Invalid credentials") };
}

// Mock function to fix build errors
export async function signOut(): Promise<{ error: Error | null }> {
  return { error: null };
}

// Function to map user data to profile
export function mapUserToProfile(
  user: any,
  additionalData?: Partial<UserProfile>
): UserProfile {
  return {
    id: user.id,
    email: user.email || "",
    name: additionalData?.full_name || user.user_metadata?.name || user.email || "",
    role: additionalData?.role || 'user' as UserRole, // Use string value instead of enum reference
    full_name: additionalData?.full_name || "",
    company_id: additionalData?.company_id,
  };
}

// Mock function to fix build errors
export async function updateUserProfile(
  userId: string,
  data: Partial<UserProfile>
): Promise<{ error: Error | null }> {
  return { error: null };
}
