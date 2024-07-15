const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require('fs');


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

async function registerBreaches(contract, user, numBreaches) {
    const start = Date.now(); // Start timing

    for (let i = 1; i <= numBreaches; i++) {
        const tx = await contract.connect(user).registerBreach(1);
        const receipt = await tx.wait();
        console.log(`Breach ${i} registered for user: ${user.address}. Gas used for transaction: ${receipt.gasUsed.toString()}`);
    }

    const end = Date.now(); // End timing
    console.log(`Time taken to register all breaches for user: ${user.address} is ${end - start} ms.`);
}



async function calculateAndCheckPenalty(contract, user) {
    const start = Date.now(); // Start timing

    const tx = await contract.connect(user).calculatePenalty(user.address);
    const receipt = await tx.wait();

    const end = Date.now(); // End timing

    // Retrieve the stored penalty value from the contract to confirm
    const storedPenalty = await contract.penalties(user.address);

    console.log(`Penalty calculation for user ${user.address} used ${receipt.gasUsed.toString()} gas. Time taken: ${end - start} ms. Stored penalty: ${storedPenalty}`);
}


async function readBreachCount(contract, user) {
    const start = Date.now(); // Start timing
    const breachCount = await contract.breaches(user.address);
    const end = Date.now(); // End timing
    console.log(`Breach count for user ${user.address} is ${breachCount}. Time taken to read: ${end - start} ms.`);
}

async function readPenalty(contract, user) {
    const start = Date.now(); // Start timing
    const penalty = await contract.penalties(user.address);
    const end = Date.now(); // End timing
    console.log(`Penalty for user ${user.address} is ${penalty}. Time taken to read: ${end - start} ms.`);
}


async function main() {
    try {
        const [deployer, user1, user2] = await ethers.getSigners();
        const contract = await deployContract();

        // Loop to repeat the entire process 10 times
        for (let i = 0; i < 10; i++) {
            console.log(`Iteration ${i + 1} starting...`);

            console.log("Registering breaches...");
            await Promise.all([
                registerBreaches(contract, user1, 5),
                registerBreaches(contract, user2, 5)
            ]);

            console.log("Calculating penalties...");
            await Promise.all([
                calculateAndCheckPenalty(contract, user1),
                calculateAndCheckPenalty(contract, user2)
            ]);

            // Read and log breach count and penalty for both users
            console.log("Reading breach counts and penalties...");
            await Promise.all([
                readBreachCount(contract, user1),
                readPenalty(contract, user1),
                readBreachCount(contract, user2),
                readPenalty(contract, user2)
            ]);

            console.log(`Iteration ${i + 1} completed.`);
        }

        console.log("All iterations executed successfully");
    } catch (error) {
        console.error("Error running the script:", error);
        process.exit(1);
    }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Error running the script:", error);
    process.exit(1);
  });
