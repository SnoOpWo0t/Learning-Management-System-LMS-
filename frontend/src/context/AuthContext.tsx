'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { API_URL } from '@/lib/api';

export type Role = 'Admin' | 'Content Manager' | 'Instructor' | 'Student';

export interface User {
  id: number;
  username: string;
  email: string;
  roleType?: Role;
  bio?: string;
  avatar?: {
    id: number;
    url: string;
  } | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (jwt: string, user: User) => Promise<void>;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  token: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const storedToken = Cookies.get('jwt');
      if (storedToken) {
        try {
          const res = await fetch(`${API_URL}/api/custom-auth/me`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });
          if (res.ok) {
            const userData = await res.json();
            
            // Extract custom role type from standard users-permissions role if possible
            // In Strapi, users-permissions role is returned in userData.role
            let roleType = 'Student' as Role;
            if (userData.role && userData.role.name) {
               roleType = userData.role.name as Role;
            }

            setUser({
              id: userData.id,
              username: userData.username,
              email: userData.email,
              roleType,
              bio: userData.bio,
              avatar: userData.avatar,
            });
            setToken(storedToken);
          } else {
            Cookies.remove('jwt');
            setUser(null);
            setToken(null);
          }
        } catch (error) {
          console.error('Error fetching user', error);
        }
      }
      setLoading(false);
    };

    checkUserLoggedIn();
  }, []);

  const login = async (jwt: string, userData: any) => {
    Cookies.set('jwt', jwt, { expires: 7 }); // 7 days
    setToken(jwt);
    
    try {
      const res = await fetch(`${API_URL}/api/custom-auth/me`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (res.ok) {
        const fullUserData = await res.json();
        let roleType = 'Student' as Role;
        if (fullUserData.role && fullUserData.role.name) {
           roleType = fullUserData.role.name as Role;
        }
        setUser({
          id: fullUserData.id,
          username: fullUserData.username,
          email: fullUserData.email,
          roleType,
          bio: fullUserData.bio,
          avatar: fullUserData.avatar,
        });
      }
    } catch (error) {
      console.error('Error fetching user details on login', error);
      // Fallback
      setUser({
        id: userData.id,
        username: userData.username,
        email: userData.email,
        roleType: 'Student',
      });
    }
  };

  const logout = () => {
    Cookies.remove('jwt');
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
