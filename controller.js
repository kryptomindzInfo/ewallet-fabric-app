"use strict";

const { json } = require("body-parser");
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

const WALLET_PATH = config.walletPath;

exports.create_ewallet = async function (req, res, _next) {
	const walletId = req.body.wallet_id;
	const type = req.body.type;
	const remarks = req.body.remarks;

	// Create a new file system based wallet for managing identities.
	const walletPath = WALLET_PATH;
	const wallet = new FileSystemWallet(walletPath);
	console.log(`Wallet path: ${walletPath}`);

	try {
		// Create a new gateway for connecting to our peer node.
		const gateway = new Gateway();
		await gateway.connect(ccp, {
			wallet,
			identity: userId,
			discovery: gatewayDiscovery,
		});

		// Get the network (channel) our contract is deployed to.
		const network = await gateway.getNetwork(channelName);

		// Get the contract from the network.
		const contract = network.getContract(contractName);

		// Submit the specified transaction.
		console.log(
			"\nSubmit Create Wallet transaction with arguments",
			walletId,
			type,
			remarks
		);
		await contract.submitTransaction("createWallet", walletId, type, remarks);
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

exports.recharge_ewallet = async function (req, res, _next) {
	const walletId = req.body.wallet_id;
	const amount = req.body.amount;
	const remarks = req.body.remarks;

	// Create a new file system based wallet for managing identities.
	const walletPath = WALLET_PATH;
	const wallet = new FileSystemWallet(walletPath);
	console.log(`Wallet path: ${walletPath}`);

	try {
		// Create a new gateway for connecting to our peer node.
		const gateway = new Gateway();
		await gateway.connect(ccp, {
			wallet,
			identity: userId,
			discovery: gatewayDiscovery,
		});
		// Get the network (channel) our contract is deployed to.
		const network = await gateway.getNetwork(channelName);
		// Get the contract from the network.
		const contract = network.getContract(contractName);

		console.log("\n Submit recharge EWallet transaction ");
		await contract.submitTransaction(
			"rechargeWallet",
			walletId,
			amount,
			remarks
		);

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

exports.transfer_btw_ewallets = async function (req, res, _next) {
	const walletId1 = req.body.wallet_from;
	const walletId2 = req.body.wallet_to;
	const fromName = req.body.from_name;
	const toName = req.body.to_name;
	const senderId = req.body.sender_id;
	const receiverId = req.body.receiver_id;
	const amount = req.body.amount;
	var remarks = req.body.remarks;
	const masterId = req.body.master_id;
	const childId = req.body.child_id;
	const txName = req.body.tx_name;
	console.log(req.body);

	if (!remarks) [(remarks = "")];

	// Create a new file system based wallet for managing identities.
	const walletPath = WALLET_PATH;
	const wallet = new FileSystemWallet(walletPath);
	console.log(`Wallet path: ${walletPath}`);

	try {
		// Create a new gateway for connecting to our peer node.
		const gateway = new Gateway();
		await gateway.connect(ccp, {
			wallet,
			identity: userId,
			discovery: gatewayDiscovery,
		});

		// Get the network (channel) our contract is deployed to.
		const network = await gateway.getNetwork(channelName);

		// Get the contract from the network.
		const contract = network.getContract(contractName);

		console.log("\nsubmit transfer between wallets transaction");
		await contract.submitTransaction(
			"transferBtwWallets",
			walletId1,
			walletId2,
			amount,
			masterId,
			childId,
			senderId,
			receiverId,
			fromName,
			toName,
			remarks,
			txName
		);
		// Disconnect from the gateway.
		gateway.disconnect();
		var response = {
			status: 1,
			message: "Transferred Successfully",
			data: { master_id: masterId, child_id: childId },
		};
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

exports.multiple_transfers = async function (req, res, _next) {
	const transfers = req.body.transfers;
	let remarks = "";
	let transferArray = transfers.map((elem) => {
		if (elem.remarks) [(remarks = elem.remarks)];
		let trans = [
			elem.from_wallet,
			elem.to_wallet,
			elem.amount,
			elem.master_id,
			elem.child_id,
			elem.sender_id,
			elem.receiver_id,
			elem.from_name,
			elem.to_name,
			remarks,
			elem.tx_name,
		];
		return JSON.stringify(trans);
	});

	// let transferArr = transferArray.map((element) => {
	// 	return JSON.stringify(element);
	// });

	console.log(transferArray);

	// Create a new file system based wallet for managing identities.
	const walletPath = WALLET_PATH;
	const wallet = new FileSystemWallet(walletPath);
	console.log(`Wallet path: ${walletPath}`);

	try {
		// Create a new gateway for connecting to our peer node.
		const gateway = new Gateway();
		await gateway.connect(ccp, {
			wallet,
			identity: userId,
			discovery: gatewayDiscovery,
		});

		// Get the network (channel) our contract is deployed to.
		const network = await gateway.getNetwork(channelName);

		// Get the contract from the network.
		const contract = network.getContract(contractName);

		console.log("\nsubmit transfer between wallets transaction");
		await contract.submitTransaction("multipleTransfers", ...transferArray);
		// Disconnect from the gateway.
		gateway.disconnect();
		var response = {
			status: 1,
			message: "Transferred Successfully",
		};
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

exports.disburse_ewallet = async function (req, res, _next) {
	const walletId = req.body.wallet_id;
	const amount = req.body.amount;
	const remarks = req.body.remarks;

	// Create a new file system based wallet for managing identities.
	const walletPath = WALLET_PATH;
	const wallet = new FileSystemWallet(walletPath);
	console.log(`Wallet path: ${walletPath}`);

	try {
		// Create a new gateway for connecting to our peer node.
		const gateway = new Gateway();
		await gateway.connect(ccp, {
			wallet,
			identity: userId,
			discovery: gatewayDiscovery,
		});

		// Get the network (channel) our contract is deployed to.
		const network = await gateway.getNetwork(channelName);

		// Get the contract from the network.
		const contract = network.getContract(contractName);

		console.log("\nSubmit disburse wallet transaction");
		await contract.submitTransaction(
			"disburseWallet",
			walletId,
			amount,
			remarks
		);

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

exports.show_ewallet_balance = async function (req, res, _next) {
	const walletId = req.body.wallet_id;

	// Create a new file system based wallet for managing identities.
	const walletPath = WALLET_PATH;
	const wallet = new FileSystemWallet(walletPath);
	console.log(`Wallet path: ${walletPath}`);

	try {
		// Create a new gateway for connecting to our peer node.
		const gateway = new Gateway();
		await gateway.connect(ccp, {
			wallet,
			identity: userId,
			discovery: gatewayDiscovery,
		});

		// Get the network (channel) our contract is deployed to.
		const network = await gateway.getNetwork(channelName);

		// Get the contract from the network.
		const contract = network.getContract(contractName);

		console.log("\nGet wallet balance transaction");
		let walletDetails = await contract.evaluateTransaction(
			"showBalance",
			walletId
		);
		walletDetails = JSON.parse(walletDetails.toString());
		console.log(walletDetails);

		// Disconnect from the gateway.
		gateway.disconnect();
		var response = {
			status: 1,
			message: "EWallet Balance",
			data: walletDetails,
		};
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

exports.get_ewallet_statement = async function (req, res, _next) {
	const walletId = req.body.wallet_id;
	const txUserId = req.body.user_id;

	// Create a new file system based wallet for managing identities.
	const walletPath = WALLET_PATH;
	const wallet = new FileSystemWallet(walletPath);
	console.log(`Wallet path: ${walletPath}`);

	try {
		// Create a new gateway for connecting to our peer node.
		const gateway = new Gateway();
		await gateway.connect(ccp, {
			wallet,
			identity: userId,
			discovery: gatewayDiscovery,
		});

		// Get the network (channel) our contract is deployed to.
		const network = await gateway.getNetwork(channelName);

		// Get the contract from the network.
		const contract = network.getContract(contractName);

		console.log("\nget wallet history transaction");
		let statement = await contract.evaluateTransaction(
			"getHistoryForWallet",
			walletId,
			txUserId
		);
		console.log(statement.toString());
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

exports.get_transaction_count_of_ewallet = async function (req, res, _next) {
	const walletId = req.body.wallet_id;

	// Create a new file system based wallet for managing identities.
	const walletPath = WALLET_PATH;
	const wallet = new FileSystemWallet(walletPath);
	console.log(`Wallet path: ${walletPath}`);

	try {
		// Create a new gateway for connecting to our peer node.
		const gateway = new Gateway();
		await gateway.connect(ccp, {
			wallet,
			identity: userId,
			discovery: gatewayDiscovery,
		});

		// Get the network (channel) our contract is deployed to.
		const network = await gateway.getNetwork(channelName);

		// Get the contract from the network.
		const contract = network.getContract(contractName);

		console.log("\nget Transaction Count Of Wallet " + walletId);
		let count = await contract.evaluateTransaction(
			"getTransactionCountOfWallet",
			walletId
		);
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

exports.get_child_ids = async function (req, res, _next) {
	const masterId = req.body.master_id;

	// Create a new file system based wallet for managing identities.
	const walletPath = WALLET_PATH;
	const wallet = new FileSystemWallet(walletPath);
	console.log(`Wallet path: ${walletPath}`);

	try {
		// Create a new gateway for connecting to our peer node.
		const gateway = new Gateway();
		await gateway.connect(ccp, {
			wallet,
			identity: userId,
			discovery: gatewayDiscovery,
		});

		// Get the network (channel) our contract is deployed to.
		const network = await gateway.getNetwork(channelName);

		// Get the contract from the network.
		const contract = network.getContract(contractName);

		console.log("\nget Transaction Count Of Wallet " + masterId);
		let statement = await contract.evaluateTransaction(
			"getChildIds",
			'{"selector":{"tx_data": {"master_id":"' + masterId + '"} }}'
		);
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
