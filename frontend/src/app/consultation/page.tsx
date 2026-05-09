'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useHealthAgent, type QuestionnaireStep } from '@/lib/health-agent';
import { useHealthRecordStorage, useEpidemiologyLog } from '@/lib/0g';
import { useCrypto } from '@/lib/crypto';

export default function ConsultationPage() {
  const [patientId, setPatientId] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [showAdvice, setShowAdvice] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const healthAgent = useHealthAgent();
  const { storeRecord } = useHealthRecordStorage();
  const { logData } = useEpidemiologyLog();
  const { encryptData, generatePatientId } = useCrypto();

  // Initialize patient ID on mount
  useEffect(() => {
    const stored = localStorage.getItem('medichain_patient_id');
    if (stored) {
      setPatientId(stored);
    }
  }, []);

  const handleSetupPatient = async () => {
    if (!passphrase) return;
    setIsSettingUp(true);

    try {
      // Generate new patient ID if not exists
      const newPatientId = patientId || generatePatientId();
      localStorage.setItem('medichain_patient_id', newPatientId);
      localStorage.setItem('medichain_passphrase', passphrase);
      setPatientId(newPatientId);
      healthAgent.startQuestionnaire();
    } catch (error) {
      console.error('Setup failed:', error);
      setErrorMessage('Failed to set up patient. Please try again.');
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleStepResponse = (step: QuestionnaireStep, value: string | string[]) => {
    healthAgent.submitResponse(step.id, value);
  };

  const handleAnalyze = async () => {
    setErrorMessage(null);
    const result = await healthAgent.analyzeResponses(0);
    if (result) {
      // Log anonymous epidemiology data
      const epidemiologyEntry = {
        regionCode: 0,
        symptomCodes: healthAgent.generateEpidemiologyCodes({
          symptomCodes: healthAgent.responses.symptomCodes || [],
          duration: healthAgent.responses.duration || '',
          severity: healthAgent.responses.severity || 'mild',
          additionalNotes: healthAgent.responses.additionalNotes || '',
          ageGroup: healthAgent.responses.ageGroup || '25_44',
          regionCode: 0
        }),
        ageGroup: healthAgent.responses.ageGroup || '25_44',
        timestamp: Date.now(),
        aggregatedCount: 1,
        timeRange: 'daily' as const
      };
      await logData(epidemiologyEntry);

      // Encrypt and store advice if patient ID exists
      if (patientId) {
        const encrypted = await encryptData(JSON.stringify(result), passphrase);
        if (encrypted) {
          await storeRecord(
            `advice_${result.id}`,
            encrypted.ciphertext,
            encrypted.iv
          );
        }
      }

      setShowAdvice(true);
    } else if (healthAgent.error) {
      setErrorMessage(healthAgent.error);
    }
  };

  const currentStep = healthAgent.getCurrentStep();

  // Setup view
  if (!patientId && !healthAgent.advice) {
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
          <h1 className="text-3xl font-bold mb-6 text-center">Welcome to Consultation</h1>
          <p className="text-gray-600 mb-8 text-center">
            Enter a passphrase to secure your health records. This passphrase will be used 
            to encrypt your data with AES-256-GCM.
          </p>
          
          {/* Error display */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errorMessage}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient ID (optional)
              </label>
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Leave empty to generate new ID"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Encryption Passphrase
              </label>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Enter a strong passphrase"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <Button
              onClick={handleSetupPatient}
              disabled={!passphrase || isSettingUp}
              className="w-full"
              size="lg"
            >
              {isSettingUp ? 'Setting up...' : 'Start Consultation'}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Advice result view
  if (showAdvice && healthAgent.advice) {
    const advice = healthAgent.advice;
    const urgencyClass = `urgency-${advice.urgencyLevel}`;

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
              <Link href="/health-records">
                <Button variant="outline">View Records</Button>
              </Link>
              <Button onClick={() => { healthAgent.reset(); setShowAdvice(false); }}>
                New Consultation
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <div className={`bg-white rounded-2xl p-8 shadow-sm ${urgencyClass}`}>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Health Advisory</h1>
              <span className={`
                px-4 py-1 rounded-full text-sm font-medium
                ${advice.urgencyLevel === 'low' ? 'bg-green-100 text-green-700' : ''}
                ${advice.urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' : ''}
                ${advice.urgencyLevel === 'high' ? 'bg-orange-100 text-orange-700' : ''}
                ${advice.urgencyLevel === 'critical' ? 'bg-red-100 text-red-700' : ''}
              `}>
                {advice.urgencyLevel.toUpperCase()} PRIORITY
              </span>
            </div>

            {/* Red Flags */}
            {advice.redFlags.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-700 mb-2">⚠️ Red Flags - Seek Immediate Care</h3>
                <ul className="list-disc list-inside text-red-600">
                  {advice.redFlags.map((flag, i) => (
                    <li key={i}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Recommendations</h2>
              <ul className="space-y-2">
                {advice.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggested Actions */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Suggested Actions</h2>
              <div className="flex flex-wrap gap-2">
                {advice.suggestedActions.map((action, i) => (
                  <span key={i} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    {action}
                  </span>
                ))}
              </div>
            </div>

            {/* General Guidance */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">General Guidance</h2>
              <p className="text-gray-600">{advice.generalGuidance}</p>
            </div>

            {/* Follow-up Timing */}
            <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
              <span>Follow up: {advice.followUpTiming}</span>
              <span>Advice ID: {advice.id}</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Questionnaire view
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
            <span className="text-sm text-gray-500">Patient: {patientId.slice(0, 8)}...</span>
            <Link href="/">
              <Button variant="ghost">Back to Home</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Step {healthAgent.currentStep + 1} of {healthAgent.questionnaireSteps.length}</span>
            <span>{Math.round((healthAgent.currentStep / healthAgent.questionnaireSteps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${((healthAgent.currentStep + 1) / healthAgent.questionnaireSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current question */}
        {currentStep && (
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">{currentStep.question}</h2>

            {currentStep.type === 'multiple' && currentStep.options && (
              <div className="grid gap-3">
                {currentStep.options.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition"
                  >
                    <input
                      type="checkbox"
                      name={currentStep.id}
                      value={option.value}
                      onChange={(e) => {
                        const current = healthAgent.responses[currentStep.id === 'symptoms' ? 'symptomCodes' : currentStep.id as keyof typeof healthAgent.responses] as string[] || [];
                        if (e.target.checked) {
                          handleStepResponse(currentStep, [...current, option.value]);
                        } else {
                          handleStepResponse(currentStep, current.filter(v => v !== option.value));
                        }
                      }}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="ml-3">{option.label}</span>
                  </label>
                ))}
              </div>
            )}

            {currentStep.type === 'single' && currentStep.options && (
              <div className="space-y-3">
                {currentStep.options.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition"
                  >
                    <input
                      type="radio"
                      name={currentStep.id}
                      value={option.value}
                      onChange={() => handleStepResponse(currentStep, option.value)}
                      className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-3">{option.label}</span>
                  </label>
                ))}
              </div>
            )}

            {currentStep.type === 'text' && (
              <textarea
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={4}
                placeholder="Enter any additional information..."
                onChange={(e) => handleStepResponse(currentStep, e.target.value)}
              />
            )}

            {/* Navigation buttons */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errorMessage}</p>
              </div>
            )}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={healthAgent.prevStep}
                disabled={healthAgent.currentStep === 0}
              >
                Previous
              </Button>
              
              {healthAgent.currentStep < healthAgent.questionnaireSteps.length - 1 ? (
                <Button onClick={healthAgent.nextStep}>
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleAnalyze}
                  disabled={healthAgent.isAnalyzing}
                >
                  {healthAgent.isAnalyzing ? 'Analyzing...' : 'Get Health Advice'}
                </Button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
