import { NextRequest, NextResponse } from 'next/server';
import { walrusClient } from '@/lib/walrus-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data, blobId } = body;

    switch (action) {
      case 'store':
        if (!data) {
          return NextResponse.json({ error: 'Data is required for store action' }, { status: 400 });
        }

        const blob = await walrusClient.storeBlob(data);
        return NextResponse.json({
          success: true,
          blobId: blob.blobId,
          size: blob.size,
          encodedSize: blob.encodedSize,
          cost: blob.cost
        });

      case 'retrieve':
        if (!blobId) {
          return NextResponse.json({ error: 'Blob ID is required for retrieve action' }, { status: 400 });
        }

        const retrievedData = await walrusClient.retrieveBlob(blobId);
        return NextResponse.json({
          success: true,
          data: retrievedData
        });

      case 'exists':
        if (!blobId) {
          return NextResponse.json({ error: 'Blob ID is required for exists action' }, { status: 400 });
        }

        const exists = await walrusClient.blobExists(blobId);
        return NextResponse.json({
          success: true,
          exists
        });

      case 'status':
        const httpApiAvailable = await walrusClient.isHttpApiAvailable();
        return NextResponse.json({
          success: true,
          httpApiAvailable,
          mockMode: walrusClient['mockMode']
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Walrus API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const httpApiAvailable = await walrusClient.isHttpApiAvailable();
    
    return NextResponse.json({
      success: true,
      walrus: {
        httpApiAvailable,
        mockMode: walrusClient['mockMode'],
        version: '1.35.1',
        status: httpApiAvailable ? 'online' : 'mock'
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
