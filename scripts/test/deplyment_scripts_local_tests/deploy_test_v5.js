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
    fs.writeFileSync('readData.csv', 'Iteration,User Number,User Address,Data Read,Read Latency(s)\n', 'utf8'); // CSV for read operations
}


async function deployContract() {
    const HybridModelLocal = await ethers.getContractFactory("HybridModelLocal");
    const hybridModelLocal = await HybridModelLocal.deploy();
    console.log(`HybridModelLocal deployed to: ${hybridModelLocal.address}`);
    return hybridModelLocal;
}

async function registerBreaches(contract, user, numBreaches, iteration, batchSize, userNum) {
    const start = Date.now();
    const breachPromises = [];
    
    for (let i = 1; i <= numBreaches; i++) {
        breachPromises.push(
            (async () => {
                const tx = await contract.connect(user).registerBreach(1);
                const receipt = await tx.wait();
                const end = Date.now();
                const latencyInSeconds = (end - start) / 1000;
                console.log(`Breach ${i} registered for user: ${user.address}. Gas used for transaction: ${receipt.gasUsed.toString()}`);
                appendToCSV('breachData.csv', [iteration, userNum, user.address, batchSize, i, receipt.gasUsed.toString(), latencyInSeconds.toFixed(3)]);
            })()
        );
    }
    
    await Promise.all(breachPromises); // Wait for all breaches to be confirmed
}

async function calculateAndCheckPenalty(contract, user, iteration, batchSize, userNum) {
    const start = Date.now();
    const tx = await contract.connect(user).calculatePenalty(user.address);
    const receipt = await tx.wait();
    const end = Date.now();
    const latencyInSeconds = (end - start) / 1000;
    const storedPenalty = await contract.penalties(user.address);
    console.log(`Penalty calculation for user ${user.address} used ${receipt.gasUsed.toString()} gas. Time taken: ${latencyInSeconds.toFixed(3)} seconds. Stored penalty: ${storedPenalty}`);
    appendToCSV('penaltyData.csv', [iteration, userNum, user.address, batchSize, receipt.gasUsed.toString(), latencyInSeconds.toFixed(3), storedPenalty]);
}

async function readAndLogData(contract, users, iteration, readBatchSize) {
    const selectedUsers = users.slice(0, readBatchSize); // Select only the desired number of users for reading
    const readPromises = selectedUsers.map(async (user, index) => {
        const userNum = index + 1;
        const start = Date.now();
        const breaches = await contract.breaches(user.address);
        const penalties = await contract.penalties(user.address);
        const end = Date.now();
        const latencyInSeconds = (end - start) / 1000;
        console.log(`Data read for user ${user.address}: Breaches = ${breaches}, Penalties = ${penalties}. Read Latency: ${latencyInSeconds} seconds`);
        appendToCSV('readData.csv', [iteration, userNum, user.address, `Breaches: ${breaches}, Penalties: ${penalties}`, latencyInSeconds]);
    });

    await Promise.all(readPromises);
}


async function main(batchSize, readBatchSize) {
    const signers = await ethers.getSigners();
    const users = signers.slice(0, batchSize);
    initCSV();

    let contract;
    for (let i = 0; i < 10; i++) {
        console.log(`Iteration ${i + 1} starting...`);
        contract = await deployContract();

        // Registration and penalty calculation concurrently for all users
        await Promise.all(users.map((user, index) => registerBreaches(contract, user, 3, i + 1, batchSize, index + 1)));
        await Promise.all(users.map((user, index) => calculateAndCheckPenalty(contract, user, i + 1, batchSize, index + 1)));

        console.log(`Iteration ${i + 1} completed.`);
    }

    // Reading and logging data from the last deployed contract
    console.log("Reading and logging data from the contract...");
    await readAndLogData(contract, users, 10, readBatchSize);

    console.log("All iterations executed successfully");
}

main(2, 4) // You can adjust the total batch size and read batch size
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Error running the script:", error);
    process.exit(1);
  });