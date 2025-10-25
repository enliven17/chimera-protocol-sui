'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state'); // provider
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state');
        }

        setMessage('Exchanging authorization code...');

        // Exchange code for JWT token
        const response = await fetch('/api/auth/zklogin/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            provider: state,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to authenticate');
        }

        const data = await response.json();
        
        setMessage('Generating zkLogin proof...');

        // Generate zkLogin proof
        const proofResponse = await fetch('/api/auth/zklogin/prove', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jwt: data.jwt,
            userInfo: data.userInfo,
          }),
        });

        if (!proofResponse.ok) {
          const errorData = await proofResponse.json();
          throw new Error(errorData.error || 'Failed to generate proof');
        }

        const proofData = await proofResponse.json();

        // Save session
        const session = {
          userInfo: data.userInfo,
          suiAddress: proofData.suiAddress,
          userSalt: proofData.userSalt,
          zkProof: proofData.zkProof,
          ephemeralPrivateKey: proofData.ephemeralPrivateKey,
        };

        localStorage.setItem('zklogin-session', JSON.stringify(session));

        setStatus('success');
        setMessage('Authentication successful! Redirecting...');

        // Redirect to home page after 2 seconds
        setTimeout(() => {
          router.push('/');
        }, 2000);

      } catch (error) {
        console.error('Authentication failed:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Authentication failed');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#0A0C14] via-[#1A1F2C] to-[#0A0C14] p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50 shadow-xl">
        <CardContent className="p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-[#4DA6FF]/20 to-[#3B82F6]/20 rounded-full flex items-center justify-center mb-6">
                <Loader2 className="h-8 w-8 text-[#4DA6FF] animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Authenticating
              </h3>
              <p className="text-gray-400 mb-6">
                {message}
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Success!
              </h3>
              <p className="text-gray-400 mb-6">
                {message}
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center mb-6">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Authentication Failed
              </h3>
              <p className="text-gray-400 mb-6">
                {message}
              </p>
              <Button
                asChild
                className="bg-gradient-to-r from-[#4DA6FF] to-[#3B82F6] hover:from-[#3B82F6] hover:to-[#2563EB] text-white"
              >
                <Link href="/">
                  Return Home
                </Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}