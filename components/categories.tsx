import Link from 'next/link';
import { Hammer, Cog, Package, FlaskConical, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = [
    { name: 'Hand Tools', icon: Hammer, gradient: 'from-[#C9A84C] to-[#8B6914]', href: '/shop/category/hand-tools' },
    { name: 'Machinery', icon: Cog, gradient: 'from-blue-400 to-blue-600', href: '/shop/category/machines' },
    { name: 'Packaging', icon: Package, gradient: 'from-emerald-400 to-emerald-600', href: '/shop/category/packaging' },
    { name: 'Chemicals', icon: FlaskConical, gradient: 'from-rose-400 to-rose-600', href: '/shop/category/chemicals' },
    { name: 'Polishing & Buffs', icon: Sparkles, gradient: 'from-amber-400 to-amber-600', href: '/shop/category/polishing' },
];

export function Categories() {
    return (
        <section className="py-20 relative bg-[#FAF9F5] border-b border-[#E8E2D5]">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold font-display text-[#18181B] mb-2 tracking-wider uppercase">Browse by Category</h2>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#966E2E]">Find precision equipment for your jewellery workshop</p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {CATEGORIES.map((cat, index) => (
                        <motion.div
                            key={cat.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.08 }}
                        >
                            <Link
                                href={cat.href}
                                className="group relative h-40 rounded-2xl overflow-hidden block bg-white border border-[#E8E2D5] hover:border-[#966E2E] transition-all duration-500 shadow-xs hover:shadow-md"
                            >
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                                        <cat.icon size={24} />
                                    </div>
                                    <span className="font-bold text-[#18181B] tracking-wide group-hover:text-[#966E2E] transition-colors duration-300 text-xs uppercase text-center">{cat.name}</span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
