'use client';

import Link from 'next/link';
import { Home, ShoppingBag, MessageSquare, User, Menu, Heart } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export function MobileBottomNav() {
    const pathname = usePathname();

    const navItems = [
        { icon: Home, label: 'Home', href: '/' },
        { icon: ShoppingBag, label: 'Shop', href: '/shop' },
        { icon: MessageSquare, label: 'AI Chat', href: '#', isAction: true },
        { icon: Heart, label: 'Wishlist', href: '/wishlist' },
        { icon: User, label: 'Profile', href: '/profile' },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4">
            <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-full h-16 flex items-center justify-around px-4 shadow-2xl">
                {navItems.map((item, i) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link 
                            key={i} 
                            href={item.href}
                            className="relative flex flex-col items-center justify-center gap-1 group"
                            onClick={(e) => {
                                if (item.isAction) {
                                    e.preventDefault();
                                    // Trigger AI assistant
                                    window.dispatchEvent(new CustomEvent('open-ai-assistant'));
                                }
                            }}
                        >
                            {isActive && (
                                <motion.div 
                                    layoutId="mobile-nav-pill"
                                    className="absolute -inset-x-3 -inset-y-1 bg-white/10 rounded-full -z-10"
                                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                                />
                            )}
                            <item.icon size={20} className={isActive ? 'text-amber-500' : 'text-gray-500'} />
                            <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-gray-600'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
