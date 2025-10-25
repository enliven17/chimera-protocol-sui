import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  const tempFile = join(tmpdir(), `walrus-retrieve-${Date.now()}.json`);
  
  try {
    const { searchParams } = new URL(request.url);
    const blobId = searchParams.get('blobId');

    if (!blobId) {
      return NextResponse.json(
        { error: 'Blob ID is required' },
        { status: 400 }
      );
    }

    // Check if Walrus CLI is available
    try {
      await execAsync('walrus --version');
    } catch {
      return NextResponse.json(
        { 
          error: 'Walrus CLI not available',
          details: 'Please install Walrus CLI: https://docs.wal.app/usage/client-cli.html'
        },
        { status: 503 }
      );
    }

    // Use Walrus CLI to retrieve the file
    const command = `walrus read "${blobId}" "${tempFile}"`;
    const { stdout, stderr } = await execAsync(command, { timeout: 30000 });

    // Check if file was created
    if (!existsSync(tempFile)) {
      throw new Error('Retrieved file not found');
    }

    // Read the retrieved file
    const data = readFileSync(tempFile, 'utf8');
    const parsedData = JSON.parse(data);

    return NextResponse.json({
      success: true,
      data: parsedData,
      method: 'cli',
      blobId
    });

  } catch (error) {
    console.error('Error retrieving from Walrus via CLI:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Blob not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to retrieve data from Walrus via CLI',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    // Clean up temporary file
    if (existsSync(tempFile)) {
      try {
        unlinkSync(tempFile);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp file:', cleanupError);
      }
    }
  }
}