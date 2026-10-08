'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Review } from '@/lib/data';
import { Star, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';

export function Reviews({ initialReviews = [], productId }: { initialReviews?: Review[], productId: string }) {
    const { user } = useAppStore();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [isVerified, setIsVerified] = useState(false);

    // New Review State
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(5);
    const [submitting, setSubmitting] = useState(false);

    // Fetch authentic DB reviews on mount
    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('reviews')
                    .select('*')
                    .eq('product_id', productId)
                    .order('created_at', { ascending: false });

                if (data && !error && data.length > 0) {
                    const dbReviews: Review[] = data.map((r: any) => ({
                        id: r.id,
                        userName: r.user_name || 'Verified Customer',
                        rating: r.rating || 5,
                        comment: r.comment,
                        date: new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                        verifiedPurchase: r.is_verified || false,
                        helpfulCount: 0
                    }));
                    setReviews(dbReviews);
                } else if (initialReviews && initialReviews.length > 0) {
                    setReviews(initialReviews);
                } else {
                    setReviews([]);
                }
            } catch (e) {
                setReviews(initialReviews || []);
            } finally {
                setLoading(false);
            }
        };

        if (productId) fetchReviews();
    }, [productId, initialReviews]);

    // Check if the current user is a verified buyer of this product
    useEffect(() => {
        const checkVerification = async () => {
            if (!user?.email || !productId) {
                setIsVerified(false);
                return;
            }
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('id, order_items!inner(product_id)')
                    .eq('customer_email', user.email)
                    .eq('order_items.product_id', productId);
                
                if (data && data.length > 0 && !error) {
                    setIsVerified(true);
                } else {
                    setIsVerified(false);
                }
            } catch (e) {
                setIsVerified(false);
            }
        };

        checkVerification();
    }, [user, productId]);

    const averageRating = reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;

        setSubmitting(true);
        const currentUserName = user?.name || user?.email?.split('@')[0] || 'User';

        try {
            const { data, error } = await supabase
                .from('reviews')
                .insert({
                    product_id: productId,
                    user_id: user?.id || null,
                    user_name: currentUserName,
                    rating,
                    comment,
                    is_verified: isVerified
                })
                .select()
                .single();

            if (error) throw error;

            const newReview: Review = {
                id: data.id,
                userName: currentUserName,
                rating: data.rating,
                comment: data.comment,
                date: new Date(data.created_at).toLocaleDateString(),
                verifiedPurchase: isVerified,
                helpfulCount: 0
            };

            const updatedReviews = [newReview, ...reviews].sort((a, b) => {
                if (a.verifiedPurchase && !b.verifiedPurchase) return -1;
                if (!a.verifiedPurchase && b.verifiedPurchase) return 1;
                return 0;
            });

            setReviews(updatedReviews);
            setComment('');
            setRating(5);
            alert('Review submitted successfully!');

        } catch (err: any) {
            console.error('Error submitting review:', err);
            alert('Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white border border-[#E8E2D5] rounded-2xl p-5 sm:p-7 md:p-8 text-[#18181B] relative overflow-hidden shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8E2D5] pb-4 mb-6">
                <div>
                    <h3 className="text-xl sm:text-2xl font-black text-[#18181B] uppercase tracking-wider flex items-center gap-2.5">
                        Verified Reviews & Ratings
                    </h3>
                    <p className="text-[10px] text-[#71717A] font-bold uppercase tracking-widest mt-0.5">
                        Authentic workshop feedback from verified buyers
                    </p>
                </div>
                <div className="bg-[#966E2E] text-white font-mono text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-md shadow-xs">
                    Customer Feedback
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                
                {/* Left Column: Rating Overview & Review Form */}
                <div className="lg:col-span-5 space-y-4">
                    {/* Score Summary Box */}
                    <div className="flex items-center gap-4 bg-[#FAF9F5] p-4 sm:p-5 border border-[#E8E2D5] rounded-xl">
                        <div className="text-3xl sm:text-4xl font-black text-[#966E2E] tracking-tight shrink-0">
                            {averageRating > 0 ? averageRating.toFixed(1) : '5.0'}
                        </div>
                        <div>
                            <div className="flex text-[#966E2E] gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star 
                                        key={i} 
                                        size={15} 
                                        fill={i < Math.round(averageRating > 0 ? averageRating : 5) ? "currentColor" : "none"} 
                                        strokeWidth={2} 
                                    />
                                ))}
                            </div>
                            <p className="text-[10px] text-[#71717A] font-bold uppercase tracking-widest mt-1">
                                {reviews.length > 0 ? `${reviews.length} Verified Customer Reviews` : 'Verified Quality Rating'}
                            </p>
                        </div>
                    </div>

                    {/* Write Review Form Card */}
                    <div className="bg-[#FAF9F5] border border-[#E8E2D5] p-4 sm:p-5 rounded-xl">
                        <h4 className="font-bold text-[#18181B] text-xs uppercase tracking-wider mb-3">Write a Product Review</h4>
                        {user ? (
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Your Rating:</span>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                className="text-[#966E2E] hover:scale-110 transition-transform cursor-pointer p-0.5"
                                            >
                                                <Star size={18} fill={star <= rating ? "currentColor" : "none"} strokeWidth={2} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <textarea
                                    className="w-full bg-white border border-[#E8E2D5] p-3 text-xs text-[#18181B] focus:border-[#966E2E] focus:outline-none placeholder-[#A1A1AA] transition-colors rounded-lg font-normal resize-none"
                                    rows={3}
                                    placeholder="Share your technical feedback and workshop experience..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                />
                                <Button
                                    type="submit"
                                    className="w-full bg-[#966E2E] hover:bg-[#7D5A25] text-white font-bold uppercase tracking-widest text-[9px] py-2.5 rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
                                    disabled={submitting}
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={13} /> : null}
                                    {submitting ? 'Submitting Feedback...' : 'Publish Review'}
                                </Button>
                            </form>
                        ) : (
                            <div className="text-center py-2">
                                <p className="text-[11px] text-[#71717A] mb-3 uppercase font-semibold">Log in with your customer account to post a review.</p>
                                <Link href="/login" className="inline-block w-full">
                                    <Button className="w-full bg-[#966E2E] hover:bg-[#7D5A25] text-white font-bold uppercase tracking-widest text-[9px] py-2 rounded-lg shadow-xs border-none cursor-pointer">
                                        Login to Review
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Customer Reviews List */}
                <div className="lg:col-span-7">
                    {reviews.length === 0 ? (
                        <div className="bg-[#FAF9F5] border border-dashed border-[#E8E2D5] rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[220px]">
                            <Star size={24} className="text-[#966E2E]/40 mb-2" strokeWidth={1.5} />
                            <h5 className="font-bold text-xs uppercase tracking-wider text-[#18181B] mb-1">No Reviews Yet</h5>
                            <p className="text-[#71717A] text-xs max-w-sm leading-relaxed">
                                Be the first verified customer to share your workshop experience and build quality rating for this tool!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1.5 custom-scrollbar">
                            {reviews.map((review, idx) => (
                                <div key={review.id || idx} className="bg-[#FAF9F5] border border-[#E8E2D5] p-4 rounded-xl hover:border-[#966E2E]/50 transition-all duration-200">
                                    <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-white p-1.5 rounded-lg border border-[#E8E2D5] text-[#966E2E] shadow-xs">
                                                <User size={13} strokeWidth={2.5} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-[#18181B] uppercase tracking-wide text-xs">{review.userName}</span>
                                                {review.verifiedPurchase && (
                                                    <span className="bg-[#966E2E]/10 text-[#966E2E] font-bold text-[7.5px] uppercase tracking-widest px-1.5 py-0.5 rounded border border-[#966E2E]/30">
                                                        Verified Buyer
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-[8.5px] text-[#71717A] font-mono uppercase font-bold">{review.date}</span>
                                    </div>
                                    <div className="flex text-[#966E2E] mb-1.5 gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={11} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={2} />
                                        ))}
                                    </div>
                                    <p className="text-[#52525B] text-xs leading-relaxed font-normal">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
