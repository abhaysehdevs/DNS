'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore, User } from '@/lib/store';

export function AuthListener() {
    const { setUser } = useAppStore();

    useEffect(() => {
        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                const userName = session.user.user_metadata?.full_name || 
                                 session.user.user_metadata?.name || 
                                 session.user.email?.split('@')[0];
                const userObj: User = {
                    id: session.user.id,
                    email: session.user.email!,
                    name: userName,
                    created_at: session.user.created_at
                };
                setUser(userObj);
            }
        });

        // Realtime auth listener for all OAuth callbacks, logins, and logouts
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const userName = session.user.user_metadata?.full_name || 
                                 session.user.user_metadata?.name || 
                                 session.user.email?.split('@')[0];
                const userObj: User = {
                    id: session.user.id,
                    email: session.user.email!,
                    name: userName,
                    created_at: session.user.created_at
                };
                setUser(userObj);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [setUser]);

    return null;
}
