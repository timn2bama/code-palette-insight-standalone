import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authClient } from '@/lib/auth-client';
import { logger } from "@/utils/logger";
import { User, Session } from '@/types';

interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscriptionStatus: SubscriptionStatus;
  checkSubscription: () => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, isPending: loading } = authClient.useSession();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({ subscribed: false });

  const checkSubscription = useCallback(async () => {
    if (!session?.user) return;
    
    try {
      const response = await fetch('/api/analytics/subscription');
      if (!response.ok) throw new Error('Failed to fetch subscription');
      const data = await response.json();
      setSubscriptionStatus(data);
    } catch (error) {
      logger.error('Error checking subscription:', error);
      setSubscriptionStatus({ subscribed: false });
    }
  }, [session?.user]);

  useEffect(() => {
    if (session?.user) {
      checkSubscription();
    } else {
      setSubscriptionStatus({ subscribed: false });
    }
  }, [session, checkSubscription]);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const { error } = await authClient.signUp.email({
        email,
        password,
        name: displayName,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await authClient.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user: (session?.user as User) ?? null,
    session: (session as unknown as Session) ?? null,
    loading,
    subscriptionStatus,
    checkSubscription,
    signUp,
    signIn,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
