
# Trustworthy Reputation for Federated Learning in O-RAN Using Blockchain and Smart Contracts

## Abstract

This paper proposes a blockchain-enabled framework to enhance trust, transparency, and collaboration in Open Radio Access Network (O-RAN) infrastructures through Federated Learning (FL). Traditional O-RAN architectures and centralized machine learning approaches face challenges when integrating multi-vendor environments, primarily due to lack of trust, proprietary data concerns, and limited interoperability. Our solution transitions from implicit trust, where the reliability of contributions is assumed, to explicit trust, where reputation is verifiably established on-chain. We introduce a blockchain-based reputation mechanism that evaluates the accuracy, integrity, and quality of participants’ model updates within the FL process. Smart contracts automate critical tasks—such as participant registration, model update verification, and reputation scoring—ensuring that data inputs directly influence accountability in a tamper-proof, transparent manner.
By deploying the framework on a scalable Layer 2 blockchain (Polygon) testnet and proposing the use of a blockchain oracle within this architectural framework for secure off-chain computations, this work focuses on a conceptual architectural approach by aligning with O-RAN's architecture to propose and deploy a decentralized application (DApp) on the blockchain. The proposed framework emphasizes a conceptual design over performance optimization and is structured to naturally benefit from ongoing improvements in blockchain scalability, which may reduce latency and enhance operational efficiency over time. Smart contracts for crucial processes and reputation calculation are included within our proposed DApp. The implementation of this research is publicly accessible through this repository.

---

![Proposed Framework for Blockchain and Federated Learning in O-RAN](RAN-BC-OJCOMs-1.png)

## Overview of Smart Contracts

1. **RegistrationClient.sol** - Handles the onboarding and revalidation of Aggregated Service Providers (AGSPs) and Client Service Providers (CLSPs). It ensures that every participant in the Federated Learning (FL) process is authorized and uniquely identified by an Ethereum address. Newly registered clients trigger a `ClientRegistered` event, creating a transparent and immutable record of all participants.
2. **PerformanceSubmission.sol** - Manages the submission and storage of performance metrics (e.g., NMSE values) from CLSPs after each Federated Learning round. By securely recording these metrics on-chain, it ensures accountability and verifiability of the model performance data. The smart contract integrates with `FetchOracle.sol` to bring off-chain data on-chain via a blockchain oracle, maintaining the integrity of performance metrics submitted by CLSPs.
3. **FetchOracle.sol** - Acts as an intermediary between off-chain data sources (e.g., the Chainlink decentralized oracle network) and the on-chain environment. It retrieves performance metrics that CLSPs submit through the Chainlink Adapter and makes them accessible to the `PerformanceSubmission.sol` contract, ensuring accuracy and security in the data transmission process.
4. **ReputationCalculation.sol** - Evaluates and updates the reputation scores of CLSPs based on their submitted performance metrics. It resets scores at the start of new learning phases, recalculates reputations using the submitted NMSE values, and selects the top performers for subsequent rounds. All reputation calculations and updates are recorded on-chain, providing a transparent and tamper-proof record of each participant’s standing over time.

## Installation and Running Instructions Using Hardhat

### Prerequisites

- Node.js installed (version 14.x or later)
- A personal Ethereum wallet (e.g., MetaMask)

### Setup

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Create a `.env` file:**
   Add your Ethereum wallet private key and Alchemy/Polygon node URL:
   ```
   PRIVATE_KEY="your-wallet-private-key"
   POLYGON_URL="https://polygon-mumbai.g.alchemy.com/v2/your-api-key"
   ```

### Common Hardhat Commands

- **Compile contracts:**
  ```
  npx hardhat compile
  ```
  This compiles the smart contracts and checks for any syntax errors.

- **Run tests:**
  ```
  npx hardhat test
  ```
  Execute unit tests for the contracts to ensure correct behavior.

- **Deploy contracts:**
  ```
  npx hardhat run scripts/deploy.js --network polygon_mumbai
  ```
  Deploys the smart contracts to the Polygon Mumbai testnet.

- **Interact with deployed contracts:**
  ```
  npx hardhat console --network polygon_mumbai
  ```
  Provides an interactive console to interact with deployed contracts.

- **Verify contract on Etherscan:**
  ```
  npx hardhat verify --network polygon_mumbai DEPLOYED_CONTRACT_ADDRESS
  ```
  Verifies the source code of your deployed contract on the Polygon Etherscan, which is useful for transparency and trust.

### Deployment via Hardhat Ignition

If you want to use Hardhat Ignition for deployment:
```
npx hardhat ignition deploy ./ignition/modules/Lock.js
```
This command deploys modules using Hardhat Ignition, a plugin for advanced deployment scripts.

## Conclusion

This setup not only improves the robustness and efficiency of the O-RAN ecosystem but also enhances data security and user privacy through decentralized technologies. The integration of blockchain allows for a tamper-proof, transparent record-keeping system that significantly boosts the trustworthiness of the federated learning process within telecom networks.
