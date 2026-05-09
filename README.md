# MediChain

**Privacy-First AI Health Advisor for Underserved Regions**

MediChain is a decentralized healthcare platform built for the 0G APAC Hackathon (Social Impact Track). It empowers community health workers in underserved regions with AI-powered symptom analysis, encrypted patient-held health records, and anonymous epidemiology tracking.

## Project Overview

### The Problem
- Limited access to healthcare professionals in underserved regions
- Privacy concerns with centralized health record systems
- Lack of aggregated public health data for epidemiology

### The Solution
MediChain provides a privacy-first, AI-powered health advisory system where:
- **Community health workers** use AI symptom agents to assess patients
- **Patients hold their own encryption keys** - their data, their control
- **Anonymous aggregated data** feeds public health insights

## Tech Stack

### Frontend
- **Next.js 14+** (App Router)
- **TypeScript**
- **TailwindCSS**
- **wagmi + viem** (Ethereum/wallet interaction)
- **@tanstack/react-query**

### Blockchain
- **Solidity ^0.8.20**
- **OpenZeppelin Contracts**
- **HealthWorkerRegistry** - Health worker credential management

### 0G Infrastructure
- **0G Storage** - Encrypted KV store for health records, Log store for epidemiology
- **0G Compute** - AI inference for symptom analysis
- **0G Agent ID** - Health worker identity and credentials

## Project Structure

```
/Volumes/libin/apac/02-social-impact/
├── ARCHITECTURE.md          # Detailed system architecture
├── README.md                 # This file
├── contracts/
│   └── HealthWorkerRegistry.sol   # Smart contract for health worker credentials
├── src/
│   └── lib/
│       ├── 0g.ts            # 0G Storage integration (KV + Log)
│       ├── crypto.ts        # AES-256-GCM encryption utilities
│       └── health-agent.ts  # Symptom questionnaire and advice generation
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── tailwind.config.ts
    └── src/
        ├── app/
        │   ├── layout.tsx         # Root layout with providers
        │   ├── page.tsx           # Landing page
        │   ├── globals.css        # Global styles
        │   ├── providers.tsx     # Wallet & query providers
        │   ├── consultation/
        │   │   └── page.tsx      # AI symptom questionnaire
        │   ├── health-records/
        │   │   └── page.tsx      # Patient health records
        │   └── researcher/
        │       └── page.tsx      # Epidemiology dashboard
        ├── components/
        │   └── ui/
        │       └── button.tsx    # Reusable button component
        └── lib/
            └── wagmi.ts          # Wallet configuration
```

## Features

### 1. AI Symptom Analysis
- Interactive questionnaire with symptom selection
- AI-powered analysis based on clinical patterns
- Urgency levels: Low, Medium, High, Critical
- Red flag detection for emergency symptoms

### 2. Encrypted Health Records
- AES-256-GCM encryption using Web Crypto API
- Patient-held keys (passphrase-derived)
- Secure storage on 0G KV Store
- No plaintext health data ever transmitted

### 3. Anonymous Epidemiology
- Aggregated symptom data logged to 0G Log Store
- Regional distribution tracking
- Age group analytics
- Top symptoms ranking
- Researcher dashboard for public health insights

### 4. Health Worker Registry
- On-chain health worker credential management
- 0G Agent ID integration
- Region-based worker tracking
- Credential verification

## Running the Project

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation

```bash
# Clone or navigate to the project
cd /Volumes/libin/apac/02-social-impact

# Install frontend dependencies
cd frontend
npm install

# (Optional) Install contract dependencies if using Hardhat
# cd contracts
# npm install
```

### Development

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
# 0G Configuration
NEXT_PUBLIC_0G_RPC_URL=https://evmrpc-testnet.0g.ai
NEXT_PUBLIC_0G_STORAGE_CONTRACT=your_storage_contract_address
NEXT_PUBLIC_0G_LOG_CONTRACT=your_log_contract_address
NEXT_PUBLIC_CHAIN_ID=16600

# WalletConnect (for wagmi)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

## Smart Contract

### HealthWorkerRegistry.sol

A Solidity smart contract for managing community health worker credentials.

