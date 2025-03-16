import { createContext, useContext, useState, ReactNode } from "react";

// Simplified AuthContext that doesn't require actual authentication
// but maintains the interface for compatibility with existing components
export interface User {
  id: number;
  username: string;
  isParent: boolean;
  childAvatar?: string;
  childName?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password?: string, isParent?: boolean) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isGuest: boolean;
  setIsGuest: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Create a dummy guest user for the simplified application
const guestUser: User = {
  id: 1,
  username: "guest",
  isParent: false,
  childAvatar: "blue",
  childName: "Guest",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // Always set user to the guest user and not loading
  const [user, setUser] = useState<User | null>(guestUser);
  const [loading, setLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(true);

  // Dummy authentication functions that do nothing
  const login = async () => {
    console.log("Login functionality removed in simplified version");
    return Promise.resolve();
  };

  const loginWithGoogle = async () => {
    console.log("Google login functionality removed in simplified version");
    return Promise.resolve();
  };

  const logout = async () => {
    console.log("Logout functionality removed in simplified version");
    return Promise.resolve();
  };

  return (
    <AuthContext.Provider value={{
      user, 
      loading, 
      login, 
      loginWithGoogle, 
      logout, 
      isGuest, 
      setIsGuest
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}