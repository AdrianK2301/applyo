import { useState, useEffect } from 'react';
import { createClient } from '@/app/lib/supabase/client';

/**
 * Hook to resolve a storage path or URL into a temporary signed URL.
 * Useful for private buckets.
 */
export function useStorageUrl(pathOrUrl: string | null | undefined, bucket: string = 'documents') {
    const [url, setUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        if (!pathOrUrl) {
            setUrl(null);
            return;
        }

        async function getSignedUrl() {
            setLoading(true);
            try {
                // If it's a full URL, extract the path after the bucket name
                let path = pathOrUrl!;
                if (path.includes('/storage/v1/object/public/')) {
                    const parts = path.split(`/storage/v1/object/public/${bucket}/`);
                    if (parts.length > 1) {
                        path = parts[1];
                    }
                } else if (path.includes(`/storage/v1/object/authenticated/${bucket}/`)) {
                    const parts = path.split(`/storage/v1/object/authenticated/${bucket}/`);
                    if (parts.length > 1) {
                        path = parts[1];
                    }
                }

                const { data, error } = await supabase.storage
                    .from(bucket)
                    .createSignedUrl(path, 3600); // 1 hour validity

                if (error) {
                    console.error(`Error creating signed URL for ${path} in ${bucket}:`, error);
                    // Fallback to original if signed URL fails (e.g. if it was already a public URL and bucket is still public)
                    setUrl(pathOrUrl!);
                } else {
                    setUrl(data.signedUrl);
                }
            } catch (err) {
                console.error('Failed to get signed URL:', err);
                setUrl(pathOrUrl!);
            } finally {
                setLoading(false);
            }
        }

        getSignedUrl();
    }, [pathOrUrl, bucket, supabase.storage]);

    return { url, loading };
}
