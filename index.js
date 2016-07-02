// Simple Javascript example

console.log('Loading a web page');
var page = require('webpage').create();
var url = 'https://www.bankhapoalim.co.il/';
page.open(url, function (status) {
	//Page is loaded!
	if (status === "success") {

		page.sendEvent('click', 1020, 428);
		page.sendEvent('keypress', page.event.key.A);
		page.sendEvent('keypress', page.event.key.A, null, null, 0x04000000);

		var title = page.evaluate(function() {
			return document.querySelector('title').innerText;
		});
		console.log('title', title);

		// Enter credentials
		page.evaluate(function () {

		});

		page.render('example.png');
	}
	phantom.exit();
});