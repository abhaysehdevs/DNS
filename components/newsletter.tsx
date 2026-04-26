
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function Newsletter() {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setLoading(true);
            try {
                const { error } = await supabase
                    .from('newsletter_subscribers')
                    .insert([{ email }]);

                if (error) throw error;

                setSubscribed(true);
                setTimeout(() => {
                    setEmail('');
                    setSubscribed(false);
                }, 3000);
            } catch (err) {
                console.error("Error subscribing:", err);
                alert("Failed to subscribe. Please try again.");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <section className="py-16" style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(139,105,20,0.04) 100%)' }}>
            <div className="container mx-auto px-4 text-center">
                <div className="glass-strong rounded-3xl p-8 max-w-3xl mx-auto">
                    <h2 className="text-3xl font-black text-[#F5F5F7] mb-4 tracking-tight">Join Our Community</h2>
                    <p className="text-[#8E8E9A] mb-8 text-lg">
                        Subscribe for exclusive offers, jewelry making tips, and new product launch updates.
                    </p>

                    {subscribed ? (
                        <div className="flex items-center justify-center gap-2 text-emerald-400 glass rounded-2xl py-3 border border-emerald-500/20">
                            <Check size={20} /> Thanks for subscribing!
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <div className="relative flex-1">
                                <Mail className="absolute left-3 top-3.5 text-[#5A5A6A]" size={18} />
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl glass text-[#F5F5F7] placeholder:text-[#3A3A4A] focus:outline-none focus:border-[#C9A84C]/30 transition-colors"
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={loading}
                                className="font-bold py-3 px-8 h-auto rounded-xl disabled:opacity-50 border-0 text-[#0A0A0F]"
                                style={{ background: 'linear-gradient(135deg, #E8D48B, #C9A84C)' }}>
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Subscribe'}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
