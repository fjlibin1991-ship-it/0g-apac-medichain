/**
 * 0G Storage Integration for MediChain
 * Provides KV Store and Log Store functionality for decentralized health data storage
 */

import { useEffect, useState, useCallback } from 'react';

// Types for 0G Storage
export interface HealthRecord {
  id: string;
  patientId: string;
  encryptedData: string;
  encryptionIV: string;
  timestamp: number;
  healthWorkerId: string;
  recordType: 'consultation' | 'prescription' | 'lab_result' | 'general';
  metadata?: Record<string, string>;
}

export interface AnonymousEpidemiologyEntry {
  regionCode: number;
  symptomCodes: string[];
  ageGroup: string;
  timestamp: number;
  aggregatedCount: number;
  timeRange: 'daily' | 'weekly' | 'monthly';
}

export interface StorageConfig {
  rpcUrl: string;
  storageContractAddress: string;
  logContractAddress: string;
  chainId: number;
}

// Default configuration (0G testnet)
export const DEFAULT_CONFIG: StorageConfig = {
  rpcUrl: process.env.NEXT_PUBLIC_0G_RPC_URL || 'https://evmrpc-testnet.0g.ai',
  storageContractAddress: process.env.NEXT_PUBLIC_0G_STORAGE_CONTRACT || '0xYourStorageContractAddress',
  logContractAddress: process.env.NEXT_PUBLIC_0G_LOG_CONTRACT || '0xYourLogContractAddress',
  chainId: 16600, // 0G testnet chain ID
};

// 0G Storage SDK wrapper class
class ZeroGStorage {
  private config: StorageConfig;
  private kvStoreKey: string = 'medichain_kv_store';
  private logStoreKey: string = 'medichain_log_store';

