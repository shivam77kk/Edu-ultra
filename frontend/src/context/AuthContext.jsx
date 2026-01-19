"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                // If no token, maybe we have a cookie? Try fetching profile anyway or stop
                // But if backend requires Bearer and we don't have it, it might fail if cookies aren't set/working
                // Let's try fetching, if 401 then no user
            }

            const { data } = await api.get("/users/profile");
            setUser(data.data); // Backend returns { success: true, data: user }
        } catch (error) {
            // console.error("Auth check failed", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Check for token in URL (Google Auth redirect)
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        if (token) {
            localStorage.setItem("token", token);
            window.history.replaceState({}, document.title, window.location.pathname); // Clean URL
            checkAuth();
        } else {
            checkAuth();
        }
    }, []);

    const login = (token) => {
        if (token) {
            localStorage.setItem("token", token);
        }
        checkAuth();
        router.push("/dashboard");
    };

    const logout = async () => {
        try {
            await api.get("/auth/logout");
            localStorage.removeItem("token");
            setUser(null);
            router.push("/");
        } catch (error) {
            console.error("Logout failed", error);
            localStorage.removeItem("token"); // Force cleanup
            setUser(null);
            router.push("/");
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
