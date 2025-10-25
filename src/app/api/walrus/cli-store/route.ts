import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  const tempFile = join(tmpdir(), `walrus-${Date.now()}.json`);
  
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

    // Write data to temporary file
    writeFileSync(tempFile, JSON.stringify(walrusData, null, 2));

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

    // Use Walrus CLI to store the file
    const command = `walrus store "${tempFile}"`;
    const { stdout, stderr } = await execAsync(command, { timeout: 30000 });

    // Parse the output to extract blob ID
    const blobIdMatch = stdout.match(/Blob ID: ([a-zA-Z0-9_-]+)/i) || 
                       stdout.match(/([a-zA-Z0-9_-]{43,44})/); // Common blob ID format

    if (blobIdMatch) {
      return NextResponse.json({
        success: true,
        blobId: blobIdMatch[1],
        method: 'cli',
        output: stdout.trim()
      });
    } else {
      throw new Error(`Failed to extract blob ID from CLI output: ${stdout}`);
    }

  } catch (error) {
    console.error('Error storing to Walrus via CLI:', error);
    return NextResponse.json(
      { 
        error: 'Failed to store data to Walrus via CLI',
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