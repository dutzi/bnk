var system = require('system');
var page = require('webpage').create();
var credentials = require('./credentials.js');

console.log('Hi', credentials.username);

var URL = 'https://www.bankhapoalim.co.il/';
var TRANSACTIONS_URL = 'https://login.bankhapoalim.co.il/ServerServices/' +
	'plastic-cards/transactions?accountId=12-170-41654&type=current';

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

console.log('got it', password);

page.open(URL, function (status) {
	//Page is loaded!
	if (status === 'success') {

		page.switchToFrame(0);
		page.evaluate(function () {
			document.querySelector('#userID').focus();
		});
		page.switchToMainFrame();

		// page.sendEvent('click', 1020, 428);
		page.sendEvent('keypress', credentials.username);
		page.sendEvent('keypress', page.event.key.Tab);
		page.sendEvent('keypress', credentials.password);
		// page.sendEvent('keypress', page.event.key.Tab);
		// page.sendEvent('keypress', page.event.key.Enter);

		page.switchToFrame(0);
		page.evaluate(function () {
			document.querySelector('#inputSend').click();
		});
		page.switchToMainFrame();

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

		function startTransactionsInterval() {
			var interval = setInterval(function () {
				var transactions = getTransactionsFromPage();
				if (transactions) {
					clearInterval(interval);
					console.log('Got the transactions, here they are:');
					console.log(JSON.stringify(transactions));
				}
			}, 1000);
		}

		page.onLoadFinished = function(status) {
			console.log('Finished loading second page (status: "' + status + '")');
			fetchTransactions();
		};
		page.onLoadStarted = function() {
			console.log('Logged in, loading second page...');
		};

		page.onResourceReceived = function(response) {
			if (response.url === TRANSACTIONS_URL) {
				console.log('Loaded transactions');
				startTransactionsInterval();
			}
		};

		// page.sendEvent('keypress', page.event.key.A, null, null, 0x04000000);

		// var title = page.evaluate(function() {
		// 	return document.querySelector('title').innerText;
		// });
		// console.log('title', title);

		// // Enter credentials
		// page.evaluate(function () {

		// });
		console.log('Waiting for first page to load...');
		setTimeout(function () {
			page.render('example.png');
			phantom.exit();
			console.log('Done!');
		}, 10000);
	} else {
		console.log('Error loading page');
	}
});