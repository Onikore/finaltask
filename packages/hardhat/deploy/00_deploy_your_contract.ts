const { deployments, getNamedAccounts } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    console.log("Deploying BillPayment contract...");

    const contract = await deploy("BillPayment", {
        from: deployer,
        log: true, // Логи процесса деплоя
    });

    console.log(`BillPayment deployed at address: ${contract.address}`);
};

module.exports.tags = ["BillPayment"];
