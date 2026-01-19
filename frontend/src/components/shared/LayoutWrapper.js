"use client";

import { AuthProvider } from "@/context/AuthContext";

export default function LayoutWrapper({ children }) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
}
