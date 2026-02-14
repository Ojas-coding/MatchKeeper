
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { getCurrentUser, logoutUser } from "@/services/dataService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const logout = async () => {
    try {
      await logoutUser();
      queryClient.setQueryData(["currentUser"], null);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
