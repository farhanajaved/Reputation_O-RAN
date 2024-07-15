//for 2 users

const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require('fs');

function appendToCSV(filename, data) {
    fs.appendFileSync(filename, `${data.join(',')}\n`, 'utf8');
}

function initCSV() {
    // Update CSV headers to include User Number
    fs.writeFileSync('breachData.csv', 'Iteration,User Number,User Address,Batch Size,Breach Index,Gas Used,Time Taken\n', 'utf8');
    fs.writeFileSync('penaltyData.csv', 'Iteration,User Number,User Address,Batch Size,Gas Used,Time Taken,Stored Penalty\n', 'utf8');
}

async function deployContract() {
    try {
        const HybridModelLocal = await ethers.getContractFactory("HybridModelLocal");
        const hybridModelLocal = await HybridModelLocal.deploy();
        console.log(`HybridModelLocal deployed to: ${hybridModelLocal.address}`);
        return hybridModelLocal;
    } catch (error) {
        console.error("Failed to deploy the contract:", error);
        throw error; // Rethrow to handle it in the calling function
    }
}

async function registerBreaches(contract, user, numBreaches, iteration, batchSize, userNum) {
    const start = Date.now(); // Start timing

    for (let i = 1; i <= numBreaches; i++) {
        const tx = await contract.connect(user).registerBreach(1);
        const receipt = await tx.wait();
        const end = Date.now(); // End timing
        const latencyInSeconds = (end - start) / 1000;  // Convert ms to seconds
        console.log(`Breach ${i} registered for user: ${user.address}. Gas used for transaction: ${receipt.gasUsed.toString()}`);
        appendToCSV('breachData.csv', [iteration, userNum, user.address, batchSize, i, receipt.gasUsed.toString(), latencyInSeconds.toFixed(3)]);
    }
}

async function calculateAndCheckPenalty(contract, user, iteration, batchSize, userNum) {
    const start = Date.now(); // Start timing
    const tx = await contract.connect(user).calculatePenalty(user.address);
    const receipt = await tx.wait();
    const end = Date.now(); // End timing
    const latencyInSeconds = (end - start) / 1000;  // Convert ms to seconds
    const storedPenalty = await contract.penalties(user.address);
    console.log(`Penalty calculation for user ${user.address} used ${receipt.gasUsed.toString()} gas. Time taken: ${latencyInSeconds.toFixed(3)} seconds. Stored penalty: ${storedPenalty}`);
    appendToCSV('penaltyData.csv', [iteration, userNum, user.address, batchSize, receipt.gasUsed.toString(), latencyInSeconds.toFixed(3), storedPenalty]);
}

async function main() {
    const [deployer, user1, user2] = await ethers.getSigners();
    initCSV();  // Initialize CSV files

    const batchSize = 2; // Define the batch size

    // Loop to repeat the entire process 10 times
    for (let i = 0; i < 10; i++) {
        console.log(`Iteration ${i + 1} starting...`);

        // Deploy the contract anew at the start of each iteration
        const contract = await deployContract();

        console.log("Registering breaches...");
        await Promise.all([
            registerBreaches(contract, user1, 5, i + 1, batchSize, 1),
            registerBreaches(contract, user2, 5, i + 1, batchSize, 2)
        ]);

        console.log("Calculating penalties...");
        await Promise.all([
            calculateAndCheckPenalty(contract, user1, i + 1, batchSize, 1),
            calculateAndCheckPenalty(contract, user2, i + 1, batchSize, 2)
        ]);

        console.log(`Iteration ${i + 1} completed.`);
    }

    console.log("All iterations executed successfully");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Error running the script:", error);
    process.exit(1);
  });
