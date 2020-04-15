"use strict";

const { FileSystemWallet, Gateway } = require("fabric-network");
const fs = require("fs");
const path = require("path");

// capture network variables from config.json
const configPath = path.join(process.cwd(), "config.json");
const configJSON = fs.readFileSync(configPath, "utf8");
const config = JSON.parse(configJSON);
var connection_file = config.connection_file;
// var appAdmin = config.appAdmin;
// var orgMSPID = config.orgMSPID;
var userId = config.userName;
var gatewayDiscovery = config.gatewayDiscovery;
var channelName = config.channelName;
var contractName = config.contractName;

const ccpPath = path.join(process.cwd(), connection_file);
const ccpJSON = fs.readFileSync(ccpPath, "utf8");
const ccp = JSON.parse(ccpJSON);

exports.create_ewallet = async function(req, res, _next) {
	const walletId = req.body.wallet_id;
	const type = req.body.type;
	const remarks = req.body.remarks;

	// Create a new file system based wallet for managing identities.
	const walletPath = path.join(process.cwd(), "/wallet");
	const wallet = new FileSystemWallet(walletPath);
	console.log(`Wallet path: ${walletPath}`);

	try {
		// Create a new gateway for connecting to our peer node.
		const gateway = new Gateway();
		await gateway.connect(ccp, { wallet, identity: userId, discovery: gatewayDiscovery });

		// Get the network (channel) our contract is deployed to.
		const network = await gateway.getNetwork(channelName);

		// Get the contract from the network.
		const contract = network.getContract(contractName);

        // Submit the specified transaction.
		console.log("\nSubmit Create Wallet transaction with arguments", walletId, type, remarks);
		if (remarks != undefined) {
			await contract.submitTransaction("createWallet", walletId, type, remarks);
		} else {
			await contract.submitTransaction("createWallet", walletId, type);
		}

		// Disconnect from the gateway.
		gateway.disconnect();
		var response = { status: 1, message: "EWallet Created Successfully" };
		console.log("\nTransaction success, send response: ", response);
		res.send(response);
	} catch (err) {
		//print and return error
		console.log(err);
		var error = {};
		if (err.message) {
			error = { status: 0, message: err.message };
		}
		if (err.endorsements) {
			error = { status: 0, message: err.endorsements[0].message };
		}
		res.send(error);
	}
};

exports.recharge_ewallet = async function(req, res, _next) {
	const walletId = req.body.wallet_id;
	const amount = req.body.amount;
	const remarks = req.body.remarks;

	// Create a new file system based wallet for managing identities.
	const walletPath = path.join(process.cwd(), "/wallet");
	const wallet = new FileSystemWallet(walletPath);
	console.log(`Wallet path: ${walletPath}`);

	try {
		// Create a new gateway for connecting to our peer node.
		const gateway = new Gateway();
		await gateway.connect(ccp, { wallet, identity: userId, discovery: gatewayDiscovery });
		// Get the network (channel) our contract is deployed to.
		const network = await gateway.getNetwork(channelName);
		// Get the contract from the network.
		const contract = network.getContract(contractName);

		console.log("\n Submit recharge EWallet transaction ");
		if (remarks != undefined) {
			await contract.submitTransaction("rechargeWallet", walletId, amount, remarks);
		} else {
			await contract.submitTransaction("rechargeWallet", walletId, amount);
		}

		// Disconnect from the gateway.
		gateway.disconnect();
		var response = { status: 1, message: "EWallet Recharged Successfully" };
		console.log("\nTransaction success, send response: ", response);
		res.send(response);
	} catch (err) {
		//print and return error
		console.log(err);
		var error = {};
		if (err.message) {
			error = { status: 0, message: err.message };
		}
		if (err.endorsements) {
			error = { status: 0, message: err.endorsements[0].message };
		}
		res.send(error);
	}
};

