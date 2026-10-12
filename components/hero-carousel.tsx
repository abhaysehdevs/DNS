'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { getProductUrl } from '@/lib/slug';

export interface HeroProductItem {
    id: string;
    name: string;
    category: string;
    retailPrice: number;
    image: string;
    slug?: string;
}

interface HeroCarouselProps {
    products: HeroProductItem[];
}

function formatInr(amount: number): string {
    if (!amount || amount <= 0) return 'Ask for price';
    return `₹${amount.toLocaleString('en-IN')}`;
}

export function HeroCarousel({ products }: HeroCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

    const count = products.length;

    // Synchronize activeIndex when user swipes the scroll-snap container on mobile
    const handleScroll = useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el || count === 0) return;
        const scrollLeft = el.scrollLeft;
        const cardWidth = el.offsetWidth * 0.82; // 82% width per card
        if (cardWidth <= 0) return;
        const index = Math.round(scrollLeft / cardWidth);
        const clamped = Math.max(0, Math.min(index, count - 1));
        if (clamped !== activeIndex) {
            setActiveIndex(clamped);
        }
    }, [activeIndex, count]);

    const scrollToSlide = useCallback((index: number) => {
        const target = Math.max(0, Math.min(index, count - 1));
        setActiveIndex(target);
        const el = scrollContainerRef.current;
        if (el) {
            const cardWidth = el.offsetWidth * 0.82;
            el.scrollTo({
                left: target * (cardWidth + 12),
                behavior: 'smooth'
            });
        }
    }, [count]);

    const handlePrev = useCallback(() => {
        scrollToSlide(activeIndex === 0 ? count - 1 : activeIndex - 1);
    }, [activeIndex, count, scrollToSlide]);

    const handleNext = useCallback(() => {
        scrollToSlide(activeIndex === count - 1 ? 0 : activeIndex + 1);
    }, [activeIndex, count, scrollToSlide]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            handlePrev();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            handleNext();
        }
    }, [handlePrev, handleNext]);

    // Optional subtle auto-rotation every 7 seconds, pauses on hover, focus, touch
    useEffect(() => {
        // Respect prefers-reduced-motion
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced || isPaused || count <= 1) return;

        autoplayTimerRef.current = setTimeout(() => {
            scrollToSlide((activeIndex + 1) % count);
        }, 7000);

        return () => {
            if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current);
        };
    }, [activeIndex, isPaused, count, scrollToSlide]);

    if (!products || products.length === 0) {
        return null;
    }

    const activeProduct = products[activeIndex] || products[0];
    const activeUrl = getProductUrl(activeProduct);

    return (
        <div 
            className="w-full relative select-none"
            role="region"
            aria-roledescription="carousel"
            aria-label="Featured Jewellery Workshop Tools"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
        >
            {/* =========================================================================
                1. MOBILE VIEWPORT CAROUSEL (< 1024px)
                Horizontal scroll-snap with 14% peek of next card, smooth touch
               ========================================================================= */}
            <div className="block lg:hidden w-full">
                <div 
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex gap-3 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory no-scrollbar touch-pan-x"
                    style={{
                        scrollSnapType: 'x mandatory',
                        overscrollBehaviorX: 'contain',
                        WebkitOverflowScrolling: 'touch',
                        paddingRight: '1rem',
                        paddingLeft: '0.125rem'
                    }}
                >
                    {products.map((item, index) => {
                        const url = getProductUrl(item);
                        const isLcp = index === 0;

                        return (
                            <div 
                                key={item.id || index}
                                className="shrink-0 w-[82vw] max-w-[320px] snap-start"
                            >
                                <Link
                                    href={url}
                                    className="block group bg-white border border-[#E8E2D5] hover:border-[#966E2E] rounded-2xl p-3 shadow-xs transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#966E2E] active:scale-[0.99]"
                                >
                                    {/* Image Wrapper */}
                                    <div className="relative w-full aspect-square bg-[#FAF9F5] rounded-xl overflow-hidden border border-[#E8E2D5]/60 mb-2.5 flex items-center justify-center">
                                        <Image
                                            src={item.image || '/placeholder.jpg'}
                                            alt={item.name}
                                            fill
                                            sizes="(max-width: 640px) 280px, 320px"
                                            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                                            priority={isLcp}
                                            loading={isLcp ? 'eager' : 'lazy'}
                                        />
                                        <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-xs border border-[#E8E2D5] text-[9.5px] font-bold text-[#7A541E] px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            {item.category || 'Tool'}
                                        </div>
                                    </div>

                                    {/* Product Meta */}
                                    <div className="space-y-1">
                                        <h2 className="text-xs font-semibold text-[#18181B] line-clamp-2 min-h-[32px] group-hover:text-[#966E2E] transition-colors leading-snug">
                                            {item.name}
                                        </h2>
                                        <div className="flex items-baseline justify-between pt-1">
                                            <span className="text-sm font-bold text-[#18181B] font-mono">
                                                {formatInr(item.retailPrice)}
                                            </span>
                                            <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[#7A541E] group-hover:underline">
                                                View <ArrowUpRight size={13} aria-hidden="true" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>

                {/* Mobile Slide Dot Indicators */}
                {count > 1 && (
                    <div className="flex items-center justify-center gap-1.5 pt-2" aria-hidden="true">
                        {products.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => scrollToSlide(i)}
                                className={`h-1.5 rounded-full transition-all duration-200 ${
                                    i === activeIndex 
                                        ? 'w-5 bg-[#966E2E]' 
                                        : 'w-1.5 bg-[#E8E2D5] hover:bg-[#B88E3E]'
                                }`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* =========================================================================
                2. DESKTOP VIEWPORT SHOWCASE (>= 1024px)
                Refined Workshop Showcase Card with Thumbnail Navigation
               ========================================================================= */}
            <div className="hidden lg:block w-full">
                <div className="bg-white border border-[#E8E2D5] rounded-3xl p-6 lg:p-7 shadow-sm transition-all relative overflow-hidden group">
                    {/* Subtle warm backdrop texture */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#FAF9F5] rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 opacity-80" />

                    {/* Card Header Tag */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8E2D5] relative z-10">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#966E2E]" aria-hidden="true" />
                            <span className="text-[10.5px] font-mono font-bold tracking-[0.2em] text-[#7A541E] uppercase">
                                FEATURED IN STOCK · CHANDNI CHOWK
                            </span>
                        </div>
                        <span className="text-[10px] font-mono font-medium text-[#71717A] bg-[#FAF9F5] border border-[#E8E2D5] px-2.5 py-0.5 rounded-full">
                            {activeIndex + 1} / {count}
                        </span>
                    </div>

                    {/* Active Product Main Card */}
                    <Link
                        href={activeUrl}
                        className="block relative z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#966E2E]"
                    >
                        {/* Image Preview Container */}
                        <div className="relative w-full aspect-[4/3] bg-[#FAF9F5] rounded-2xl overflow-hidden border border-[#E8E2D5]/70 flex items-center justify-center p-6 group/img">
                            <Image
                                src={activeProduct.image || '/placeholder.jpg'}
                                alt={activeProduct.name}
                                fill
                                sizes="(min-width: 1024px) 460px, 320px"
                                className="object-contain p-4 group-hover/img:scale-105 transition-transform duration-500"
                                priority
                                loading="eager"
                            />
                            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs border border-[#E8E2D5] text-[10px] font-bold text-[#7A541E] px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                                {activeProduct.category || 'Tools & Machinery'}
                            </div>
                        </div>

                        {/* Product Title & Pricing */}
                        <div className="mt-4 space-y-1">
                            <h2 className="text-base font-semibold text-[#18181B] line-clamp-2 hover:text-[#966E2E] transition-colors leading-snug">
                                {activeProduct.name}
                            </h2>
                            <div className="flex items-baseline justify-between pt-1">
                                <div className="space-y-0.5">
                                    <div className="text-lg font-bold text-[#18181B] font-mono">
                                        {formatInr(activeProduct.retailPrice)}
                                    </div>
                                    <div className="text-[10.5px] text-[#71717A]">
                                        Inclusive of GST · Available for immediate dispatch
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#7A541E] bg-[#FAF9F5] border border-[#E8E2D5] hover:border-[#966E2E] px-3.5 py-2 rounded-xl transition-all shadow-2xs">
                                    View Details <ArrowUpRight size={14} aria-hidden="true" />
                                </span>
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Navigation & Thumbnails */}
                    {count > 1 && (
                        <div className="mt-5 pt-4 border-t border-[#E8E2D5] flex items-center justify-between gap-3 relative z-10">
                            {/* Thumbnails */}
                            <div className="flex items-center gap-2 overflow-x-auto py-1">
                                {products.map((item, idx) => (
                                    <button
                                        key={item.id || idx}
                                        type="button"
                                        onClick={() => scrollToSlide(idx)}
                                        className={`relative w-12 h-12 rounded-xl overflow-hidden border transition-all shrink-0 cursor-pointer ${
                                            idx === activeIndex
                                                ? 'border-[#966E2E] ring-2 ring-[#966E2E]/20 bg-white'
                                                : 'border-[#E8E2D5] hover:border-[#B88E3E] bg-[#FAF9F5] opacity-70 hover:opacity-100'
                                        }`}
                                        aria-label={`Select ${item.name}`}
                                    >
                                        <Image
                                            src={item.image || '/placeholder.jpg'}
                                            alt={item.name}
                                            fill
                                            sizes="48px"
                                            className="object-contain p-1"
                                            loading="lazy"
                                        />
                                    </button>
                                ))}
                            </div>

                            {/* Arrow Controls */}
                            <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                    type="button"
                                    onClick={handlePrev}
                                    className="w-9 h-9 rounded-xl border border-[#E8E2D5] hover:border-[#966E2E] bg-white hover:bg-[#FAF9F5] text-[#18181B] flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#966E2E]"
                                    aria-label="Previous product"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="w-9 h-9 rounded-xl border border-[#E8E2D5] hover:border-[#966E2E] bg-white hover:bg-[#FAF9F5] text-[#18181B] flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#966E2E]"
                                    aria-label="Next product"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
