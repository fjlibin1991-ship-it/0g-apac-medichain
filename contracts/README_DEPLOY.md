# MediChain - HealthWorkerRegistry Deployment

This folder contains the Foundry deployment setup for the HealthWorkerRegistry contract.

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation.html)
- OpenZeppelin contracts (installed via `forge install`)

## Setup

1. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your values:
   - `PRIVATE_KEY`: Your deployer wallet private key
   - `OWNER_ADDRESS`: Address that will own the registry
   - `OG_RPC`: 0G network RPC URL

## Deploy

Run the deployment script:

```bash
forge script script/Deploy.s.sol --rpc-url $OG_RPC --broadcast --verify
```

For local testing:

```bash
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

## Contract Details

- **Contract**: HealthWorkerRegistry.sol
- **Purpose**: Registry for community health workers with 0G Agent ID integration
- **Constructor args**: `address initialOwner` ( Ownable constructor)

## Verification

After deployment, verify the contract:

```bash
forge verify-contract <CONTRACT_ADDRESS> --rpc-url $OG_RPC
```