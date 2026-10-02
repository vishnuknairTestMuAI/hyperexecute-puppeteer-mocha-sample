const puppeteer = require('puppeteer');
const expect = require('chai').expect;
const caps = {
	browserName    : 'Chrome',
	// Chrome 136+ ignores --remote-debugging-port on the default profile, which the
	// HyperExecute VM relies on, so the CDP connection never opens with 'latest'
	browserVersion : '135',
	'LT:Options'   : {
		platform   : process.env.HYPEREXECUTE_PLATFORM,
		build      : 'Sample Puppeteer-Mocha',
		name       : 'Puppeteer-mocha test on Edge',
		user       : process.env.LT_USERNAME,
		accessKey  : process.env.LT_ACCESS_KEY,
		network    : true,
		visual     : true,
		console    : true
	}
};

let browser = null;
let page = null;
describe('Search Text', () => {
	beforeEach(async () => {
		browser = await puppeteer.connect({
			browserWSEndpoint : `wss://cdp.lambdatest.com/puppeteer?capabilities=${encodeURIComponent(
				JSON.stringify(caps)
			)}`,
			ignoreHTTPSErrors: true,
			// Chrome's privacy sandbox dialog shows up as a page that never attaches
			targetFilter: (target) => !String(typeof target.url === 'function' ? target.url() : target.url).startsWith('chrome://privacy-sandbox-dialog')
		});
		page = await browser.newPage();
		// on the Windows VM the tab opens in the background and typed text is dropped
		await page.bringToFront();
	});

	it('should be titled "Google"', async () => {
		let text = 'Google';
		await page.goto('https://www.duckduckgo.com', { waitUntil: 'networkidle2' });
		var element = await page.$('[name="q"]');
		await element.click();
		await element.type(text);
		await Promise.all([
			page.keyboard.press('Enter'),
			page.waitForNavigation()
		]);
		var title = await page.title();
		expect(title).equal(text + ' at DuckDuckGo', 'Expected page title is incorrect!');
		await page.waitForSelector('#r1-0 h2');
		const firstResult = await page.$('#r1-0 h2')
		await firstResult.click();
		await page.waitForFunction(() => document.title === 'Google');
		var googleTitle = await page.title();
		expect(googleTitle).equal('Google', 'Google -Expected page title is incorrect!');
		//TodoMVC sample app test (old sample-todo-app URL is 404)
		await page.goto('https://todomvc.com/examples/react/dist/');
		await page.waitForSelector('.new-todo');
		//adding 5 custom elements
		for (let i = 1; i <= 5; i++) {
			await page.type('.new-todo', 'Hypertest LambdaTest');
			await page.keyboard.press('Enter');
			await page.waitForSelector('.todo-list li:nth-child(' + i + ')');
			await page.click('.todo-list li:nth-child(' + i + ') input.toggle');
		}
		var todoText = await page.$eval('.todo-list li', (el) => el.textContent);
		expect(todoText).contain('Hypertest LambdaTest');
	});

	afterEach(async () => {
		if (page) await page.close();
		if (browser) await browser.close();
		page = null;
		browser = null;
	});
});
