"use client";

import { useAuth } from "../../context/AuthContext.jsx";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Brain,
    Heart,
    Newspaper,
    BookOpen,
    ClipboardCheck,
    Users,
    StickyNote,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Shield,
    Menu,
    X,
    User
} from "lucide-react";

export default function DashboardLayout({ children }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
        { icon: Brain, label: "AI Tools", href: "/dashboard/ai" },
        { icon: StickyNote, label: "Notes", href: "/dashboard/notes" },
        { icon: BookOpen, label: "Resources", href: "/dashboard/resources" },
        { icon: ClipboardCheck, label: "Assessments", href: "/dashboard/assessments" },
        { icon: Newspaper, label: "News", href: "/dashboard/news" },
        { icon: Heart, label: "Wellness", href: "/dashboard/wellness" },
        { icon: Users, label: "Teams", href: "/dashboard/teams" },
    ];

    if (user.role === "admin") {
        menuItems.push({ icon: Shield, label: "Admin", href: "/dashboard/admin" });
    }

    const Sidebar = ({ mobile = false }) => (
        <div className={`flex flex-col h-full ${mobile ? 'bg-black/95 backdrop-blur-xl' : 'bg-black/40 backdrop-blur-xl'}`}>
            {/* Logo */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
                {(!sidebarCollapsed || mobile) && (
                    <Link href="/dashboard" className="flex items-center space-x-2 group" onClick={() => setMobileMenuOpen(false)}>
                        <img src="/logo.jpg" alt="Logo" className="h-10 w-auto rounded-lg group-hover:scale-110 transition-transform" />
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Edu-Ultra
                        </span>
                    </Link>
                )}
                {!mobile && (
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                )}
                {mobile && (
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (pathname.startsWith(item.href + "/") && item.href !== "/dashboard");

                    return (
                        <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                            <motion.div
                                whileHover={{ x: 4 }}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/30"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {(!sidebarCollapsed || mobile) && <span className="font-medium">{item.label}</span>}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="border-t border-white/10 p-4">
                <Link href="/dashboard/profile" onClick={() => setMobileMenuOpen(false)}>
                    <div className={`flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer ${sidebarCollapsed && !mobile ? 'justify-center' : ''}`}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        {(!sidebarCollapsed || mobile) && (
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{user.name}</p>
                                <p className="text-gray-400 text-xs truncate">{user.email}</p>
                            </div>
                        )}
                    </div>
                </Link>
                <button
                    onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                    }}
                    className={`mt-2 w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors ${sidebarCollapsed && !mobile ? 'justify-center' : ''}`}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {(!sidebarCollapsed || mobile) && <span className="font-medium">Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-white/5 transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Sidebar */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
                    <motion.div
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        className="absolute left-0 top-0 h-full w-80 border-r border-white/10"
                    >
                        <Sidebar mobile />
                    </motion.div>
                </div>
            )}

            <div className="flex relative z-10">
                {/* Desktop Sidebar */}
                <motion.aside
                    initial={false}
                    animate={{ width: sidebarCollapsed ? "80px" : "280px" }}
                    className="hidden lg:flex fixed left-0 top-0 h-screen border-r border-white/10 flex-col"
                >
                    <Sidebar />
                </motion.aside>

                {/* Main Content */}
                <motion.main
                    initial={false}
                    animate={{ marginLeft: sidebarCollapsed ? "80px" : "280px" }}
                    className="flex-1 min-h-screen w-full lg:w-auto"
                >
                    <div className="p-4 lg:p-8 pt-20 lg:pt-8">
                        {children}
                    </div>
                </motion.main>
            </div>

            <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
        </div>
    );
}