exports.transfer_btw_ewallets = async function(req, res, _next) {
	const walletId1 = req.body.wallet_id1;
  const walletId2 = req.body.wallet_id2;
  const amount = req.body.amount;
  const remarks = req.body.remarks;
  const masterId = req.body.master_id
  const childId = req.body.child_id
  console.log(req.body)

  // Create a new file system based wallet for managing identities.
  const walletPath = path.join(process.cwd(), "/wallet");
  const wallet = new FileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);

  try {
    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: userId, discovery: gatewayDiscovery });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork(channelName);

    // Get the contract from the network.
    const contract = network.getContract(contractName);

    console.log("\nsubmit transfer between wallets transaction");
    if (remarks != undefined) {
      await contract.submitTransaction("transferBtwWallets", walletId1, walletId2, amount, masterId, childId, remarks,);
    } else {
      await contract.submitTransaction("transferBtwWallets", walletId1, walletId2, amount, masterId, childId);
    }
		// Disconnect from the gateway.
		gateway.disconnect();
		var response = { status: 1, message: "Transferred Successfully", data: { master_id: masterId, child_id: childId}};
		console.log("\nTransaction success, send response: ", response);
		res.send(response);
	} catch (err) {
		//print and return error
		console.log(err);
		var error = {};
		if (err.message) {
			error = { status: 0, message: err.message };
		}
		if (err.endorsements) {
			error = { status: 0, message: err.endorsements[0].message };
		}
		res.send(error);
	}
};

exports.disburse_ewallet = async function(req, res, _next) {
	const walletId = req.body.wallet_id;
	const amount = req.body.amount;
	const remarks = req.body.remarks;

	// Create a new file system based wallet for managing identities.
	const walletPath = path.join(process.cwd(), "/wallet");
	const wallet = new FileSystemWallet(walletPath);
	console.log(`Wallet path: ${walletPath}`);

	try {
		// Create a new gateway for connecting to our peer node.
		const gateway = new Gateway();
		await gateway.connect(ccp, { wallet, identity: userId, discovery: gatewayDiscovery });

		// Get the network (channel) our contract is deployed to.
		const network = await gateway.getNetwork(channelName);

		// Get the contract from the network.
		const contract = network.getContract(contractName);

		console.log("\nSubmit disburse wallet transaction");
		if (remarks != undefined) {
			await contract.submitTransaction("disburseWallet", walletId, amount, remarks);
		} else {
			await contract.submitTransaction("disburseWallet", walletId, amount);
		}

		// Disconnect from the gateway.
		gateway.disconnect();
		var response = { status: 1, message: "EWallet Disbursed Successfully" };
		console.log("\nTransaction success, send response: ", response);
		res.send(response);
	} catch (err) {
		//print and return error
		console.log(err);
		var error = {};
		if (err.message) {
			error = { status: 0, message: err.message };
		}
		if (err.endorsements) {
			error = { status: 0, message: err.endorsements[0].message };
		}
		res.send(error);
	}
};

exports.show_ewallet_balance = async function(req, res, _next) {
	const walletId = req.body.wallet_id;

	// Create a new file system based wallet for managing identities.
	const walletPath = path.join(process.cwd(), "/wallet");
	const wallet = new FileSystemWallet(walletPath);
	console.log(`Wallet path: ${walletPath}`);

	try {
		// Create a new gateway for connecting to our peer node.
		const gateway = new Gateway();
		await gateway.connect(ccp, { wallet, identity: userId, discovery: gatewayDiscovery });

		// Get the network (channel) our contract is deployed to.
		const network = await gateway.getNetwork(channelName);

		// Get the contract from the network.
		const contract = network.getContract(contractName);

		console.log("\nGet wallet balance transaction");
		let walletDetails = await contract.evaluateTransaction("showBalance", walletId);
		walletDetails = JSON.parse(walletDetails.toString());
		console.log(walletDetails);

		// Disconnect from the gateway.
		gateway.disconnect();
		var response = { status: 1, message: "EWallet Balance", data: walletDetails };
		console.log("\nTransaction success, send response: ", response);
		res.send(response);
	} catch (err) {
		//print and return error
		console.log(err);
		var error = {};
		if (err.message) {
			error = { status: 0, message: err.message };
		}
		if (err.endorsements) {
			error = { status: 0, message: err.endorsements[0].message };
		}
		res.send(error);
	}
};

