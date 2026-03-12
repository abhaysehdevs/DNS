
'use client';

import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { MapPin, Phone, Mail, Clock, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Contact() {
    const { language } = useAppStore();
    const t = translations[language].nav;

    // Form State
    const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('submitting');
        // Simulate network request
        setTimeout(() => {
            setFormStatus('success');
        }, 1500);
    };

    // Hardcoded Business Info
    const businessInfo = {
        address: '1914, Chatta Madan Gopal, Maliwara, Chandni Chowk, Delhi 110006',
        phone: '9953435647',
        email: 'ajayabhay12872@gmail.com',
        hours: '11:00 AM - 8:00 PM (Mon-Sat)',
    };

    return (
        <div className="min-h-screen bg-black text-white pt-10 pb-20">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto"
                >
                    <h1 className="text-4xl font-bold mb-4 text-center text-amber-500">{t.contact}</h1>
                    <p className="text-gray-400 text-center mb-12">We are located in the heart of Delhi's jewelry market.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Contact Info Card */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">
                            <h2 className="text-2xl font-bold mb-6 text-amber-500">Get in Touch</h2>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-amber-900/30 p-3 rounded-full text-amber-500">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Address</h3>
                                        <p className="text-gray-400">{businessInfo.address}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-amber-900/30 p-3 rounded-full text-amber-500">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Phone</h3>
                                        <p className="text-gray-400">+91 {businessInfo.phone}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-amber-900/30 p-3 rounded-full text-amber-500">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Email</h3>
                                        <p className="text-gray-400">{businessInfo.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-amber-900/30 p-3 rounded-full text-amber-500">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Opening Hours</h3>
                                        <p className="text-gray-400">{businessInfo.hours}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form with Success State */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl flex flex-col justify-center">
                            <h2 className="text-2xl font-bold mb-6 text-amber-500">Send us a Message</h2>
                            {formStatus === 'success' ? (
                                <div className="bg-green-900/20 border border-green-900/50 p-6 rounded-xl text-center">
                                    <div className="bg-green-500/20 p-3 rounded-full text-green-500 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                        <Check size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-green-400 mb-2">Message Sent!</h3>
                                    <p className="text-gray-400">Thank you for contacting us. We will get back to you shortly.</p>
                                    <button
                                        onClick={() => setFormStatus('idle')}
                                        className="mt-6 text-sm text-green-500 hover:text-green-400 underline"
                                    >
                                        Send another message
                                    </button>
                                </div>
                            ) : (
                                <form className="space-y-4" onSubmit={handleSendMessage}>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Your Name</label>
                                        <input required type="text" className="w-full bg-black border border-gray-700 rounded-md p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all" placeholder="John Doe" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Your Email</label>
                                        <input required type="email" className="w-full bg-black border border-gray-700 rounded-md p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all" placeholder="john@example.com" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Message</label>
                                        <textarea required rows={4} className="w-full bg-black border border-gray-700 rounded-md p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all" placeholder="How can we help you?" />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={formStatus === 'submitting'}
                                        className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-md transition-colors flex items-center justify-center gap-2"
                                    >
                                        {formStatus === 'submitting' ? 'Sending...' : 'Send Message'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
