import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

export interface WalrusCliResult {
  blobId: string;
  size: number;
  cost: number;
}

export class WalrusCliClient {
  private configPath: string;

  constructor() {
    this.configPath = path.join(process.cwd(), 'walrus-config.yaml');
  }

  async storeBlob(data: any): Promise<WalrusCliResult> {
    try {
      // Create temporary file
      const tempFile = path.join(process.cwd(), `temp-${Date.now()}.json`);
      fs.writeFileSync(tempFile, JSON.stringify(data));

      // Execute Walrus CLI command
      const command = `walrus --config "${this.configPath}" --context testnet store --epochs 1 "${tempFile}"`;
      console.log('Executing Walrus CLI command:', command);
      
      const { stdout, stderr } = await execAsync(command);
      
      // Clean up temp file
      fs.unlinkSync(tempFile);

      if (stderr) {
        console.error('Walrus CLI stderr:', stderr);
      }

      // Parse output to extract blob ID
      const lines = stdout.split('\n');
      let blobId = '';
      let size = 0;
      let cost = 0;

      for (const line of lines) {
        if (line.includes('Blob ID:')) {
          blobId = line.split('Blob ID:')[1]?.trim() || '';
        }
        if (line.includes('Unencoded size:')) {
          const sizeMatch = line.match(/(\d+)\s*B/);
          if (sizeMatch) {
            size = parseInt(sizeMatch[1]);
          }
        }
        if (line.includes('Cost (excluding gas):')) {
          const costMatch = line.match(/([\d.]+)\s*WAL/);
          if (costMatch) {
            cost = parseFloat(costMatch[1]);
          }
        }
      }

      if (!blobId) {
        throw new Error('Failed to extract blob ID from Walrus CLI output');
      }

      console.log('✅ Walrus CLI stored blob:', { blobId, size, cost });
      
      return { blobId, size, cost };
    } catch (error) {
      console.error('❌ Walrus CLI error:', error);
      throw new Error(`Walrus CLI failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async retrieveBlob(blobId: string): Promise<any> {
    try {
      const command = `walrus --config "${this.configPath}" --context testnet read "${blobId}"`;
      console.log('Executing Walrus CLI read command:', command);
      
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        console.error('Walrus CLI stderr:', stderr);
      }

      // Parse JSON from stdout
      const lines = stdout.split('\n');
      let jsonStart = -1;
      let jsonEnd = -1;

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('{')) {
          jsonStart = i;
        }
        if (lines[i].trim().endsWith('}')) {
          jsonEnd = i;
          break;
        }
      }

      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error('Failed to find JSON in Walrus CLI output');
      }

      const jsonLines = lines.slice(jsonStart, jsonEnd + 1);
      const jsonString = jsonLines.join('\n');
      
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('❌ Walrus CLI retrieve error:', error);
      throw new Error(`Walrus CLI retrieve failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async blobExists(blobId: string): Promise<boolean> {
    try {
      await this.retrieveBlob(blobId);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
export const walrusCliClient = new WalrusCliClient();
