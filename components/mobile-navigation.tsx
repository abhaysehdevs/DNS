'use client';

import Link from 'next/link';
import { Home, ShoppingBag, MessageSquare, Heart, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export function MobileBottomNav() {
    const pathname = usePathname();

    const navItems = [
        { icon: Home, label: 'Home', href: '/', isAction: false, isLang: false },
        { icon: ShoppingBag, label: 'Shop', href: '/shop', isAction: false, isLang: false },
        { icon: User, label: 'Account', href: '/account', isAction: false, isLang: false },
        { icon: MessageSquare, label: 'AI Chat', href: '#', isAction: true, isLang: false },
        { icon: Heart, label: 'Wishlist', href: '/wishlist', isAction: false, isLang: false },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 animate-in fade-in duration-300">
            <div className="h-[68px] flex items-center justify-around px-4 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] bg-[#1E1E1E]/95 backdrop-blur-2xl border border-[#343434]">
                {navItems.map((item, i) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={i}
                            href={item.href}
                            className="relative flex flex-col items-center justify-center gap-1 group min-w-[60px]"
                            onClick={(e) => {
                                if (item.isAction) {
                                    e.preventDefault();
                                    window.dispatchEvent(new CustomEvent('open-ai-assistant'));
                                } else if (item.isLang) {
                                    e.preventDefault();
                                    window.dispatchEvent(new CustomEvent('open-language-popup'));
                                }
                            }}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="mobile-nav-pill"
                                    className="absolute -inset-x-2 -inset-y-1 rounded-full -z-10 bg-[#A67C35]/10 border border-[#A67C35]/20"
                                    transition={{ type: "spring", damping: 25, stiffness: 350 }}
                                />
                            )}
                            <item.icon size={20} className={isActive ? 'text-[#A67C35]' : 'text-[#8E8E9A]'} strokeWidth={2} />
                            <span className={`text-[8px] font-bold uppercase tracking-[0.1em] ${isActive ? 'text-[#A67C35]' : 'text-[#CFCFCF]'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
