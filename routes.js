//SPDX-License-Identifier: Apache-2.0

let express = require("express");
let router = express.Router();
let dapp = require("./controller.js");
let format = require("date-format");

module.exports = router;

router.use(function (req, res, next) {
	console.log(
		format.asString("hh:mm:ss.SSS", new Date()) +
			"::............ " +
			req.url +
			" ............."
	);
	next(); // make sure we go to the next routes and don't stop here

	function afterResponse() {
		res.removeListener("finish", afterResponse);
	}
	res.on("finish", afterResponse);
});

router.post("/createEWallet", dapp.create_ewallet);
router.post("/rechargeEWallet", dapp.recharge_ewallet);
router.post("/transferBtwEWallets", dapp.transfer_btw_ewallets);
router.post("/multipleTransfers", dapp.multiple_transfers);
router.post("/disburseEWallet", dapp.disburse_ewallet);
router.post("/showEWalletBalance", dapp.show_ewallet_balance);
router.post("/getEWalletStatement", dapp.get_ewallet_statement);
router.post(
	"/getEWalletTransactionCount",
	dapp.get_transaction_count_of_ewallet
);
router.post("/getChildIds", dapp.get_child_ids);
