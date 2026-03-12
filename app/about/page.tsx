
'use client';

import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { motion } from 'framer-motion';

export default function About() {
    const { language } = useAppStore();
    const t = translations[language].nav;

    return (
        <div className="min-h-screen bg-black text-white pt-10 pb-20">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto"
                >
                    <h1 className="text-4xl font-bold mb-8 text-center text-amber-500">{t.about} Dinanath & Sons</h1>

                    <div className="space-y-8 text-lg text-gray-300 leading-relaxed">
                        <p>
                            Established in the historic lanes of Chandni Chowk, <strong>Dinanath & Sons</strong> has been a trusted name in the jewelry manufacturing industry for decades. We specialize in providing high-quality tools, machinery, and equipment to goldsmiths, silversmiths, and jewelry manufacturers across India.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                                <h3 className="text-xl font-bold text-amber-500 mb-2">Wholesale Manufacturing</h3>
                                <p className="text-sm">We manufacture and supply bulk quantities of precision tools, ensuring standardization and quality for large-scale production units.</p>
                            </div>
                            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                                <h3 className="text-xl font-bold text-amber-500 mb-2">Retail Supplies</h3>
                                <p className="text-sm">We cater to individual artisans and small businesses, providing the same professional-grade equipment at competitive prices.</p>
                            </div>
                        </div>

                        <p>
                            Our mission is to empower the jewelry craftsmanship of India with the best technology and tools. Whether you need a simple pair of pliers or a complex gold casting machine, Dinanath & Sons is your one-stop solution.
                        </p>

                        <p>
                            Located at <strong>1914, Chatta Madan Gopal, Maliwara, Chandni Chowk, Delhi 110006</strong>, we are deeply rooted in the heart of the jewelry market.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
