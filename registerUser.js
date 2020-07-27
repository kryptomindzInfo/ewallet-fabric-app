"use strict";

const {
	FileSystemWallet,
	Gateway,
	X509WalletMixin,
} = require("fabric-network");
const fs = require("fs");
const path = require("path");

// capture network variables from config.json
const configPath = path.join(process.cwd(), "config.json");
const configJSON = fs.readFileSync(configPath, "utf8");
const config = JSON.parse(configJSON);
var connection_file = config.connection_file;
var appAdmin = config.appAdmin;
var orgMSPID = config.orgMSPID;
var gatewayDiscovery = config.gatewayDiscovery;
var userId = config.userName;

const ccpPath = path.join(process.cwd(), connection_file);
const ccpJSON = fs.readFileSync(ccpPath, "utf8");
const ccp = JSON.parse(ccpJSON);

// var args = process.argv.slice(2);
// if(!args.length == 0) {
//     userId = args[0];
// }

async function main() {
	// Create a new file system based wallet for managing identities.
	const walletPath = config.walletPath;
	const wallet = new FileSystemWallet(walletPath);
	console.log(`Wallet path: ${walletPath}`);

	try {
		var response = {};

		// Check to see if we've already enrolled the user.
		const userExists = await wallet.exists(userId);
		if (userExists) {
			var err = `An identity for the user ${userId} already exists in the wallet`;
			console.log(err);
			response.error = err;
			return response;
		}

		// Check to see if we've already enrolled the admin user.
		const adminExists = await wallet.exists(appAdmin);
		if (!adminExists) {
			var err = `An identity for the admin user-admin does not exist in the wallet. Run the enrollAdmin.js application before retrying`;
			console.log(err);
			response.error = err;
			return response;
		}

		// Create a new gateway for connecting to our peer node.
		const gateway = new Gateway();
		await gateway.connect(ccp, {
			wallet,
			identity: appAdmin,
			discovery: gatewayDiscovery,
		});

		// Get the CA client object from the gateway for interacting with the CA.
		const ca = gateway.getClient().getCertificateAuthority();
		const adminIdentity = gateway.getCurrentIdentity();

		// Register the user, enroll the user, and import the new identity into the wallet.
		const secret = await ca.register(
			{ affiliation: "org1.department1", enrollmentID: userId, role: "client" },
			adminIdentity
		);
		const enrollment = await ca.enroll({
			enrollmentID: userId,
			enrollmentSecret: secret,
		});
		const userIdentity = X509WalletMixin.createIdentity(
			orgMSPID,
			enrollment.certificate,
			enrollment.key.toBytes()
		);
		wallet.import(userId, userIdentity);
		console.log(
			"Successfully registered and enrolled user " +
				userId +
				" and imported it into the wallet"
		);

		// Disconnect from the gateway.
		gateway.disconnect();
	} catch (err) {
		//print and return error
		console.log(err);
		var error = {};
		error.error = err.message;
		return err.message;
	}
}

main();
