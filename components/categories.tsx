
import Link from 'next/link';
import { Hammer, Cog, Flame, Gem, Package, FlaskConical } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = [
    { name: 'Hand Tools', icon: Hammer, gradient: 'from-[#C9A84C] to-[#8B6914]', filter: 'Tools' },
    { name: 'Machinery', icon: Cog, gradient: 'from-blue-400 to-blue-600', filter: 'Machinery' },
    { name: 'Packaging', icon: Package, gradient: 'from-emerald-400 to-emerald-600', filter: 'Packaging' },
    { name: 'Chemicals', icon: FlaskConical, gradient: 'from-rose-400 to-rose-600', filter: 'Chemicals' },
    { name: 'Consumables', icon: Gem, gradient: 'from-violet-400 to-violet-600', filter: 'Consumables' },
];

export function Categories() {
    return (
        <section className="py-20 relative" style={{ background: 'rgba(13, 13, 24, 0.5)' }}>
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-black text-[#F5F5F7] mb-4 tracking-tight">Browse by Category</h2>
                    <p className="text-[#8E8E9A]">Find exactly what you need for your workshop</p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {CATEGORIES.map((cat, index) => (
                        <motion.div
                            key={cat.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.08 }}
                        >
                            <Link
                                href={`/shop?cat=${cat.filter}`}
                                className="group relative h-40 rounded-2xl overflow-hidden block glass hover:border-[#C9A84C]/20 transition-all duration-500"
                            >
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                                        <cat.icon size={28} />
                                    </div>
                                    <span className="font-bold text-[#8E8E9A] tracking-wide group-hover:text-[#C9A84C] transition-colors duration-300 text-sm uppercase">{cat.name}</span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
