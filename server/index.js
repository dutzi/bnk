var system = require('system');
var page = require('webpage').create();
var fs = require('fs');

var URL = 'https://www.bankhapoalim.co.il/';
var TRANSACTIONS_URL = 'https://login.bankhapoalim.co.il/ServerServices/' +
	'plastic-cards/transactions?accountId=12-170-41654&type=current';

var _credentials;

function getUsername() {
	system.stdout.write('Please enter username:');
	var username = system.stdin.readLine();
	// system.stdout.write('\033[1APlease enter username:                      \n');
	return username;
}

function getPassword() {
	system.stdout.write('Please enter passwrod:');
	var password = system.stdin.readLine();
	// system.stdout.write('\033[1APlease enter password:                      \n');
	return password;
}

function getCredentials() {
	var credentials = require('./credentials.js');

	if (!credentials) {
		var username = getUsername();
		var password = getPassword();

		credentials = {
			username: username,
			password: password,
		};
	}

	return credentials;
}

function focusOnUserId() {
	page.switchToFrame(0);
	page.evaluate(function () {
		document.querySelector('#userID').focus();
	});
	page.switchToMainFrame();
}

function typeCredentials(credentials) {
	page.sendEvent('keypress', credentials.username);
	page.sendEvent('keypress', page.event.key.Tab);
	page.sendEvent('keypress', credentials.password);
}

function submitForm() {
	page.switchToFrame(0);
	page.evaluate(function () {
		document.querySelector('#inputSend').click();
	});
	page.switchToMainFrame();
}

function fetchTransactions() {
	console.log('Fetching transactions...');
	page.evaluate(function (url) {
		jQuery.getJSON(url, function (data) {
			window.__bnk_transactions = data;
		});
	}, TRANSACTIONS_URL);
}

function getTransactionsFromPage() {
	return page.evaluate(function () {
		return window.__bnk_transactions;
	});
}

function startTransactionsInterval(callback) {
	var interval = setInterval(function () {
		var transactions = getTransactionsFromPage();
		if (transactions) {
			clearInterval(interval);
			callback(transactions);
		}
	}, 200);
}

function onFirstPageOpened(status) {
	if (status === 'success') {

		focusOnUserId();
		typeCredentials(_credentials);
		submitForm();
	} else {
		console.log('Error loading page');
	}

}

function onGotTransactions(transactions) {
	console.log('Got the transactions, saving to `transactions.json`');
	fs.write('transactions.json', JSON.stringify(transactions, true, 4), 'w');
	phantom.exit();
}

// Entry point //

(function main() {
	_credentials = getCredentials()
	console.log('Hi', _credentials.username);
	console.log('Waiting for first page to load...');
	page.open(URL, onFirstPageOpened)
}());

page.onLoadFinished = function(status) {
	if (page.url.indexOf('https://login.bankhapoalim.co.il/') === 0) {
		console.log('Finished loading second page (status: "' + status + '")');
		fetchTransactions();
	}
};

page.onLoadStarted = function() {
	if (page.url) {
		console.log('Logged in, loading second page...');
	}
};

page.onResourceReceived = function(response) {
	if (response.url === TRANSACTIONS_URL && response.stage === 'end') {
		console.log('Loaded transactions');
		startTransactionsInterval(onGotTransactions);
	}
};
