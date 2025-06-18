
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean };

interface AuthContextProps {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialState: AuthState = { 
    user: null, 
    isAuthenticated: false, 
    isLoading: true 
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Fetch user profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          const userData: User = {
            id: session.user.id,
            name: profile?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            avatar_url: profile?.avatar_url
          };
          
          dispatch({ type: "LOGIN_SUCCESS", payload: userData });
        } else {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } catch (error) {
        console.error("Session check error:", error);
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    checkSession();

    // Set up auth subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Fetch user profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          const userData: User = {
            id: session.user.id,
            name: profile?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            avatar_url: profile?.avatar_url
          };
          
          dispatch({ type: "LOGIN_SUCCESS", payload: userData });
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: "LOGOUT" });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login functionality
  const login = async (email: string, password: string) => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast.success("Login successful!");
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      dispatch({ type: "SET_LOADING", payload: false });
      throw error;
    }
  };

  // Register functionality
  const register = async (name: string, email: string, password: string) => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast.success("Registration successful! Check your email for confirmation.");
      }
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
      dispatch({ type: "SET_LOADING", payload: false });
      throw error;
    }
  };

  // Logout functionality
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast.info("Logged out successfully");
    } catch (error: any) {
      toast.error(error.message || "Logout failed");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
