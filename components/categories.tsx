
import Link from 'next/link';
import { Hammer, Cog, Flame, Gem, Package, FlaskConical } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = [
    { name: 'Hand Tools', icon: Hammer, color: 'bg-amber-600', filter: 'Tools' },
    { name: 'Machinery', icon: Cog, color: 'bg-blue-600', filter: 'Machinery' },
    { name: 'Packaging', icon: Package, color: 'bg-green-600', filter: 'Packaging' },
    { name: 'Chemicals', icon: FlaskConical, color: 'bg-pink-600', filter: 'Chemicals' },
    { name: 'Consumables', icon: Gem, color: 'bg-purple-600', filter: 'Consumables' },
];

export function Categories() {
    return (
        <section className="py-20 bg-neutral-900/50">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl font-bold text-white mb-4">Browse by Category</h2>
                    <p className="text-gray-400">Find exactly what you need for your workshop</p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {CATEGORIES.map((cat, index) => (
                        <motion.div
                            key={cat.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link
                                href={`/shop?cat=${cat.filter}`}
                                className="group relative h-40 rounded-2xl overflow-hidden bg-gray-800 border border-gray-700 hover:border-gray-500 transition-all block"
                            >
                                <div className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity ${cat.color}`} />
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                    <div className={`p-4 rounded-full bg-gray-900/50 ${cat.color} bg-opacity-20 text-white group-hover:scale-110 transition-transform duration-300`}>
                                        <cat.icon size={32} />
                                    </div>
                                    <span className="font-semibold text-white tracking-wide group-hover:text-amber-400 transition-colors">{cat.name}</span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
