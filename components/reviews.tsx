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
        <div className="bg-black border-4 border-[#F5D800] rounded-none p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-[#F8F3E8] relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#F5D800] text-black font-mono text-[9px] font-black uppercase tracking-widest px-4 py-1.5 shadow-[-2px_2px_0px_0px_rgba(0,0,0,1)] border-b border-l border-black">
                Feedback Loop
            </div>

            <h3 className="text-3xl font-black text-white uppercase tracking-wider mb-6 flex items-center gap-3">
                Customer Reviews
            </h3>

            <div className="flex items-center gap-6 mb-8 bg-[#151515] p-5 border-2 border-white/10 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                <div className="text-5xl font-black text-[#F5D800] tracking-tighter">{averageRating.toFixed(1)}</div>
                <div>
                    <div className="flex text-[#F5D800] gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={18} fill={i < Math.round(averageRating) ? "currentColor" : "none"} strokeWidth={2.5} />
                        ))}
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{reviews.length} Total Reviews</p>
                </div>
            </div>

            {/* Review List */}
            <div className="space-y-6 mb-8 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {reviews.length === 0 && <p className="text-gray-500 italic font-medium">No reviews yet. Be the first to share your thoughts!</p>}
                {reviews.map((review, idx) => (
                    <div key={review.id || idx} className="bg-[#151515]/30 border-2 border-white/10 p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:border-[#F5D800]/50 transition-all duration-300">
                        <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-[#1E1E1E] p-1.5 border border-white/15 text-[#F5D800]"><User size={14} strokeWidth={2.5} /></div>
                                <div className="flex flex-col items-start gap-1">
                                    <span className="font-bold text-[#F8F3E8] uppercase tracking-wide text-xs">{review.userName}</span>
                                    {review.verifiedPurchase && (
                                        <span className="bg-[#F5D800] text-black font-black text-[8px] uppercase tracking-widest px-1.5 py-0.5 border border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                                            Verified Buyer
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span className="text-[9px] text-gray-500 font-mono uppercase font-bold">{review.date}</span>
                        </div>
                        <div className="flex text-[#F5D800] mb-3 gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={2} />
                            ))}
                        </div>
                        <p className="text-gray-300 text-xs leading-relaxed font-medium">{review.comment}</p>
                    </div>
                ))}
            </div>

            {/* Write Review */}
            <div className="border-t-2 border-white/15 pt-8">
                <h4 className="font-black text-white text-lg uppercase tracking-wider mb-6">Write a Review</h4>
                {user ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Rating:</span>
                            <div className="flex gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className={`text-[#F5D800] hover:scale-125 transition-all`}
                                    >
                                        <Star size={24} fill={star <= rating ? "currentColor" : "none"} strokeWidth={2} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <textarea
                            className="w-full bg-black border-2 border-white/10 p-4 text-xs text-white focus:border-[#F5D800] focus:outline-none placeholder-gray-600 transition-colors rounded-none"
                            rows={3}
                            placeholder="SHARE YOUR EXPERIENCES WITH THIS PRECISION SKU..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                        />
                        <Button
                            type="submit"
                            className="bg-[#F5D800] hover:bg-[#d4ba00] text-black font-black uppercase tracking-widest text-[10px] px-8 py-3 rounded-none border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2"
                            disabled={submitting}
                        >
                            {submitting ? <Loader2 className="animate-spin" size={14} /> : null}
                            {submitting ? 'Publishing Feedback...' : 'Publish Review'}
                        </Button>
                    </form>
                ) : (
                    <div className="bg-[#151515] border-2 border-white/10 p-6 text-center rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
                        <p className="text-xs text-gray-300 font-bold uppercase tracking-wider mb-2">Verified Buyers Access Only</p>
                        <p className="text-[10px] text-gray-500 mb-4">LOG IN WITH YOUR ACCOUNT TO AUTHORIZE THIS REVIEW FEEDBACK FLOW.</p>
                        <Link href="/login">
                            <Button className="bg-[#F5D800] hover:bg-[#d4ba00] text-black font-black uppercase tracking-widest text-[9px] px-6 py-2.5 rounded-none border border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all">
                                Login to Authorize
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
