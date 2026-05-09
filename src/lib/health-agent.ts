/**
 * Health Agent for MediChain
 * Provides symptom questionnaire, advice generation, and health guidance
 */

// Symptom categories and their associated conditions
export interface Symptom {
  code: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  category: string;
}

export interface QuestionnaireResponse {
  symptomCodes: string[];
  duration: string;
  severity: 'mild' | 'moderate' | 'severe';
  additionalNotes: string;
  ageGroup: string;
  regionCode: number;
}

export interface HealthAdvice {
  id: string;
  timestamp: number;
  recommendations: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  suggestedActions: string[];
  redFlags: string[];
  followUpTiming: string;
  generalGuidance: string;
}

// Symptom definitions
export const SYMPTOMS: Record<string, Symptom> = {
  fever: { code: 'S001', name: 'Fever', severity: 'moderate', category: 'general' },
  cough: { code: 'S002', name: 'Cough', severity: 'mild', category: 'respiratory' },
  headache: { code: 'S003', name: 'Headache', severity: 'mild', category: 'neurological' },
  fatigue: { code: 'S004', name: 'Fatigue', severity: 'mild', category: 'general' },
  body_ache: { code: 'S005', name: 'Body Aches', severity: 'mild', category: 'musculoskeletal' },
  sore_throat: { code: 'S006', name: 'Sore Throat', severity: 'mild', category: 'respiratory' },
  congestion: { code: 'S007', name: 'Nasal Congestion', severity: 'mild', category: 'respiratory' },
  nausea: { code: 'S008', name: 'Nausea', severity: 'moderate', category: 'gastrointestinal' },
  vomiting: { code: 'S009', name: 'Vomiting', severity: 'moderate', category: 'gastrointestinal' },
  diarrhea: { code: 'S010', name: 'Diarrhea', severity: 'moderate', category: 'gastrointestinal' },
  abdominal_pain: { code: 'S011', name: 'Abdominal Pain', severity: 'moderate', category: 'gastrointestinal' },
  chest_pain: { code: 'S012', name: 'Chest Pain', severity: 'severe', category: 'cardiovascular' },
  shortness_breath: { code: 'S013', name: 'Shortness of Breath', severity: 'severe', category: 'respiratory' },
  rash: { code: 'S014', name: 'Skin Rash', severity: 'mild', category: 'dermatological' },
  joint_pain: { code: 'S015', name: 'Joint Pain', severity: 'mild', category: 'musculoskeletal' },
  dizziness: { code: 'S016', name: 'Dizziness', severity: 'moderate', category: 'neurological' },
  chills: { code: 'S017', name: 'Chills', severity: 'mild', category: 'general' },
  loss_taste: { code: 'S018', name: 'Loss of Taste', severity: 'mild', category: 'neurological' },
  loss_smell: { code: 'S019', name: 'Loss of Smell', severity: 'mild', category: 'neurological' },
  eye_redness: { code: 'S020', name: 'Eye Redness', severity: 'mild', category: 'ophthalmological' },
  swelling: { code: 'S021', name: 'Swelling', severity: 'moderate', category: 'general' },
  bleeding: { code: 'S022', name: 'Unusual Bleeding', severity: 'severe', category: 'general' },
  confusion: { code: 'S023', name: 'Confusion', severity: 'severe', category: 'neurological' },
  seizures: { code: 'S024', name: 'Seizures', severity: 'critical', category: 'neurological' },
};

