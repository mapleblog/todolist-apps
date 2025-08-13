import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import {
  signInWithGoogle,
  signOutUser,
  onAuthStateChange,
  getCurrentUser,
} from '@/services/authService';
import { User, AuthState } from '@/types';

// Auth action types
type AuthAction =
  | { type: 'AUTH_LOADING' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Initial auth state
const initialAuthState: AuthState = {
  user: null,
  loading: true,
  error: null,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_LOADING':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        loading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        loading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Auth context type
interface AuthContextType {
  // State
  user: User | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  
  // Computed properties
  isAuthenticated: boolean;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // Sign in with Google
  const signIn = async (): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      const user = await signInWithGoogle();
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      await signOutUser();
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  // Clear error
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Initialize auth state and listen for changes
  useEffect(() => {
    let isMounted = true;

    // Initialize current user
    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (isMounted) {
          if (currentUser) {
            dispatch({ type: 'AUTH_SUCCESS', payload: currentUser });
          } else {
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
          dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
        }
      }
    };

    // Set up auth state listener
    const unsubscribe = onAuthStateChange((user) => {
      if (isMounted) {
        if (user) {
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
        } else {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      }
    });

    // Initialize auth
    initializeAuth();

    // Cleanup
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Context value
  const contextValue: AuthContextType = {
    // State
    user: state.user,
    loading: state.loading,
    error: state.error,
    
    // Actions
    signIn,
    signOut,
    clearError,
    
    // Computed properties
    isAuthenticated: !!state.user,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// HOC for protected routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const AuthenticatedComponent: React.FC<P> = (props) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          Loading...
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          Please sign in to access this page.
        </div>
      );
    }

    return <Component {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  
  return AuthenticatedComponent;
};

export default AuthContext;