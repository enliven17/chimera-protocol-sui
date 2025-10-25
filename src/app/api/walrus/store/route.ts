import { NextRequest, NextResponse } from 'next/server';

const WALRUS_PUBLISHER_URL = process.env.NEXT_PUBLIC_WALRUS_PUBLISHER_URL || 'https://publisher.walrus-testnet.walrus.space';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, type } = body;

    if (!data || !type) {
      return NextResponse.json(
        { error: 'Data and type are required' },
        { status: 400 }
      );
    }

    // Prepare data with metadata
    const walrusData = {
      ...data,
      type,
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    const jsonData = JSON.stringify(walrusData);
    const blob = new Blob([jsonData], { type: 'application/json' });

    const formData = new FormData();
    formData.append('file', blob);

    const response = await fetch(`${WALRUS_PUBLISHER_URL}/v1/store`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Walrus store failed: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.newlyCreated) {
      return NextResponse.json({
        success: true,
        blobId: result.newlyCreated.blobObject.blobId,
        size: result.newlyCreated.blobObject.size,
        encodedSize: result.newlyCreated.blobObject.encodedSize,
        cost: result.newlyCreated.cost,
        isNew: true,
      });
    } else if (result.alreadyCertified) {
      return NextResponse.json({
        success: true,
        blobId: result.alreadyCertified.blobId,
        size: result.alreadyCertified.size,
        encodedSize: result.alreadyCertified.encodedSize,
        cost: 0,
        isNew: false,
      });
    }

    throw new Error('Unexpected response format from Walrus');

  } catch (error) {
    console.error('Error storing to Walrus:', error);
    return NextResponse.json(
      { 
        error: 'Failed to store data to Walrus',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}