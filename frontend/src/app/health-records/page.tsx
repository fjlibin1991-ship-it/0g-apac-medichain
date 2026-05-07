'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useHealthRecordStorage } from '@/lib/0g';
import { useCrypto } from '@/lib/crypto';

interface Record {
  id: string;
  type: string;
  timestamp: number;
  advice?: string;
}

export default function HealthRecordsPage() {
  const [patientId, setPatientId] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [records, setRecords] = useState<Record[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { listRecords, getRecord } = useHealthRecordStorage();
  const { decryptData } = useCrypto();

  useEffect(() => {
    const stored = localStorage.getItem('medichain_patient_id');
    if (stored) {
      setPatientId(stored);
    }
  }, []);

  const handleUnlock = async () => {
    if (!passphrase || !patientId) return;
    setIsLoading(true);

    try {
      const patientRecords = await listRecords(patientId);
      setRecords(patientRecords.map(r => ({
        id: r.id,
        type: r.recordType,
        timestamp: r.timestamp
      })));
      setIsUnlocked(true);
    } catch (error) {
      console.error('Failed to load records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRecord = async (record: Record) => {
    setSelectedRecord(record);
    setDecryptedContent(null);

    try {
      const stored = await getRecord(record.id);
      if (stored) {
        const decrypted = await decryptData(
          stored.data,
          stored.iv,
          passphrase
        );
        setDecryptedContent(decrypted);
      }
    } catch (error) {
      console.error('Failed to decrypt record:', error);
      setDecryptedContent('Failed to decrypt record. Please check your passphrase.');
    }
  };

  const handleGenerateRecoveryKit = () => {
    const recoveryData = {
      patientId,
      createdAt: new Date().toISOString(),
      instructions: 'Store this recovery kit securely. You will need your passphrase to access records.'
    };
    const blob = new Blob([JSON.stringify(recoveryData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medichain_recovery_kit_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Locked view
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">M</span>
              </div>
              <span className="text-2xl font-bold text-primary-700">MediChain</span>
            </Link>
            <Link href="/">
              <Button variant="ghost">Back to Home</Button>
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16 max-w-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Health Records</h1>
            <p className="text-gray-600">
              Enter your passphrase to decrypt and access your health records.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient ID
              </label>
              <input
                type="text"
                value={patientId}
                readOnly
                className="w-full px-4 py-3 border rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passphrase
              </label>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Enter your passphrase"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <Button
              onClick={handleUnlock}
              disabled={!passphrase || isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Decrypting...' : 'Unlock Records'}
            </Button>

            <div className="text-center">
              <button
                onClick={handleGenerateRecoveryKit}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Generate Recovery Kit
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Records list view
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">M</span>
            </div>
            <span className="text-2xl font-bold text-primary-700">MediChain</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/consultation">
              <Button>New Consultation</Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => { setIsUnlocked(false); setRecords([]); }}
            >
              Lock
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Your Health Records</h1>
          <p className="text-gray-600 mb-8">
            Patient: {patientId} | {records.length} encrypted record(s)
          </p>

          {records.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No Records Yet</h3>
              <p className="text-gray-500 mb-6">
                Your health records will appear here after consultations.
              </p>
              <Link href="/consultation">
                <Button>Start Your First Consultation</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition cursor-pointer"
                  onClick={() => handleViewRecord(record)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold capitalize">{record.type.replace('_', ' ')}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(record.timestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                        Encrypted
                      </span>
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Record detail modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold capitalize">
                {selectedRecord.type.replace('_', ' ')}
              </h2>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {decryptedContent ? (
                <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">
                  {JSON.stringify(JSON.parse(decryptedContent), null, 2)}
                </pre>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
