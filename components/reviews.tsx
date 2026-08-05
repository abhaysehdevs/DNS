'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Review } from '@/lib/data';
import { Star, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';

export function Reviews({ initialReviews, productId }: { initialReviews: Review[], productId: string }) {
    const { user } = useAppStore();
    const [reviews, setReviews] = useState<Review[]>(initialReviews);
    const [loading, setLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    // New Review State
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(5);
    const [submitting, setSubmitting] = useState(false);

    // Fetch DB reviews on mount
    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq('product_id', productId)
                .order('created_at', { ascending: false });

            if (data && !error) {
                const dbReviews: Review[] = data.map((r: any) => ({
                    id: r.id,
                    userName: r.user_name || 'Anonymous',
                    rating: r.rating,
                    comment: r.comment,
                    date: new Date(r.created_at).toLocaleDateString(),
                    verifiedPurchase: r.is_verified || false,
                    helpfulCount: 0
                }));
                
                // Combine and sort: verified reviews first
                const sortedReviews = [...dbReviews, ...initialReviews].sort((a, b) => {
                    if (a.verifiedPurchase && !b.verifiedPurchase) return -1;
                    if (!a.verifiedPurchase && b.verifiedPurchase) return 1;
                    return 0;
                });
                setReviews(sortedReviews);
            }
            setLoading(false);
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
                // PostgREST inner join syntax to search for product inside user's orders
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
        <div className="bg-[#1E1E1E] border border-[#343434] rounded-2xl p-8 text-[#F8F3E8] relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 bg-[#A67C35] text-black font-mono text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-xl shadow">
                Customer Feedback
            </div>

            <h3 className="text-2xl font-black text-[#F8F3E8] uppercase tracking-wider mb-6 flex items-center gap-3">
                Verified Reviews
            </h3>

            <div className="flex items-center gap-6 mb-8 bg-[#151515] p-5 border border-[#343434] rounded-xl shadow-inner">
                <div className="text-4xl font-black text-[#A67C35] tracking-tight">{averageRating.toFixed(1)}</div>
                <div>
                    <div className="flex text-[#A67C35] gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} fill={i < Math.round(averageRating) ? "currentColor" : "none"} strokeWidth={2} />
                        ))}
                    </div>
                    <p className="text-[10px] text-[#8E8E9A] font-bold uppercase tracking-widest mt-1">{reviews.length} Verified Customer Reviews</p>
                </div>
            </div>

            {/* Review List */}
            <div className="space-y-4 mb-8 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {reviews.length === 0 && <p className="text-[#8E8E9A] italic text-xs font-medium">No reviews yet. Be the first to share your feedback!</p>}
                {reviews.map((review, idx) => (
                    <div key={review.id || idx} className="bg-[#151515] border border-[#343434] p-5 rounded-xl hover:border-[#A67C35]/50 transition-all duration-300">
                        <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-[#242424] p-2 rounded-lg border border-[#343434] text-[#A67C35]"><User size={14} strokeWidth={2.5} /></div>
                                <div className="flex flex-col items-start gap-0.5">
                                    <span className="font-bold text-[#F8F3E8] uppercase tracking-wide text-xs">{review.userName}</span>
                                    {review.verifiedPurchase && (
                                        <span className="bg-[#A67C35]/15 text-[#A67C35] font-bold text-[8px] uppercase tracking-widest px-2 py-0.5 rounded border border-[#A67C35]/30">
                                            Verified Buyer
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span className="text-[9px] text-[#8E8E9A] font-mono uppercase font-bold">{review.date}</span>
                        </div>
                        <div className="flex text-[#A67C35] mb-2 gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={2} />
                            ))}
                        </div>
                        <p className="text-[#CFCFCF] text-xs leading-relaxed font-normal">{review.comment}</p>
                    </div>
                ))}
            </div>

            {/* Write Review */}
            <div className="border-t border-[#343434] pt-6">
                <h4 className="font-bold text-[#F8F3E8] text-base uppercase tracking-wider mb-4">Write a Product Review</h4>
                {user ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-[#8E8E9A] uppercase tracking-widest">Rating:</span>
                            <div className="flex gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="text-[#A67C35] hover:scale-110 transition-transform"
                                    >
                                        <Star size={20} fill={star <= rating ? "currentColor" : "none"} strokeWidth={2} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <textarea
                            className="w-full bg-[#151515] border border-[#343434] p-4 text-xs text-[#F8F3E8] focus:border-[#A67C35] focus:outline-none placeholder-[#8E8E9A] transition-colors rounded-xl font-medium"
                            rows={3}
                            placeholder="Share your technical feedback and build quality experience with this product..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                        />
                        <Button
                            type="submit"
                            className="bg-[#A67C35] hover:bg-[#8A6232] text-black font-bold uppercase tracking-widest text-[9.5px] px-8 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 border-none cursor-pointer"
                            disabled={submitting}
                        >
                            {submitting ? <Loader2 className="animate-spin" size={14} /> : null}
                            {submitting ? 'Submitting Feedback...' : 'Publish Review'}
                        </Button>
                    </form>
                ) : (
                    <div className="bg-[#151515] border border-[#343434] p-6 text-center rounded-xl">
                        <p className="text-xs text-[#F8F3E8] font-bold uppercase tracking-wider mb-1">Customer Account Required</p>
                        <p className="text-[10px] text-[#8E8E9A] mb-4 uppercase font-semibold">Log in with your customer account to post product reviews.</p>
                        <Link href="/login">
                            <Button className="bg-[#A67C35] hover:bg-[#8A6232] text-black font-bold uppercase tracking-widest text-[9px] px-6 py-2.5 rounded-xl shadow-md border-none cursor-pointer">
                                Login to Review
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
