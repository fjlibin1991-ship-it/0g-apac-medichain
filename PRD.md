# 0G APAC Hackathon — Social Impact Track

## Project Name

**MediChain** — Decentralized AI Health Advisor for Underserved Regions

## 1. Concept & Vision

MediChain is a privacy-first, offline-capable health advisory network. Community health workers in regions with limited internet access carry a lightweight AI agent that can ask symptom-based questions, give evidence-based health guidance, and store anonymized case records on 0G's decentralized storage. Records are encrypted with TEE and never expose patient identity. The system runs via 0G Compute Network for inference and stores data via 0G Storage with zero-knowledge privacy — making it compliant with international health data standards while remaining accessible.

## 2. Problem Statement

2 billion people lack access to qualified healthcare. Existing telemedicine requires reliable internet and centralized servers. Health records are siloed, often lost, and subject to breaches. There is no affordable, privacy-preserving system for community health workers to leverage AI diagnostics in off-grid areas.

## 3. Solution

- **Offline-First AI Agent**: A quantized medical LLM runs via 0G Compute Network; with local caching, it works even on intermittent connectivity.
- **Encrypted Records (0G Storage + TEE)**: Symptom logs, advice given, and outcomes stored encrypted on 0G. Only the patient holds the decryption key.
- **Anonymous Analytics**: Aggregate health trends (e.g., "fever cases up 30% in Region X this month") computed on encrypted data via TEE, published to 0G Log layer for public health researchers.
- **Agent ID for Health Workers**: Each health worker gets an Agent ID to track their certification status and service quality.

## 4. Technical Architecture

```
Community Health Worker (Mobile App)
  └─> MediChain Agent (local LLM + 0G SDK)
        ├─> 0G Compute Network — inference (symptom analysis)
        ├─> 0G Storage (KV) — encrypted health records (patient-held key)
        ├─> 0G Storage (Log) — anonymous aggregate statistics
        ├─> Privacy & Security (TEE) — verified computation on sensitive data
        └─> Agent ID — health worker credential verification
```

## 5. Tech Stack

- Mobile App: React Native + Expo
- AI Inference: 0G Compute Network (quantized medical LLM)
- Smart Contracts: Solidity (health worker credential registry)
- 0G Modules: Storage SDK, Compute Network, Privacy & Security (TEE), Agent ID
- Encryption: AES-256 + patient-held keys

## 6. 0G Components Used

- [x] Agent ID — health worker credentials and identity
- [x] 0G Storage (KV) — encrypted health records
- [x] 0G Storage (Log) — anonymous epidemiology statistics
- [x] Compute Network — offline AI inference
- [x] Privacy & Security (TEE) — data privacy for health data

## 7. Key Features

1. Symptom questionnaire agent with evidence-based advice
2. Encrypted health record storage (patient controls key)
3. Anonymous epidemic trend reporting (TEE-verified)
4. Health worker credential verification via Agent ID
5. Works offline with local LLM cache + sync when online
6. Dashboard for public health researchers (read-only aggregate stats)

## 8. Submission Requirements

- [x] Project name, description, repo link
- [x] Smart contract deployed (health worker credential registry)
- [x] 0G Storage integration proof (encrypted records on 0G)
- [x] Demo video showing symptom advisory flow
- [x] README with setup/run instructions

## 9. Team

- Builder: 小风
