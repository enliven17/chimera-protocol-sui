import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, readFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

export interface WalrusCliResult {
  blobId: string;
  success: boolean;
  error?: string;
}

export class WalrusCliClient {
  private tempDir: string;

  constructor() {
    this.tempDir = tmpdir();
  }

  /**
   * Store data using Walrus CLI
   */
  async storeData(data: any): Promise<WalrusCliResult> {
    const tempFile = join(this.tempDir, `walrus-${Date.now()}.json`);
    
    try {
      // Write data to temporary file
      writeFileSync(tempFile, JSON.stringify(data, null, 2));

      // Use Walrus CLI to store the file
      const command = `walrus store ${tempFile}`;
      const { stdout, stderr } = await execAsync(command);

      // Parse the output to extract blob ID
      const blobIdMatch = stdout.match(/Blob ID: ([a-zA-Z0-9_-]+)/);
      
      if (blobIdMatch) {
        return {
          blobId: blobIdMatch[1],
          success: true
        };
      } else {
        throw new Error(`Failed to extract blob ID from output: ${stdout}`);
      }

    } catch (error) {
      return {
        blobId: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      // Clean up temporary file
      if (existsSync(tempFile)) {
        unlinkSync(tempFile);
      }
    }
  }

  /**
   * Retrieve data using Walrus CLI
   */
  async retrieveData(blobId: string): Promise<any> {
    const tempFile = join(this.tempDir, `walrus-retrieve-${Date.now()}.json`);
    
    try {
      // Use Walrus CLI to retrieve the file
      const command = `walrus read ${blobId} ${tempFile}`;
      await execAsync(command);

      // Read the retrieved file
      const data = readFileSync(tempFile, 'utf8');
      return JSON.parse(data);

    } catch (error) {
      throw new Error(`Failed to retrieve blob ${blobId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Clean up temporary file
      if (existsSync(tempFile)) {
        unlinkSync(tempFile);
      }
    }
  }

  /**
   * Check if Walrus CLI is available
   */
  async isCliAvailable(): Promise<boolean> {
    try {
      await execAsync('walrus --version');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get Walrus CLI status
   */
  async getStatus(): Promise<{ available: boolean; version?: string; error?: string }> {
    try {
      const { stdout } = await execAsync('walrus --version');
      return {
        available: true,
        version: stdout.trim()
      };
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Singleton instance
export const walrusCliClient = new WalrusCliClient();