**Key Functions:**
- `registerWorker()` - Register a new health worker
- `activateWorker()` - Activate a registered worker (owner only)
- `verifyWorker()` - Verify worker credentials
- `addCredential()` - Add credentials to worker profile

**Events:**
- `WorkerRegistered` - Emitted when a worker registers
- `WorkerStatusChanged` - Emitted on status changes
- `CredentialAdded` - Emitted when credentials are added

### Deployment

```bash
# Compile contracts
npx hardhat compile

# Deploy to testnet
npx hardhat deploy --network 0gTestnet
```

## Security Model

### Encryption
- **Algorithm**: AES-256-GCM
- **Key Derivation**: PBKDF2 with SHA-256 (100,000 iterations)
- **IV**: 96-bit random IV per encryption
- **Salt**: 128-bit random salt per key derivation

### Privacy Guarantees
1. Patient-held encryption keys (zero-knowledge architecture)
2. No health data stored on-chain
3. Anonymized epidemiology data
4. Client-side encryption before storage

## Privacy Model

MediChain implements a **patient-controlled encryption model** where users hold their own keys:

```
Patient Device (Client-Side)
    │
    ├── User enters passphrase
    │
    ├── Passphrase → PBKDF2 (100k iterations) → AES-256-GCM key
    │
    ├── Symptom data encrypted locally BEFORE transmission
    │
    └── Only encrypted ciphertext stored on 0G Storage

Server/Blockchain: NEVER sees plaintext health data
```

**Key Points:**
- Patient's passphrase never leaves the device
- Encryption happens in-browser using Web Crypto API
- 0G Storage stores only encrypted blobs (ciphertext + IV)
- No single point of failure - even if storage is compromised, data is unreadable

## Demo Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: Patient Opens App                                           │
│   → Landing page shows "Start Consultation" button                 │
│   → No account creation required                                   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2: Enter Passphrase                                            │
│   → Patient enters a memorable passphrase                           │
│   → Passphrase derives encryption key via PBKDF2                    │
│   → New anonymous Patient ID generated or custom ID entered       │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 3: Complete Symptom Questionnaire                              │
│   → Interactive multi-step questionnaire                           │
│   → Select symptoms from 24 options (fever, cough, etc.)           │
│   → Choose duration, severity, age group                           │
│   → Optional notes field                                           │
│   → Progress bar shows completion                                   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 4: AI Health Advice                                            │
│   → "Get Health Advice" triggers analysis                           │
│   → Pattern matching against 11 condition signatures                │
│   → Urgency level assigned (low/medium/high/critical)              │
│   → Red flags detected (chest pain, seizures, etc.)                │
│   → Recommendations and follow-up timing provided                  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 5: Encrypted Storage                                           │
│   → Advice encrypted client-side with patient's key                │
│   → Encrypted record stored on 0G KV Store                        │
│   → Only patient can decrypt with their passphrase                 │
│   → Anonymous epidemiology data logged to 0G Log Store            │
└─────────────────────────────────────────────────────────────────────┘
```

## Architecture Highlights

### Data Flow
1. **Consultation**: Symptom questionnaire → AI Analysis → Encrypted storage
2. **Records Access**: Encrypted retrieval → Client-side decryption → Display
3. **Research**: Aggregated logs → Dashboard visualization

### 0G Integration

| Component | 0G Service | Usage |
|-----------|-----------|-------|
| **Health Records** | Storage KV | Encrypted patient records (ciphertext + IV) |
| **Epidemiology** | Storage Log | Anonymous aggregated symptom data |
| **AI Analysis** | Compute | Symptom pattern matching & condition detection |
| **Health Workers** | Agent ID | Worker identity & credential verification |

**Flow:**
1. Consultation data → encrypted client-side → stored in 0G KV
2. Aggregated epidemiology → logged to 0G Log
3. AI advice generation → powered by 0G Compute

## Contributing

This is a hackathon project for the 0G APAC Hackathon. For production use, additional security audits and features would be needed.

## License

MIT License - See LICENSE file for details.

## Acknowledgments

- **0G Labs** - For providing the decentralized infrastructure
- **OpenZeppelin** - For secure smart contract libraries
- **Next.js Team** - For the React framework