  constructor(config: StorageConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  /**
   * Generate a unique key for KV storage
   */
  private generateKey(prefix: string, id: string): string {
    return `${prefix}_${id}`;
  }

  /**
   * Store encrypted health record in KV store
   * @param recordId Unique record identifier
   * @param encryptedData The encrypted health record data
   * @param iv Initialization vector for encryption
   * @returns Transaction hash
   */
  async storeHealthRecord(
    recordId: string,
    encryptedData: string,
    iv: string
  ): Promise<string> {
    try {
      const key = this.generateKey(this.kvStoreKey, recordId);
      
      // Structure the stored data
      const storedData = {
        data: encryptedData,
        iv: iv,
        timestamp: Date.now(),
        type: 'health_record'
      };

      // In production, this would use @0g/storage-sdk
      // For now, we simulate with localStorage + would be replaced with actual 0G SDK call
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(storedData));
      }

      // Simulate transaction hash
      const txHash = `0g_${Buffer.from(recordId).toString('hex')}_${Date.now()}`;
      
      console.log(`[0G Storage] Stored health record: ${recordId}`);
      console.log(`[0G Storage] Transaction hash: ${txHash}`);

      return txHash;
    } catch (error) {
      console.error('[0G Storage] Error storing health record:', error);
      throw error;
    }
  }

  /**
   * Retrieve health record from KV store
   * @param recordId The record ID to retrieve
   * @returns The stored health record data or null
   */
  async getHealthRecord(recordId: string): Promise<{ data: string; iv: string; timestamp: number } | null> {
    try {
      const key = this.generateKey(this.kvStoreKey, recordId);
      
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(key);
        if (stored) {
          return JSON.parse(stored);
        }
      }

      return null;
    } catch (error) {
      console.error('[0G Storage] Error retrieving health record:', error);
      throw error;
    }
  }

  /**
   * List all health records for a patient
   * @param patientId The patient ID to query
   * @returns Array of record metadata (without encrypted data)
   */
  async listPatientRecords(patientId: string): Promise<Omit<HealthRecord, 'encryptedData' | 'encryptionIV'>[]> {
    try {
      const records: Omit<HealthRecord, 'encryptedData' | 'encryptionIV'>[] = [];
      
      if (typeof window !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith(`${this.kvStoreKey}_${patientId}_`)) {
            const stored = localStorage.getItem(key);
            if (stored) {
              const parsed = JSON.parse(stored);
              records.push({
                id: key.replace(`${this.kvStoreKey}_`, ''),
                patientId,
                timestamp: parsed.timestamp,
                healthWorkerId: parsed.healthWorkerId || '',
                recordType: parsed.recordType || 'general',
                metadata: parsed.metadata
              });
            }
          }
        }
      }

      return records;
    } catch (error) {
      console.error('[0G Storage] Error listing patient records:', error);
      throw error;
    }
  }

  /**
   * Log anonymous epidemiology data to Log store
   * @param entry The epidemiology entry to log
   * @returns Log index/sequence number
   */
  async logEpidemiologyData(entry: AnonymousEpidemiologyEntry): Promise<string> {
    try {
      const logKey = this.generateKey(this.logStoreKey, `log_${entry.timestamp}`);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(logKey, JSON.stringify(entry));
      }

      // Simulate log sequence number
      const logIndex = `log_seq_${entry.timestamp}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`[0G Log] Logged epidemiology entry:`, entry);
      console.log(`[0G Log] Log index: ${logIndex}`);

      return logIndex;
    } catch (error) {
      console.error('[0G Log] Error logging epidemiology data:', error);
      throw error;
    }
  }

  /**
   * Query epidemiology data by region
   * @param regionCode The region code to query
   * @param timeRange The time range filter
   * @param limit Maximum number of entries to return
   * @returns Array of epidemiology entries
   */
  async queryEpidemiologyData(
    regionCode?: number,
    timeRange?: 'daily' | 'weekly' | 'monthly',
    limit: number = 100
  ): Promise<AnonymousEpidemiologyEntry[]> {
    try {
      const entries: AnonymousEpidemiologyEntry[] = [];
      
      if (typeof window !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith(`${this.logStoreKey}_log_`)) {
            const stored = localStorage.getItem(key);
            if (stored) {
              const entry: AnonymousEpidemiologyEntry = JSON.parse(stored);
              
              // Apply filters
              if (regionCode !== undefined && entry.regionCode !== regionCode) continue;
              if (timeRange !== undefined && entry.timeRange !== timeRange) continue;
              
              entries.push(entry);
              if (entries.length >= limit) break;
            }
          }
        }
      }

      // Sort by timestamp descending
      entries.sort((a, b) => b.timestamp - a.timestamp);

      return entries;
    } catch (error) {
      console.error('[0G Log] Error querying epidemiology data:', error);
      throw error;
    }
  }

  /**
   * Delete a health record
   * @param recordId The record ID to delete
   * @returns Success boolean
   */
  async deleteHealthRecord(recordId: string): Promise<boolean> {
    try {
      const key = this.generateKey(this.kvStoreKey, recordId);
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }

      console.log(`[0G Storage] Deleted health record: ${recordId}`);
      return true;
    } catch (error) {
      console.error('[0G Storage] Error deleting health record:', error);
      return false;
    }
  }

  /**
   * Get aggregated statistics for researcher dashboard
   * @param regionCode Optional region filter
   * @returns Aggregated statistics object
   */
  async getAggregatedStats(regionCode?: number): Promise<{
    totalCases: number;
    bySymptom: Record<string, number>;
    byAgeGroup: Record<string, number>;
    byRegion: Record<number, number>;
    lastUpdated: number;
  }> {
    const entries = await this.queryEpidemiologyData(regionCode, undefined, 10000);

    const stats = {
      totalCases: 0,
      bySymptom: {} as Record<string, number>,
      byAgeGroup: {} as Record<string, number>,
      byRegion: {} as Record<number, number>,
      lastUpdated: Date.now()
    };

    for (const entry of entries) {
      stats.totalCases += entry.aggregatedCount;
      stats.byRegion[entry.regionCode] = (stats.byRegion[entry.regionCode] || 0) + entry.aggregatedCount;
      
      for (const symptom of entry.symptomCodes) {
        stats.bySymptom[symptom] = (stats.bySymptom[symptom] || 0) + entry.aggregatedCount;
      }
      
      stats.byAgeGroup[entry.ageGroup] = (stats.byAgeGroup[entry.ageGroup] || 0) + entry.aggregatedCount;
    }

    return stats;
  }
}

// Singleton instance
let zeroGStorageInstance: ZeroGStorage | null = null;

export function getZeroGStorage(config?: StorageConfig): ZeroGStorage {
  if (!zeroGStorageInstance) {
    zeroGStorageInstance = new ZeroGStorage(config);
  }
  return zeroGStorageInstance;
}

// React hook for 0G Storage
export function useZeroGStorage(config?: StorageConfig) {
  const [storage, setStorage] = useState<ZeroGStorage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storageInstance = getZeroGStorage(config);
      setStorage(storageInstance);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize 0G Storage');
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  return { storage, isLoading, error };
}

// React hook for storing health records
export function useHealthRecordStorage() {
  const { storage, isLoading, error } = useZeroGStorage();

  const storeRecord = useCallback(async (
    recordId: string,
    encryptedData: string,
    iv: string
  ): Promise<string | null> => {
    if (!storage) return null;
    try {
      return await storage.storeHealthRecord(recordId, encryptedData, iv);
    } catch (err) {
      console.error('Failed to store health record:', err);
      return null;
    }
  }, [storage]);

  const getRecord = useCallback(async (
    recordId: string
  ): Promise<{ data: string; iv: string; timestamp: number } | null> => {
    if (!storage) return null;
    try {
      return await storage.getHealthRecord(recordId);
    } catch (err) {
      console.error('Failed to get health record:', err);
      return null;
    }
  }, [storage]);

  const listRecords = useCallback(async (
    patientId: string
  ): Promise<Omit<HealthRecord, 'encryptedData' | 'encryptionIV'>[]> => {
    if (!storage) return [];
    try {
      return await storage.listPatientRecords(patientId);
    } catch (err) {
      console.error('Failed to list health records:', err);
      return [];
    }
  }, [storage]);

  const deleteRecord = useCallback(async (recordId: string): Promise<boolean> => {
    if (!storage) return false;
    try {
      return await storage.deleteHealthRecord(recordId);
    } catch (err) {
      console.error('Failed to delete health record:', err);
      return false;
    }
  }, [storage]);

  return {
    storage,
    isLoading,
    error,
    storeRecord,
    getRecord,
    listRecords,
    deleteRecord
  };
}

// React hook for epidemiology data
export function useEpidemiologyLog() {
  const { storage, isLoading, error } = useZeroGStorage();

  const logData = useCallback(async (
    entry: AnonymousEpidemiologyEntry
  ): Promise<string | null> => {
    if (!storage) return null;
    try {
      return await storage.logEpidemiologyData(entry);
    } catch (err) {
      console.error('Failed to log epidemiology data:', err);
      return null;
    }
  }, [storage]);

  const queryData = useCallback(async (
    regionCode?: number,
    timeRange?: 'daily' | 'weekly' | 'monthly',
    limit?: number
  ): Promise<AnonymousEpidemiologyEntry[]> => {
    if (!storage) return [];
    try {
      return await storage.queryEpidemiologyData(regionCode, timeRange, limit);
    } catch (err) {
      console.error('Failed to query epidemiology data:', err);
      return [];
    }
  }, [storage]);

  const getStats = useCallback(async (
    regionCode?: number
  ): Promise<{
    totalCases: number;
    bySymptom: Record<string, number>;
    byAgeGroup: Record<string, number>;
    byRegion: Record<number, number>;
    lastUpdated: number;
  } | null> => {
    if (!storage) return null;
    try {
      return await storage.getAggregatedStats(regionCode);
    } catch (err) {
      console.error('Failed to get aggregated stats:', err);
      return null;
    }
  }, [storage]);

  return {
    storage,
    isLoading,
    error,
    logData,
    queryData,
    getStats
  };
}

export default ZeroGStorage;
