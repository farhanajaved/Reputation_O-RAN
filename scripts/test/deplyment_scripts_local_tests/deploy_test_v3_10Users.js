const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require('fs');

function appendToCSV(filename, data) {
    fs.appendFileSync(filename, `${data.join(',')}\n`, 'utf8');
}

function initCSV() {
    // Initialize CSV files with headers that include Batch Size
    fs.writeFileSync('breachData.csv', 'Iteration,User Number,User Address,Batch Size,Breach Index,Gas Used,Time Taken\n', 'utf8');
    fs.writeFileSync('penaltyData.csv', 'Iteration,User Number,User Address,Batch Size,Gas Used,Time Taken,Stored Penalty\n', 'utf8');
}

async function deployContract() {
    const HybridModelLocal = await ethers.getContractFactory("HybridModelLocal");
    const hybridModelLocal = await HybridModelLocal.deploy();
    console.log(`HybridModelLocal deployed to: ${hybridModelLocal.address}`);
    return hybridModelLocal;
}

async function registerBreaches(contract, users, numBreaches, iteration, batchSize) {
    for (const [index, user] of users.entries()) {
        const start = Date.now();
        for (let i = 1; i <= numBreaches; i++) {
            const tx = await contract.connect(user).registerBreach(1);
            const receipt = await tx.wait();
            const end = Date.now();
            const latencyInSeconds = (end - start) / 1000;
            console.log(`Breach ${i} registered for user: ${user.address}. Gas used for transaction: ${receipt.gasUsed.toString()}`);
            appendToCSV('breachData.csv', [iteration, index + 1, user.address, batchSize, i, receipt.gasUsed.toString(), latencyInSeconds.toFixed(3)]);
        }
    }
}

async function calculateAndCheckPenalty(contract, users, iteration, batchSize) {
    for (const [index, user] of users.entries()) {
        const start = Date.now();
        const tx = await contract.connect(user).calculatePenalty(user.address);
        const receipt = await tx.wait();
        const end = Date.now();
        const latencyInSeconds = (end - start) / 1000;
        const storedPenalty = await contract.penalties(user.address);
        console.log(`Penalty calculation for user ${user.address} used ${receipt.gasUsed.toString()} gas. Time taken: ${latencyInSeconds.toFixed(3)} seconds. Stored penalty: ${storedPenalty}`);
        appendToCSV('penaltyData.csv', [iteration, index + 1, user.address, batchSize, receipt.gasUsed.toString(), latencyInSeconds.toFixed(3), storedPenalty]);
    }
}

async function main(batchSize) {
    const signers = await ethers.getSigners();
    const users = signers.slice(0, batchSize); // Adjust this to select more users if necessary
    initCSV();

    for (let i = 0; i < 10; i++) {
        console.log(`Iteration ${i + 1} starting...`);

        let contract = await deployContract();

        await registerBreaches(contract, users, 3, i + 1, batchSize);
        await calculateAndCheckPenalty(contract, users, i + 1, batchSize);

        console.log(`Iteration ${i + 1} completed.`);
    }

    console.log("All iterations executed successfully");
}

main(10) // You can change this number to adjust the batch size
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Error running the script:", error);
    process.exit(1);
  });
