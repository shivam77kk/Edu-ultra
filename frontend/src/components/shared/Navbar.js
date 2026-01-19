"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { Menu, X, Globe, User, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिंदी" },
    { code: "mr", label: "मराठी" },
];

export default function Navbar() {
    const { t, i18n } = useTranslation();
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Handle scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setIsLangOpen(false);
    };

    const navLinks = [
        { name: t("nav.home"), href: "/" },
        { name: t("nav.features"), href: "/#features" },
        { name: t("nav.about"), href: "/about" },
    ];

    if (user) {
        navLinks.push({ name: t("common.dashboard"), href: "/dashboard" });
    }

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                scrolled
                    ? "bg-white/80 backdrop-blur-md shadow-sm dark:bg-black/80"
                    : "bg-transparent"
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <img src="/logo.jpg" alt="Edu-Ultra Logo" className="h-8 w-auto rounded-md" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                            Edu-Ultra
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors font-medium"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right Section (Auth & Lang) */}
                    <div className="hidden md:flex items-center space-x-4">
                        {/* Language Switcher */}
                        <div className="relative">
                            <button
                                onClick={() => setIsLangOpen(!isLangOpen)}
                                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 dark:text-gray-300 px-3 py-2 rounded-md transition-colors"
                            >
                                <Globe className="w-5 h-5" />
                                <span className="text-sm font-medium uppercase">{i18n.language}</span>
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {isLangOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1 focus:outline-none">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => changeLanguage(lang.code)}
                                            className={cn(
                                                "block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800",
                                                i18n.language === lang.code ? "bg-gray-50 dark:bg-gray-800 font-bold" : ""
                                            )}
                                        >
                                            {lang.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Auth Buttons */}
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {user.name}
                                </span>
                                <button
                                    onClick={logout}
                                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                                    title={t("common.logout")}
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 transition-colors"
                                >
                                    {t("common.login")}
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
                                >
                                    {t("common.register")}
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-700 dark:text-gray-300 hover:text-blue-600"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white dark:bg-gray-950 border-t dark:border-gray-800">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="border-t border-gray-200 dark:border-gray-800 my-2 pt-2">
                            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                {t("common.language")}
                            </p>
                            <div className="grid grid-cols-3 gap-2 px-3">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            changeLanguage(lang.code);
                                            setIsMenuOpen(false);
                                        }}
                                        className={cn(
                                            "text-center px-2 py-1 rounded text-sm border transition-colors",
                                            i18n.language === lang.code
                                                ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
                                                : "border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400"
                                        )}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {user ? (
                            <div className="border-t border-gray-200 dark:border-gray-800 mt-2 pt-2">
                                <button
                                    onClick={() => { logout(); setIsMenuOpen(false); }}
                                    className="w-full text-left block px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                                >
                                    {t("common.logout")}
                                </button>
                            </div>
                        ) : (
                            <div className="border-t border-gray-200 dark:border-gray-800 mt-2 pt-2 flex space-x-2 px-3">
                                <Link
                                    href="/login"
                                    className="flex-1 text-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t("common.login")}
                                </Link>
                                <Link
                                    href="/register"
                                    className="flex-1 text-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t("common.register")}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
