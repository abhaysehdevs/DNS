'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Hero } from '@/components/hero';
import { ProductCard } from '@/components/product-card';
import { Product } from '@/lib/data';
import { useAppStore } from '@/lib/store';
import { Loader2, TrendingUp, ShieldCheck, Truck, Users, ArrowRight, Star, Quote, ChevronRight, PlayCircle, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-is-mobile';

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Jewelry Manufacturer, Delhi",
    content: "Dinanath & Sons have been our trusted partner for 15 years. Their machinery quality is unmatched.",
    rating: 5
  },
  {
    name: "Amit Verma",
    role: "Goldsmith, Mumbai",
    content: "Best prices for wholesale casting consumables. Delivery is always on time.",
    rating: 5
  },
  {
    name: "Sneha Design Studio",
    role: "Jewelry Designer",
    content: "Their range of precision tools helped us scale our production. Highly recommended!",
    rating: 4
  },
  {
    name: "Vikram Singh",
    role: "Retail Store Owner",
    content: "The packaging materials are premium and exactly what my luxury brand needed.",
    rating: 5
  }
];

const features = [
  {
    icon: <ShieldCheck size={32} className="text-amber-500" />,
    title: "100% Authentic",
    desc: "Original products from top global brands."
  },
  {
    icon: <Truck size={32} className="text-blue-500" />,
    title: "Pan-India Shipping",
    desc: "Fast and insured delivery across all states."
  },
  {
    icon: <Users size={32} className="text-green-500" />,
    title: "Wholesale Support",
    desc: "Dedicated support for bulk buyers and factories."
  },
  {
    icon: <TrendingUp size={32} className="text-purple-500" />,
    title: "Best Market Rates",
    desc: "Competitive pricing for retail and wholesale."
  }
];

const guideResources = [
  {
    title: "Jewelry Polishing 101",
    desc: "Achieve the perfect mirror finish with our expert guide to polishing compounds.",
    icon: <BookOpen className="text-amber-500" size={24} />,
    duration: "5 min read",
    link: "/blog"
  },
  {
    title: "Choosing the Right Plier",
    desc: "A comprehensive breakdown of round nose vs. flat nose pliers for your craft.",
    icon: <PlayCircle className="text-blue-500" size={24} />,
    duration: "3 min video",
    link: "/blog"
  }
];

