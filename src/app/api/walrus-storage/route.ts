import { NextRequest, NextResponse } from 'next/server';

async function storeToWalrus(data: any): Promise<{blobId: string, size: number, cost: number}> {
  try {
    const publisherUrl = 'https://publisher.walrus-testnet.walrus.space';
    const jsonData = JSON.stringify(data);
    
    console.log('Storing to Walrus HTTP API:', publisherUrl);
    
    const response = await fetch(`${publisherUrl}/v1/blobs?epochs=1`, {
      method: 'PUT',
      body: jsonData,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Walrus HTTP API response:', result);

    // Extract blob ID from response
    let blobId = '';
    let size = 0;
    let cost = 0;

    if (result.newlyCreated) {
      blobId = result.newlyCreated.blobObject.blobId;
      size = result.newlyCreated.blobObject.size;
      cost = result.newlyCreated.cost;
    } else if (result.alreadyCertified) {
      blobId = result.alreadyCertified.blobId;
      size = 0; // Already certified, no size info
      cost = 0; // Already certified, no cost
    }

    if (!blobId) {
      throw new Error('Failed to extract blob ID from Walrus HTTP API response');
    }

    console.log('✅ Walrus HTTP API stored blob:', { blobId, size, cost });
    
    return { blobId, size, cost };
  } catch (error) {
    console.error('❌ Walrus HTTP API error:', error);
    throw new Error(`Walrus HTTP API failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, action, data } = body;

    if (type === 'comment' && action === 'store') {
      if (!data) {
        return NextResponse.json({ error: 'Comment data is required' }, { status: 400 });
      }
      
      // Use real Walrus HTTP API storage
      const blobResult = await storeToWalrus(data);
      return NextResponse.json({ 
        success: true, 
        blobId: blobResult.blobId,
        commentId: data.id,
        size: blobResult.size,
        cost: blobResult.cost
      });
    }

    if (type === 'bet' && action === 'store') {
      if (!data) {
        return NextResponse.json({ error: 'Bet data is required' }, { status: 400 });
      }
      
      // Use real Walrus HTTP API storage
      const blobResult = await storeToWalrus(data);
      return NextResponse.json({ 
        success: true, 
        blobId: blobResult.blobId,
        betId: data.id,
        size: blobResult.size,
        cost: blobResult.cost
      });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    console.error('Walrus storage API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}