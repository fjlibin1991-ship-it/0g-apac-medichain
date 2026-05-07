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

## Architecture Highlights

### Data Flow
1. **Consultation**: Symptom questionnaire → AI Analysis → Encrypted storage
2. **Records Access**: Encrypted retrieval → Client-side decryption → Display
3. **Research**: Aggregated logs → Dashboard visualization

### 0G Integration
- **KV Store**: Patient health records (encrypted)
- **Log Store**: Anonymous epidemiology entries
- **Compute**: AI inference (symptom analysis)
- **Agent ID**: Health worker identity

## Contributing

This is a hackathon project for the 0G APAC Hackathon. For production use, additional security audits and features would be needed.

## License

MIT License - See LICENSE file for details.

## Acknowledgments

- **0G Labs** - For providing the decentralized infrastructure
- **OpenZeppelin** - For secure smart contract libraries
- **Next.js Team** - For the React framework