// Common condition patterns
const CONDITION_PATTERNS: Record<string, {
  symptoms: string[];
  minSymptoms: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}> = {
  common_cold: {
    symptoms: ['S002', 'S006', 'S007', 'S004', 'S001'],
    minSymptoms: 2,
    urgency: 'low',
    description: 'Common cold - a mild viral respiratory infection'
  },
  flu: {
    symptoms: ['S001', 'S002', 'S004', 'S005', 'S017'],
    minSymptoms: 3,
    urgency: 'medium',
    description: 'Influenza - a viral infection that may require medical attention'
  },
  food_poisoning: {
    symptoms: ['S008', 'S009', 'S010', 'S011'],
    minSymptoms: 2,
    urgency: 'medium',
    description: 'Food poisoning - usually resolves within a few days'
  },
  dehydration: {
    symptoms: ['S008', 'S004', 'S016', 'S001'],
    minSymptoms: 2,
    urgency: 'medium',
    description: 'Dehydration - drink plenty of fluids'
  },
  respiratory_infection: {
    symptoms: ['S002', 'S013', 'S006', 'S001', 'S007'],
    minSymptoms: 3,
    urgency: 'medium',
    description: 'Upper respiratory infection'
  },
  allergic_reaction: {
    symptoms: ['S014', 'S020', 'S021'],
    minSymptoms: 2,
    urgency: 'medium',
    description: 'Allergic reaction - monitor for worsening symptoms'
  },
  covid19_suspect: {
    symptoms: ['S001', 'S002', 'S004', 'S018', 'S019', 'S013'],
    minSymptoms: 3,
    urgency: 'high',
    description: 'Possible COVID-19 - recommend testing and isolation'
  },
  malaria_suspect: {
    symptoms: ['S001', 'S017', 'S005', 'S004', 'S016'],
    minSymptoms: 3,
    urgency: 'high',
    description: 'Possible malaria - recommend testing'
  },
  dengue_suspect: {
    symptoms: ['S001', 'S005', 'S014', 'S004', 'S009'],
    minSymptoms: 3,
    urgency: 'high',
    description: 'Possible dengue - recommend testing'
  },
  cholera_suspect: {
    symptoms: ['S010', 'S009', 'S008', 'S021'],
    minSymptoms: 3,
    urgency: 'critical',
    description: 'Possible cholera - seek immediate medical care'
  },
  meningitis_suspect: {
    symptoms: ['S003', 'S001', 'S023', 'S016', 'S004'],
    minSymptoms: 3,
    urgency: 'critical',
    description: 'Possible meningitis - seek emergency care immediately'
  },
  typhoid_suspect: {
    symptoms: ['S001', 'S004', 'S010', 'S011', 'S008'],
    minSymptoms: 3,
    urgency: 'high',
    description: 'Possible typhoid - recommend testing'
  },
};

// Red flag symptoms requiring immediate attention
const RED_FLAGS = [
  'S012', // chest_pain
  'S013', // shortness_breath
  'S022', // bleeding
  'S023', // confusion
  'S024', // seizures
];

/**
 * Get all available symptoms as an array
 */
export function getAllSymptoms(): Symptom[] {
  return Object.values(SYMPTOMS);
}

/**
 * Get symptoms by category
 */
export function getSymptomsByCategory(category: string): Symptom[] {
  return Object.values(SYMPTOMS).filter(s => s.category === category);
}

/**
 * Analyze symptoms and generate health advice
 */
