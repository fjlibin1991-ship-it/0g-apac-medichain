# MediChain Architecture

## Overview
MediChain is a privacy-first AI health advisory platform for underserved regions, leveraging 0G's decentralized infrastructure for storage, compute, and identity.

## System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
│  ┌───────────┐ ┌──────────────┐ ┌────────────┐ ┌─────────────┐ │
│  │ Landing   │ │ Consultation │ │ Health     │ │ Researcher  │ │
│  │ Page      │ │ Questionnaire│ │ Records    │ │ Dashboard   │ │
│  └───────────┘ └──────────────┘ └────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      0G Integration Layer                        │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐  │
│  │ 0G Storage SDK │  │ 0G Compute SDK │  │ 0G Agent ID        │  │
│  │ (KV + Log)     │  │ (AI Inference) │  │ (Credentials)      │  │
│  └────────────────┘  └────────────────┘  └────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Smart Contracts (Solidity)                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │               HealthWorkerRegistry.sol                       │ │
│  │  - Health worker registration                                │ │
│  │  - Credential verification                                   │ │
│  │  - Agent ID integration                                      │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Health Worker Registration
1. Community health worker registers via frontend
2. Agent ID is generated/verified via 0G Agent ID service
3. Worker credentials stored on-chain in HealthWorkerRegistry
4. Worker can now conduct consultations

### 2. Patient Consultation
1. Patient (or health worker on behalf of patient) accesses consultation page
2. Symptom questionnaire is presented (AI-powered)
3. Responses are processed by health-agent.ts
4. Advice generated via 0G Compute Network
5. If record creation requested, data encrypted client-side with AES-256-GCM
6. Encrypted record stored on 0G Storage (patient holds decryption key)

### 3. Health Records
1. Patient accesses their records page
2. Records retrieved from 0G Storage (encrypted)
3. Decryption happens client-side using patient's private key
4. Plaintext never leaves the client unencrypted

### 4. Anonymous Epidemiology
1. Aggregated, anonymized symptom data logged to 0G Log
2. Researchers access dashboard to view trends
3. Data is aggregated to prevent individual identification
4. No personal health information is exposed

## Security Model

### Encryption
- **Algorithm**: AES-256-GCM
- **Key Management**: Patient-held keys (never transmitted)
- **Key Derivation**: PBKDF2 from patient passphrase

### Privacy
- Zero-knowledge architecture for health records
- On-chain data is only credentials (no health data)
- All health data encrypted at rest on 0G Storage
- Epidemiology data is strictly aggregated/anonymized

## Technology Stack

### Frontend
- Next.js 14+ (App Router)
- TypeScript
- TailwindCSS
- wagmi + viem (Ethereum interaction)
- @tanstack/react-query

### Blockchain
- Solidity ^0.8.20
- OpenZeppelin Contracts
- HealthWorkerRegistry (main contract)

### 0G Services
- @0g/storage-sdk (decentralized storage)
- @0g/compute-sdk (AI inference)
- 0G Agent ID (identity/credentials)

### Backend (in-browser)
- Web Crypto API (client-side encryption)
- Health Agent (symptom analysis logic)

## File Structure

```
/Volumes/libin/apac/02-social-impact/
├── ARCHITECTURE.md
├── README.md
├── contracts/
│   └── HealthWorkerRegistry.sol
├── src/
│   └── lib/
│       ├── 0g.ts           # 0G Storage integration
│       ├── crypto.ts       # AES-256-GCM encryption
│       └── health-agent.ts # Symptom questionnaire & advice
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── tailwind.config.ts
    └── src/
        └── app/
            ├── layout.tsx
            ├── page.tsx
            ├── consultation/
            │   └── page.tsx
            ├── health-records/
            │   └── page.tsx
            └── researcher/
                └── page.tsx
```

## Network Configuration

### 0G Storage
|- KV Store: Patient health records (encrypted)
|- Log Store: Anonymous epidemiology data

### Smart Contract
- Network: 0G testnet/mainnet (configurable)
- Registry: HealthWorkerRegistry deployed address

## Privacy Guarantees

1. **Data Minimization**: Only necessary data is stored
2. **Patient Control**: Patients hold their own encryption keys
3. **Zero-Knowledge**: Blockchain only stores credentials, not health data
4. **Anonymization**: Epidemiology data is aggregated before logging
5. **Encryption at Rest**: All health data encrypted before storage
