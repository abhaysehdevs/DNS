'use client';

import { useState, useEffect } from 'react';
import { Review } from '@/lib/data';
import { Star, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';

export function Reviews({ initialReviews, productId }: { initialReviews: Review[], productId: string }) {
    const { user } = useAppStore();
    const [reviews, setReviews] = useState<Review[]>(initialReviews); // Start with static/passed reviews
    const [loading, setLoading] = useState(false);

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
                // Map DB schema to Review interface
                const dbReviews: Review[] = data.map((r: any) => ({
                    id: r.id,
                    userName: r.user_name || 'Anonymous',
                    rating: r.rating,
                    comment: r.comment,
                    date: new Date(r.created_at).toLocaleDateString(),
                    verifiedPurchase: r.is_verified || false,
                    helpfulCount: 0
                }));
                // Combine with initial static reviews (deduplicated by logic if needed, but for now append)
                // Actually, if we have DB reviews, we might want to prioritize them or just show them.
                // Let's show DB reviews + initial ones (if they are hardcoded legacy ones).
                setReviews([...dbReviews, ...initialReviews]);
            }
            setLoading(false);
        };

        if (productId) fetchReviews();
    }, [productId, initialReviews]);

    const averageRating = reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;

        setSubmitting(true);

        const currentUserName = user?.name || 'Guest User';

        try {
            // Insert into Supabase
            const { data, error } = await supabase
                .from('reviews')
                .insert({
                    product_id: productId,
                    user_id: user?.id || null, // Null for guest
                    user_name: currentUserName,
                    rating,
                    comment
                })
                .select()
                .single();

            if (error) throw error;

            // Update UI optimistically or with returned data
            const newReview: Review = {
                id: data.id,
                userName: currentUserName,
                rating: data.rating,
                comment: data.comment,
                date: new Date(data.created_at).toLocaleDateString(),
                verifiedPurchase: false,
                helpfulCount: 0
            };

            setReviews([newReview, ...reviews]);
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
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-white mb-6">Customer Reviews</h3>

            <div className="flex items-center gap-4 mb-8">
                <div className="text-4xl font-bold text-amber-500">{averageRating.toFixed(1)}</div>
                <div>
                    <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} fill={i < Math.round(averageRating) ? "currentColor" : "none"} />
                        ))}
                    </div>
                    <p className="text-sm text-gray-400">{reviews.length} Reviews</p>
                </div>
            </div>

            {/* Review List */}
            <div className="space-y-6 mb-8 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {reviews.length === 0 && <p className="text-gray-500 italic">No reviews yet. Be the first!</p>}
                {reviews.map((review, idx) => (
                    <div key={review.id || idx} className="border-b border-gray-800 pb-4 last:border-0">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <div className="bg-gray-800 p-1 rounded-full"><User size={14} /></div>
                                <span className="font-medium text-gray-200">{review.userName}</span>
                            </div>
                            <span className="text-xs text-gray-500">{review.date}</span>
                        </div>
                        <div className="flex text-amber-500 mb-2">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                            ))}
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                ))}
            </div>

            {/* Write Review */}
            <form onSubmit={handleSubmit} className="border-t border-gray-800 pt-6">
                <h4 className="font-semibold text-white mb-4">Write a Review</h4>
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-gray-400">Rating:</span>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className={`text-amber-500 hover:scale-110 transition-transform`}
                            >
                                <Star size={20} fill={star <= rating ? "currentColor" : "none"} />
                            </button>
                        ))}
                    </div>
                </div>
                <textarea
                    className="w-full bg-black border border-gray-700 rounded-md p-3 text-white focus:border-amber-500 focus:outline-none mb-4 min-h-[100px]"
                    rows={3}
                    placeholder="Share your experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                />
                <Button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    disabled={submitting}
                >
                    {submitting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                    {submitting ? 'Posting...' : 'Post Review'}
                </Button>
            </form>
        </div>
    );
}
