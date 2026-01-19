"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="bg-white dark:bg-black border-t dark:border-gray-800 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link href="/" className="inline-block flex items-center space-x-2">
                            <img src="/logo.jpg" alt="Edu-Ultra Logo" className="h-8 w-auto rounded-md" />
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                                Edu-Ultra
                            </span>
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                            Empowering the next generation of learners with AI-driven tools and personalized education. Join us in shaping the future.
                        </p>
                        <div className="flex space-x-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                                <a
                                    key={index}
                                    href="#"
                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Quick Links</h3>
                        <ul className="space-y-3">
                            {[
                                { name: t("nav.home"), href: "/" },
                                { name: t("nav.features"), href: "/#features" },
                                { name: t("nav.pricing"), href: "/pricing" },
                                { name: t("nav.about"), href: "/about" },
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Legal</h3>
                        <ul className="space-y-3">
                            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
                                <li key={item}>
                                    <Link
                                        href="#"
                                        className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3 text-sm text-gray-600 dark:text-gray-400">
                                <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <span>123 Education Lane, Tech City, India 400001</span>
                            </li>
                            <li className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <span>support@edu-ultra.com</span>
                            </li>
                            <li className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                                <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <span>+91 123 456 7890</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-8 text-center">
                    <p className="text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} Edu-Ultra. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
