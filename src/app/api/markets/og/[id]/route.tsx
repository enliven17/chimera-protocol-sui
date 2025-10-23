/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/markets/og/[id]/route.tsx
import { ImageResponse } from "@vercel/og";
import React from "react";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const marketId = params.id;

    // Create a simple OG image for the market
    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #0A0C14 0%, #1A1F2C 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, sans-serif',
            color: 'white',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#eab308',
                marginRight: '16px',
              }}
            >
              📊
            </div>
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              ChimeraAI
            </div>
          </div>

          {/* Market Info */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              maxWidth: '800px',
            }}
          >
            <div
              style={{
                fontSize: '36px',
                fontWeight: 'bold',
                marginBottom: '20px',
                color: 'white',
              }}
            >
              Market #{marketId}
            </div>
            <div
              style={{
                fontSize: '24px',
                color: '#9CA3AF',
                marginBottom: '30px',
              }}
            >
              Decentralized Prediction Market
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#eab308',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '20px',
                fontWeight: 'bold',
              }}
            >
              Trade Now on Hedera
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              fontSize: '18px',
              color: '#6B7280',
            }}
          >
            Powered by Hedera Testnet
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('OG Image generation error:', error);
    
    // Fallback simple image
    return new ImageResponse(
      (
        <div
          style={{
            background: '#0A0C14',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            fontWeight: 'bold',
            color: 'white',
          }}
        >
          ChimeraAI
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}