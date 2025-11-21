'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function TokenRedirect() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  useEffect(() => {
    // Redirect to the proper share URL
    if (token) {
      router.replace(`/share/${token}`);
    } else {
      router.replace('/');
    }
  }, [token, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p>रीडायरेक्ट हो रहा है...</p>
      </div>
    </div>
  );
}