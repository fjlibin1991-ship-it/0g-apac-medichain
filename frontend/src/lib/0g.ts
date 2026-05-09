/**
 * 0G Storage Integration — MediChain
 * Uses @0g/storage-sdk StorageClient for KV and Log operations
 * KV layer: encrypted health records (patient-held key)
 * Log layer: anonymous epidemiology statistics (TEE-verified)
 */

'use client';

import { useState, useCallback } from 'react';
import { StorageClient } from "@0g/storage-sdk";

const STORAGE_RPC = process.env.NEXT_PUBLIC_0G_STORAGE_RPC || "https://rpc-testnet.0g.ai";
const STORAGE_CONTRACT = process.env.NEXT_PUBLIC_0G_STORAGE_CONTRACT || "0x...";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HealthRecord {
  id: string;
  patientId: string;
  encryptedData: string;   // AES-256 encrypted, patient holds key
  encryptionIV: string;
  timestamp: number;
  healthWorkerId: string;
  recordType: "consultation" | "prescription" | "lab_result" | "general";
  metadata?: Record<string, string>;
}

export interface AnonymousEpidemiologyEntry {
  regionCode: number;
  symptomCodes: string[];
  ageGroup: string;
  timestamp: number;
  aggregatedCount: number;
  timeRange: "daily" | "weekly" | "monthly";
}

// ---------------------------------------------------------------------------
// KV Storage — encrypted health records
// ---------------------------------------------------------------------------

const RECORD_PREFIX = "medichain:record:";

export async function storeHealthRecord(record: HealthRecord): Promise<string> {
  const client = new StorageClient(STORAGE_RPC, STORAGE_CONTRACT);
  const key = `${RECORD_PREFIX}${record.id}`;
  await client.set({ key, value: JSON.stringify(record) });
  return key;
}

export async function getHealthRecord(recordId: string): Promise<HealthRecord | null> {
  const client = new StorageClient(STORAGE_RPC, STORAGE_CONTRACT);
  const result = await client.get(`${RECORD_PREFIX}${recordId}`);
  if (!result || !result.value) return null;
  return JSON.parse(result.value) as HealthRecord;
}

export async function listPatientRecords(patientId: string): Promise<HealthRecord[]> {
  const client = new StorageClient(STORAGE_RPC, STORAGE_CONTRACT);
  const keys = await client.keys(RECORD_PREFIX, 1000);
  const records: HealthRecord[] = [];
  for (const key of keys) {
    const result = await client.get(key);
    if (result?.value) {
      const r = JSON.parse(result.value) as HealthRecord;
      if (r.patientId === patientId) records.push(r);
    }
  }
  return records.sort((a, b) => b.timestamp - a.timestamp);
}

export async function deleteHealthRecord(recordId: string): Promise<void> {
  const client = new StorageClient(STORAGE_RPC, STORAGE_CONTRACT);
  const key = `${RECORD_PREFIX}${recordId}`;
  await client.set({ key, value: JSON.stringify({ deleted: true, at: Date.now() }) });
}

// ---------------------------------------------------------------------------
// Log Storage — anonymous epidemiology data (TEE-verified aggregates)
// ---------------------------------------------------------------------------

const EPI_LOG_KEY = "medichain:epi_log";

export async function appendEpidemiologyEntry(entry: AnonymousEpidemiologyEntry): Promise<void> {
  const client = new StorageClient(STORAGE_RPC, STORAGE_CONTRACT);
  await client.append(EPI_LOG_KEY, JSON.stringify(entry));
}

export async function queryEpidemiologyData(
  regionCode?: number,
  timeRange?: "daily" | "weekly" | "monthly",
  limit = 100
): Promise<AnonymousEpidemiologyEntry[]> {
  const client = new StorageClient(STORAGE_RPC, STORAGE_CONTRACT);
  const entries = await client.readLog(EPI_LOG_KEY, limit);
  let data = entries.map((e: string) => JSON.parse(e) as AnonymousEpidemiologyEntry);
  if (regionCode !== undefined) data = data.filter((e) => e.regionCode === regionCode);
  if (timeRange) data = data.filter((e) => e.timeRange === timeRange);
  return data.sort((a, b) => b.timestamp - a.timestamp);
}

export async function getAggregatedStats(regionCode?: number): Promise<{
  totalCases: number;
  bySymptom: Record<string, number>;
  byAgeGroup: Record<string, number>;
  lastUpdated: number;
}> {
  const entries = await queryEpidemiologyData(regionCode, undefined, 10000);
  const stats = { totalCases: 0, bySymptom: {} as Record<string, number>, byAgeGroup: {} as Record<string, number>, lastUpdated: Date.now() };
  for (const e of entries) {
    stats.totalCases += e.aggregatedCount;
    stats.byAgeGroup[e.ageGroup] = (stats.byAgeGroup[e.ageGroup] || 0) + e.aggregatedCount;
    for (const s of e.symptomCodes) {
      stats.bySymptom[s] = (stats.bySymptom[s] || 0) + e.aggregatedCount;
    }
  }
  return stats;
}

// ---------------------------------------------------------------------------
// React Hooks
// ---------------------------------------------------------------------------

/**
 * Hook for health record storage operations
 */
export function useHealthRecordStorage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listRecords = useCallback(async (patientId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      return await listPatientRecords(patientId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list records');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRecord = useCallback(async (recordId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      return await getHealthRecord(recordId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get record');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const storeRecord = useCallback(async (
    recordId: string,
    encryptedData: string,
    encryptionIV: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const record: HealthRecord = {
        id: recordId,
        patientId: '',
        encryptedData,
        encryptionIV,
        timestamp: Date.now(),
        healthWorkerId: '',
        recordType: 'general',
      };
      await storeHealthRecord(record);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to store record');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { listRecords, getRecord, storeRecord, isLoading, error };
}

/**
 * Hook for epidemiology log operations
 */
export function useEpidemiologyLog() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logData = useCallback(async (entry: AnonymousEpidemiologyEntry) => {
    setIsLoading(true);
    setError(null);
    try {
      await appendEpidemiologyEntry(entry);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const queryData = useCallback(async (
    regionCode?: number,
    timeRange?: "daily" | "weekly" | "monthly",
    limit = 100
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      return await queryEpidemiologyData(regionCode, timeRange, limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to query data');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStats = useCallback(async (regionCode?: number) => {
    setIsLoading(true);
    setError(null);
    try {
      return await getAggregatedStats(regionCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get stats');
      return { totalCases: 0, bySymptom: {}, byAgeGroup: {}, lastUpdated: Date.now() };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { logData, queryData, getStats, isLoading, error };
}
