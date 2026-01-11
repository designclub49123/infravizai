import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  session: any;
  profile: any;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  loading: boolean;
}

const LocalAuthContext = createContext<AuthContextType | undefined>(undefined);

export function LocalAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('localUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock authentication
      const mockUser: User = {
        id: 'demo-user-' + Date.now(),
        email,
        name: email.split('@')[0],
      };
      
      setUser(mockUser);
      localStorage.setItem('localUser', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    setLoading(true);
    try {
      // Mock sign up
      const mockUser: User = {
        id: 'demo-user-' + Date.now(),
        email,
        name: name || email.split('@')[0],
      };
      
      setUser(mockUser);
      localStorage.setItem('localUser', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      setUser(null);
      localStorage.removeItem('localUser');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: any) => {
    if (!user) return;
    
    try {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('localUser', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update profile error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    session: { user },
    profile: user,
    signIn,
    signUp,
    signOut,
    updateProfile,
    loading,
  };

  return (
    <LocalAuthContext.Provider value={value}>
      {children}
    </LocalAuthContext.Provider>
  );
}

export function useLocalAuth() {
  const context = useContext(LocalAuthContext);
  if (context === undefined) {
    throw new Error('useLocalAuth must be used within a LocalAuthProvider');
  }
  return context;
}