export default function Home() {
  const isMobile = useIsMobile();
  const { language, mode } = useAppStore();
  const isRetail = mode === 'retail';
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'featured' | 'new' | 'bestsellers'>('featured');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    async function fetchFeatured() {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .limit(12); // Fetch enough for tabs logic

      if (data && data.length > 0) {
        const mappedProducts: Product[] = data.map((p: any) => {
          const primaryImage = p.image || p.image_url || '/placeholder.jpg';
          return {
            id: p.id,
            name: p.name,
            description: p.description,
            retailPrice: p.retail_price,
            wholesalePrice: p.wholesale_price,
            wholesaleMOQ: p.wholesale_moq,
            primaryImage: primaryImage,
            image: primaryImage,
            gallery: (p.gallery && p.gallery.length > 0) ? p.gallery : [{ id: '1', type: 'image', url: primaryImage }],
            category: p.category,
            inStock: p.in_stock,
            reviews: p.reviews || [],
            groupId: p.group_id,
            variantAttributes: p.variant_attributes,
            variants: p.variants
          };
        });
        setFeaturedProducts(mappedProducts);
      } else {
        setFeaturedProducts([]);
      }
      setLoading(false);
    }
    fetchFeatured();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        await supabase.from('newsletter_subscribers').insert([{ email }]);
        setSubscribed(true);
        setTimeout(() => { setEmail(''); setSubscribed(false); }, 3000);
      } catch (e) { }
    }
  };

  // Simulate tab filtering
  const displayProducts = featuredProducts.slice(
    activeTab === 'featured' ? 0 : activeTab === 'new' ? 4 : 8,
    activeTab === 'featured' ? 8 : activeTab === 'new' ? 12 : 12
  );

  return (
    <div className="min-h-screen bg-[#020202] flex flex-col overflow-x-hidden selection:bg-amber-500/30">

      {/* Hero Section */}
      <Hero />

      {/* Glassmorphism Trust Banner */}
      <div className="relative z-20 -mt-10 mb-10 container mx-auto px-4">
        <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={isMobile ? { duration: 0 } : { delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-white/5 transition-all duration-300 group"
              >
                <div className="bg-black/50 p-4 rounded-full border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm md:text-base group-hover:text-amber-500 transition-colors uppercase tracking-wide">{f.title}</h3>
                  <p className="text-xs text-gray-400 mt-2 max-w-[160px] mx-auto leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Tabbed Collection Section */}
      <section className="py-24 container mx-auto px-4 relative">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-amber-900/10 blur-[150px] rounded-full pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row justify-between items-end mb-16 relative z-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Collection</span></h2>
            <p className="text-gray-400 max-w-xl text-lg">
              Explore the pinnacle of precision engineering and artisanal supply.
            </p>
          </div>

          <div className="flex bg-gray-900/50 p-1.5 rounded-full border border-white/10 mt-6 md:mt-0">
            {['featured', 'new', 'bestsellers'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-gray-400 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 min-h-[400px] items-center">
            <Loader2 className="animate-spin text-amber-500" size={48} />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 relative z-10"
            >
              {displayProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="h-full"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        <div className="mt-16 text-center">
          <Link href="/shop" className="inline-flex items-center gap-2 text-white bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-4 rounded-full font-bold transition-all group hover:border-amber-500/50">
            View Complete Catalog <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform text-amber-500" />
          </Link>
        </div>
      </section>

      {/* Side by Side: Helpful Guides & Interactive Promo */}
      <section className="py-24 bg-gradient-to-b from-[#020202] to-gray-900/20 border-t border-white/5 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left: Content & Guides */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold mb-6">
                <Star size={14} /> Knowledge Base
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">Expert Guides For <br /><span className="text-gray-500 italic font-light">Your Craft</span></h2>
              <p className="text-gray-400 text-lg mb-10 max-w-lg leading-relaxed">
                Whether you're a beginner learning to polish or a factory outfitting a new casting line, our expert guides help you choose the right tools.
              </p>

              <div className="space-y-4">
                {guideResources.map((guide, i) => (
                  <Link href={guide.link} key={i}>
                    <motion.div
                      whileHover={{ x: 10 }}
                      className="flex items-center gap-6 p-6 rounded-2xl bg-gray-900/40 border border-white/5 hover:border-amber-500/30 hover:bg-gray-800/40 transition-all cursor-pointer group mb-4"
                    >
                      <div className="w-14 h-14 rounded-xl bg-black flex items-center justify-center border border-white/5 shadow-inner group-hover:scale-110 transition-transform">
                        {guide.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white group-hover:text-amber-500 transition-colors">{guide.title}</h4>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-1">{guide.desc}</p>
                      </div>
                      <div className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                        {guide.duration} <ChevronRight size={14} className="group-hover:-mr-1 transition-all" />
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: Visual Showcase Bento Box */}
            <div className="grid grid-cols-2 gap-4 h-[500px] relative">
              <div className="absolute inset-0 bg-blue-500/10 blur-[100px] -z-10 rounded-full" />
              <div className="col-span-1 row-span-2 rounded-3xl overflow-hidden relative group">
                <img src="/images/products/sand-blasting-dust-collector-machine.png" alt="Showcase" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 mix-blend-luminosity hover:mix-blend-normal" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold text-white">New Machinery</span>
                  <h3 className="text-2xl font-bold text-white mt-3">Advanced Sandblasting</h3>
                </div>
              </div>
              <div className="col-span-1 row-span-1 rounded-3xl overflow-hidden relative group bg-amber-900/20 border border-amber-500/20 flex flex-col justify-center items-center p-6 text-center">
                <TrendingUp size={48} className="text-amber-500 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">B2B Wholesale</h3>
                <p className="text-sm text-amber-200/60">Unlock bulk pricing instantly.</p>
              </div>
              <div className="col-span-1 row-span-1 rounded-3xl overflow-hidden relative group">
                <img src="/images/products/gas-burner.png" alt="Showcase" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full backdrop-blur-md bg-white/10 border border-white/20 flex items-center justify-center text-white">
                    <PlayCircle size={24} />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Modern Bento Grid Categories */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Shop by <span className="text-gray-500 italic font-light">Category</span></h2>
            <p className="text-gray-400">Everything you need, neatly organized.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-4 md:h-[600px]">
            {/* Large Feature Category */}
            <Link href="/shop?cat=Tools" className="col-span-2 row-span-2 group relative rounded-3xl overflow-hidden border border-white/10">
              <div className="absolute inset-0 bg-gray-900 group-hover:bg-gray-800 transition-colors" />
              <img src="/images/products/15f-tweezers.png" alt="Tools" className="absolute inset-0 w-full h-full object-contain p-12 opacity-50 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700 mix-blend-screen" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-black mb-4"><ArrowRight size={20} className="-rotate-45" /></div>
                <h3 className="text-3xl font-bold text-white mb-2">Precision Tools</h3>
                <p className="text-gray-400">Tweezers, Pliers, Saws & Files</p>
              </div>
            </Link>

            {/* Small Categories */}
            {[
              { name: 'Machinery', desc: 'Heavy equipment' },
              { name: 'Consumables', desc: 'Solder & Flux' },
              { name: 'Packaging', desc: 'Display cards' },
              { name: 'Chemicals', desc: 'Cleaning sol.' }
            ].map((cat) => (
              <Link href={`/shop?cat=${cat.name}`} key={cat.name} className="col-span-1 row-span-1 group relative rounded-3xl overflow-hidden border border-white/10 bg-gray-900/50 hover:bg-gray-800/80 transition-all p-6 flex flex-col justify-end min-h-[250px] md:min-h-0">
                <h3 className="text-xl font-bold text-white group-hover:text-amber-500 transition-colors">{cat.name}</h3>
                <p className="text-sm text-gray-500">{cat.desc}</p>
                <ArrowRight size={20} className="absolute top-6 right-6 text-gray-600 group-hover:text-amber-500 -rotate-45 opacity-0 group-hover:opacity-100 transition-all translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Auto-scroll Marquee */}
      <section className="py-24 bg-gray-900/30 border-y border-white/5 overflow-hidden">
        <h2 className="text-3xl font-bold text-white mb-16 text-center">Trusted Globally</h2>
        <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
          <motion.div
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
            className="flex items-center justify-center md:justify-start gap-8 [&_child]:max-w-none"
          >
            {[...testimonials, ...testimonials].map((t, i) => (
              <div key={i} className="w-[350px] md:w-[450px] shrink-0 bg-black border border-white/10 p-8 rounded-3xl relative">
                <Quote size={40} className="absolute top-6 right-6 text-white/5" />
                <div className="flex gap-1 mb-6 text-amber-500">
                  {Array(t.rating).fill(0).map((_, idx) => <Star key={idx} size={16} fill="currentColor" />)}
                </div>
                <p className="text-gray-300 mb-8 leading-relaxed text-lg">"{t.content}"</p>
                <div>
                  <div className="font-bold text-white">{t.name}</div>
                  <div className="text-sm text-gray-500">{t.role}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Newsletter & CTA Sub-footer Segment */}
      <section className="py-24 container mx-auto px-4 relative">
        <div className="absolute inset-0 bg-blue-500/5 blur-[200px] rounded-full pointer-events-none -z-10" />
        <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-[3rem] p-8 md:p-16 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-amber-500/20 blur-[80px] rounded-full" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full" />

          <div className="flex-1 relative z-10 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Stay Ahead of the Curve</h2>
            <p className="text-gray-400 text-lg max-w-md mx-auto md:mx-0">Subscribe to our newsletter for exclusive insider market pricing, new tool arrivals, and business insights.</p>
          </div>

          <div className="flex-1 w-full max-w-md relative z-10">
            {subscribed ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center text-green-400 font-bold flex items-center justify-center gap-3">
                <ShieldCheck size={24} /> Subscribed Successfully!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
                <input
                  required
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider rounded-2xl px-6 py-4 transition-transform hover:-translate-y-1 active:translate-y-0">
                  Subscribe Now
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
