import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Resolves the current user's Weclapp partyId.
 * 
 * Flow:
 * 1. Check user.weclapp_party_id (persisted in Base44 user profile)
 * 2. If not set, call weclappProxy resolve mode with user email
 * 3. Persist the found partyId back to the user profile
 */
export function useWeclappParty() {
    const [partyId, setPartyId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function resolve() {
            try {
                const user = await base44.auth.me();
                if (!user) { setIsLoading(false); return; }

                if (user.role === 'admin') {
                    setIsAdmin(true);
                    setIsLoading(false);
                    return;
                }

                // Already resolved and stored
                if (user.weclapp_party_id) {
                    if (!cancelled) {
                        setPartyId(user.weclapp_party_id);
                        setIsLoading(false);
                    }
                    return;
                }

                // Resolve via email lookup
                const response = await base44.functions.invoke('weclappProxy', {
                    mode: 'resolve',
                    email: user.email,
                });
                const result = response.data;

                if (result?.success && result.partyId) {
                    // Persist to user profile so we don't need to re-resolve next time
                    await base44.auth.updateMe({ weclapp_party_id: result.partyId });
                    if (!cancelled) setPartyId(result.partyId);
                } else {
                    if (!cancelled) setError('Kein Weclapp-Händler für diese E-Mail gefunden.');
                }
            } catch (e) {
                if (!cancelled) setError(e.message);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        resolve();
        return () => { cancelled = true; };
    }, []);

    return { partyId, isLoading, error, isAdmin };
}