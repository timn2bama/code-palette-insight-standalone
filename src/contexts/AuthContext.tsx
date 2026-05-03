import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { validateEmail, getSafeErrorMessage, rateLimiter } from '@/lib/security';
import { logger } from "@/utils/logger";

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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({ subscribed: false });

  const checkSubscription = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      setSubscriptionStatus(data);
    } catch (error) {
      logger.error('Error checking subscription:', error);
      // Set to unsubscribed state on error to avoid blocking UI
      setSubscriptionStatus({ subscribed: false });
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Check subscription status when user changes
        if (session?.user) {
          setTimeout(() => {
            checkSubscription();
          }, 0);
        } else {
          setSubscriptionStatus({ subscribed: false });
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check subscription status for existing session
      if (session?.user) {
        setTimeout(() => {
          checkSubscription();
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    // Rate limiting
    if (!rateLimiter.isAllowed('signup', 3, 300000)) { // 3 attempts per 5 minutes
      return { error: new Error('Too many signup attempts. Please wait before trying again.') };
    }

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return { error: new Error(emailValidation.error || 'Invalid email') };
    }

    // Password strength check
    if (password.length < 8) {
      return { error: new Error('Password must be at least 8 characters long') };
    }

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName?.trim()
          }
        }
      });
      
      return { error: error ? new Error(getSafeErrorMessage(error)) : null };
    } catch (error) {
      return { error: new Error(getSafeErrorMessage(error)) };
    }
  };

  const signIn = async (email: string, password: string) => {
    // Rate limiting for failed login attempts
    const loginKey = `login-${email.toLowerCase()}`;
    if (!rateLimiter.isAllowed(loginKey, 5, 300000)) { // 5 attempts per 5 minutes
      return { error: new Error('Too many login attempts. Please wait before trying again.') };
    }

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return { error: new Error(emailValidation.error || 'Invalid email') };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });
      
      if (error) {
        // Don't reset rate limiter on failed login
        return { error: new Error(getSafeErrorMessage(error)) };
      } else {
        // Reset rate limiter on successful login
        rateLimiter.reset(loginKey);
        return { error: null };
      }
    } catch (error) {
      return { error: new Error(getSafeErrorMessage(error)) };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    subscriptionStatus,
    checkSubscription,
    signUp,
    signIn,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};