export function analyzeSymptoms(response: QuestionnaireResponse): HealthAdvice {
  const matchedConditions: string[] = [];
  let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  const redFlags: string[] = [];

  // Check for red flags
  for (const symptomCode of response.symptomCodes) {
    if (RED_FLAGS.includes(symptomCode)) {
      const symptom = SYMPTOMS[symptomCode];
      redFlags.push(`${symptom?.name || symptomCode} requires immediate attention`);
      urgencyLevel = 'critical';
    }
  }

  // Match against condition patterns
  for (const [condition, pattern] of Object.entries(CONDITION_PATTERNS)) {
    const matchCount = response.symptomCodes.filter(
      code => pattern.symptoms.includes(code)
    ).length;

    if (matchCount >= pattern.minSymptoms) {
      matchedConditions.push(condition);
      if (pattern.urgency === 'critical') urgencyLevel = 'critical';
      else if (pattern.urgency === 'high' && urgencyLevel !== 'critical') urgencyLevel = 'high';
      else if (pattern.urgency === 'medium' && urgencyLevel === 'low') urgencyLevel = 'medium';
    }
  }

  // Generate recommendations
  const recommendations: string[] = [];
  const suggestedActions: string[] = [];

  if (urgencyLevel === 'critical') {
    recommendations.push('EMERGENCY: Seek immediate medical attention');
    recommendations.push('Call emergency services or go to the nearest hospital');
    suggestedActions.push('Contact emergency services immediately');
    suggestedActions.push('Do not delay treatment');
  } else if (urgencyLevel === 'high') {
    recommendations.push('Consult a healthcare provider within 24 hours');
    recommendations.push('Consider visiting a clinic or hospital for evaluation');
    suggestedActions.push('Schedule a medical appointment soon');
    suggestedActions.push('Monitor symptoms closely');
  } else {
    recommendations.push('Rest and stay hydrated');
    recommendations.push('Monitor symptoms for changes');
    suggestedActions.push('Get adequate rest');
    suggestedActions.push('Drink plenty of fluids');
  }

  // Condition-specific recommendations
  if (matchedConditions.length > 0) {
    recommendations.push(`Possible conditions identified: ${matchedConditions.join(', ')}`);
  }

  // General guidance based on symptoms
  if (response.symptomCodes.includes('S001')) { // fever
    recommendations.push('Take fever-reducing medication if appropriate');
    recommendations.push('Keep the room cool and wear light clothing');
  }

  if (response.symptomCodes.includes('S002') || response.symptomCodes.includes('S006')) {
    recommendations.push('Use saline nasal spray or gargle salt water');
  }

  if (response.symptomCodes.includes('S008') || response.symptomCodes.includes('S010')) {
    recommendations.push('Use oral rehydration solution (ORS)');
    recommendations.push('Avoid dairy and spicy foods temporarily');
  }

  // Determine follow-up timing
  let followUpTiming: string;
  switch (urgencyLevel) {
    case 'critical':
      followUpTiming = 'Immediate (call emergency services)';
      break;
    case 'high':
      followUpTiming = 'Within 24 hours';
      break;
    case 'medium':
      followUpTiming = 'Within 2-3 days if symptoms persist';
      break;
    default:
      followUpTiming = 'Within a week if symptoms persist or worsen';
  }

  // Generate unique advice ID
  const adviceId = `advice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    id: adviceId,
    timestamp: Date.now(),
    recommendations,
    urgencyLevel,
    suggestedActions,
    redFlags,
    followUpTiming,
    generalGuidance: generateGeneralGuidance(response)
  };
}

/**
 * Generate general guidance based on response
 */
function generateGeneralGuidance(response: QuestionnaireResponse): string {
  const symptomNames = response.symptomCodes
    .map(code => SYMPTOMS[code]?.name || code)
    .join(', ');

  return `You reported experiencing: ${symptomNames || 'no specific symptoms'}. ` +
    `Duration: ${response.duration || 'not specified'}. ` +
    `Overall severity: ${response.severity || 'not specified'}. ` +
    `Please follow the recommendations above and seek medical attention if symptoms worsen.`;
}

/**
 * Generate symptom codes for epidemiology logging
 */
export function generateEpidemiologyCodes(response: QuestionnaireResponse): string[] {
  return response.symptomCodes.map(code => {
    const symptom = SYMPTOMS[code];
    return symptom ? `${symptom.category}:${symptom.code}` : code;
  });
}

/**
 * Questionnaire structure for the frontend
 */
export interface QuestionnaireStep {
  id: string;
  question: string;
  type: 'multiple' | 'single' | 'text' | 'scale';
  options?: { value: string; label: string }[];
  symptomCodes?: string[];
  required: boolean;
}

export const QUESTIONNAIRE_STEPS: QuestionnaireStep[] = [
  {
    id: 'symptoms',
    question: 'What symptoms are you experiencing?',
    type: 'multiple',
    options: getAllSymptoms().map(s => ({
      value: s.code,
      label: `${s.name} (${s.severity})`
    })),
    symptomCodes: getAllSymptoms().map(s => s.code),
    required: true
  },
  {
    id: 'duration',
    question: 'How long have you had these symptoms?',
    type: 'single',
    options: [
      { value: 'less_than_24h', label: 'Less than 24 hours' },
      { value: '1_3_days', label: '1-3 days' },
      { value: '4_7_days', label: '4-7 days' },
      { value: '1_2_weeks', label: '1-2 weeks' },
      { value: 'more_than_2_weeks', label: 'More than 2 weeks' }
    ],
    required: true
  },
  {
    id: 'severity',
    question: 'How would you rate the overall severity?',
    type: 'single',
    options: [
      { value: 'mild', label: 'Mild - Can carry on daily activities' },
      { value: 'moderate', label: 'Moderate - Some difficulty with daily activities' },
      { value: 'severe', label: 'Severe - Unable to perform daily activities' }
    ],
    required: true
  },
  {
    id: 'age_group',
    question: 'What is the patient\'s age group?',
    type: 'single',
    options: [
      { value: '0_4', label: '0-4 years (Infant/Toddler)' },
      { value: '5_14', label: '5-14 years (Child)' },
      { value: '15_24', label: '15-24 years (Young Adult)' },
      { value: '25_44', label: '25-44 years (Adult)' },
      { value: '45_64', label: '45-64 years (Middle Age)' },
      { value: '65_plus', label: '65+ years (Senior)' }
    ],
    required: true
  },
  {
    id: 'notes',
    question: 'Any additional information you\'d like to share?',
    type: 'text',
    required: false
  }
];

/**
 * React hook for health agent functionality
 */
import { useState, useCallback } from 'react';

export function useHealthAgent() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Partial<QuestionnaireResponse>>({});
  const [advice, setAdvice] = useState<HealthAdvice | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startQuestionnaire = useCallback(() => {
    setCurrentStep(0);
    setResponses({});
    setAdvice(null);
    setError(null);
  }, []);

  const submitResponse = useCallback((stepId: string, value: string | string[]) => {
    setResponses(prev => {
      const updated = { ...prev };
      
      switch (stepId) {
        case 'symptoms':
          updated.symptomCodes = Array.isArray(value) ? value : [value];
          break;
        case 'duration':
          updated.duration = value as string;
          break;
        case 'severity':
          updated.severity = value as 'mild' | 'moderate' | 'severe';
          break;
        case 'age_group':
          updated.ageGroup = value as string;
          break;
        case 'notes':
          updated.additionalNotes = value as string;
          break;
      }
      
      return updated;
    });
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, QUESTIONNAIRE_STEPS.length - 1));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const analyzeResponses = useCallback(async (regionCode: number = 0) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const fullResponse: QuestionnaireResponse = {
        symptomCodes: responses.symptomCodes || [],
        duration: responses.duration || '',
        severity: responses.severity || 'mild',
        additionalNotes: responses.additionalNotes || '',
        ageGroup: responses.ageGroup || '25_44',
        regionCode
      };

      // Simulate async processing (in production, this would call 0G Compute)
      await new Promise(resolve => setTimeout(resolve, 1500));

      const result = analyzeSymptoms(fullResponse);
      setAdvice(result);
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [responses, regionCode]);

  const getCurrentStep = useCallback(() => {
    return QUESTIONNAIRE_STEPS[currentStep];
  }, [currentStep]);

  const isComplete = useCallback(() => {
    return currentStep === QUESTIONNAIRE_STEPS.length - 1 && advice !== null;
  }, [currentStep, advice]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setResponses({});
    setAdvice(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  return {
    questionnaireSteps: QUESTIONNAIRE_STEPS,
    currentStep,
    getCurrentStep,
    responses,
    advice,
    isAnalyzing,
    error,
    startQuestionnaire,
    submitResponse,
    nextStep,
    prevStep,
    analyzeResponses,
    isComplete,
    reset,
    getAllSymptoms,
    getSymptomsByCategory,
    generateEpidemiologyCodes
  };
}

export default {
  SYMPTOMS,
  getAllSymptoms,
  getSymptomsByCategory,
  analyzeSymptoms,
  generateEpidemiologyCodes,
  QUESTIONNAIRE_STEPS,
  useHealthAgent
};
