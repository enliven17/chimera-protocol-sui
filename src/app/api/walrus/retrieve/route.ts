import { NextRequest, NextResponse } from 'next/server';

const WALRUS_AGGREGATOR_URL = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL || 'https://aggregator.walrus-testnet.walrus.space';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blobId = searchParams.get('blobId');

    if (!blobId) {
      return NextResponse.json(
        { error: 'Blob ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${WALRUS_AGGREGATOR_URL}/v1/${blobId}`);

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Blob not found' },
          { status: 404 }
        );
      }
      throw new Error(`Walrus retrieve failed: ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error('Error retrieving from Walrus:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve data from Walrus',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function HEAD(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blobId = searchParams.get('blobId');

    if (!blobId) {
      return new NextResponse(null, { status: 400 });
    }

    const response = await fetch(`${WALRUS_AGGREGATOR_URL}/v1/${blobId}`, {
      method: 'HEAD',
    });

    return new NextResponse(null, { 
      status: response.ok ? 200 : 404 
    });

  } catch (error) {
    console.error('Error checking blob existence:', error);
    return new NextResponse(null, { status: 500 });
  }
}