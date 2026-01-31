"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    BookOpen,
    MessageSquare,
    Activity,
    Newspaper,
    Users,
    Settings,
    LogOut,
    Brain,
    Video
} from "lucide-react";

export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const { t } = useTranslation();

    const links = [
        { name: t("common.dashboard"), href: "/dashboard", icon: LayoutDashboard },
        { name: "My Courses", href: "/dashboard/courses", icon: BookOpen },
        { name: "AI Tools", href: "/dashboard/ai-tools", icon: Brain },
        { name: "Video Summarizer", href: "/dashboard/video-summarizer", icon: Video },
        { name: "Wellness Center", href: "/dashboard/wellness", icon: Activity },
        { name: "Community", href: "/dashboard/community", icon: Users },
        { name: "News Feed", href: "/dashboard/news", icon: Newspaper },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <div className="flex flex-col h-full w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-800">
                <Link href="/" className="flex items-center space-x-2">
                    <img src="/logo.jpg" alt="Edu-Ultra Logo" className="h-8 w-auto rounded-md" />
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                        Edu-Ultra
                    </span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-2 space-y-1">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors group",
                                    isActive
                                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                                )}
                            >
                                <Icon className={cn("mr-3 h-5 w-5 flex-shrink-0 transition-colors", isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300")} />
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center mb-4 px-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {user?.name?.charAt(0) || "U"}
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate w-32">
                            {user?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate w-32">
                            {user?.email}
                        </p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    {t("common.logout")}
                </button>
            </div>
        </div>
    );
}