exports.get_ewallet_statement = async function(req, res, _next) {
	const walletId = req.body.wallet_id;

	// Create a new file system based wallet for managing identities.
	const walletPath = path.join(process.cwd(), "/wallet");
	const wallet = new FileSystemWallet(walletPath);
	console.log(`Wallet path: ${walletPath}`);

	try {
		// Create a new gateway for connecting to our peer node.
		const gateway = new Gateway();
		await gateway.connect(ccp, { wallet, identity: userId, discovery: gatewayDiscovery });

		// Get the network (channel) our contract is deployed to.
		const network = await gateway.getNetwork(channelName);

		// Get the contract from the network.
		const contract = network.getContract(contractName);

		console.log("\nget wallet history transaction");
		let statement = await contract.evaluateTransaction("getHistoryForWallet", walletId);
		statement = JSON.parse(statement.toString());
		console.log(statement);

		// Disconnect from the gateway.
		gateway.disconnect();
		var response = { status: 1, message: "Ewallet Statement", data: statement };
		console.log("\nTransaction success, send response: " + response);
		res.send(response);
	} catch (err) {
		//print and return error
		console.log(err);
		var error = {};
		if (err.message) {
			error = { status: 0, message: err.message };
		}
		if (err.endorsements) {
			error = { status: 0, message: err.endorsements[0].message };
		}
		res.send(error);
	}
};

exports.get_transaction_count_of_ewallet = async function(req, res, _next) {
	const walletId = req.body.wallet_id;

	// Create a new file system based wallet for managing identities.
	const walletPath = path.join(process.cwd(), "/wallet");
	const wallet = new FileSystemWallet(walletPath);
	console.log(`Wallet path: ${walletPath}`);

	try {
		// Create a new gateway for connecting to our peer node.
		const gateway = new Gateway();
		await gateway.connect(ccp, { wallet, identity: userId, discovery: gatewayDiscovery });

		// Get the network (channel) our contract is deployed to.
		const network = await gateway.getNetwork(channelName);

		// Get the contract from the network.
		const contract = network.getContract(contractName);

		console.log("\nget Transaction Count Of Wallet " + walletId);
		let count = await contract.evaluateTransaction("getTransactionCountOfWallet", walletId);
		count = parseInt(count);
		console.log(count);

		// Disconnect from the gateway.
		gateway.disconnect();
		var response = { status: 1, message: "Transaction Count", data: count };
		console.log("\nTransaction success, send response :", response);
		res.send(response);
	} catch (err) {
		//print and return error
		console.log(err);
		var error = {};
		if (err.message) {
			error = { status: 0, message: err.message };
		}
		if (err.endorsements) {
			error = { status: 0, message: err.endorsements[0].message };
		}
		res.send(error);
	}
};

exports.get_child_ids = async function(req, res, _next) {

    const masterId = req.body.master_id;

	// Create a new file system based wallet for managing identities.
	const walletPath = path.join(process.cwd(), "/wallet");
	const wallet = new FileSystemWallet(walletPath);
	console.log(`Wallet path: ${walletPath}`);

	try {
		// Create a new gateway for connecting to our peer node.
		const gateway = new Gateway();
		await gateway.connect(ccp, { wallet, identity: userId, discovery: gatewayDiscovery });

		// Get the network (channel) our contract is deployed to.
		const network = await gateway.getNetwork(channelName);

		// Get the contract from the network.
		const contract = network.getContract(contractName);

		console.log("\nget Transaction Count Of Wallet " + masterId);
		let statement = await contract.evaluateTransaction("getChildIds", "{\"selector\":{\"tx_data\": {\"master_id\":\"" +masterId+ "\"} }}");
        var count = JSON.parse(statement.toString());
        console.log(count);
        
		// Disconnect from the gateway.
		gateway.disconnect();
		var response = { status: 1, message: "Child Id", data: count };
		console.log("\nTransaction success, send response :", response);
		res.send(response);
	} catch (err) {
		//print and return error
		console.log(err);
		var error = {};
		if (err.message) {
			error = { status: 0, message: err.message };
		}
		if (err.endorsements) {
			error = { status: 0, message: err.endorsements[0].message };
		}
		res.send(error);
	}

};
