const { Server } = require('http');
const express = require('express');
const cheerio = require('cheerio');
const request = require('request-promise-native');

const app = express();
const http_server = new Server(app);
const cache = {};

app.get('/:country', async (req, res) => {
	const country = req.params.country
					.split(' ')
					.map((t) => {
						t = t[0].toUpperCase() + t.substr(1);
						return t;
					})
					.join('_');

	if (cache[country])
		return res.redirect(cache[country], 301);
	
	try {
		const $ = await request({
			url: `https://commons.wikimedia.org/wiki/File:Flag_of_${country}.svg`,
			transform: (body) => cheerio.load(body)
		});	

		let url = $('.fullMedia > a').attr('href');
		cache[country] = url;
		res.redirect(url, 301);
	} catch (error) {
		let status = 500;
		if (error.stack.substr(0, 16) === 'StatusCodeError:') {
			status = Number(error.stack.match(/^StatusCodeError: (\d\d\d)/)[1]);
		}
		res.status(status).end();
	}
});

const port = Number(process.env.PORT) || 3000;

http_server.listen(port, (err) => {
	if (err) {
		console.error(err.message);
		process.exit(1);
	}

	console.log(`Listening on ${port}`);
});