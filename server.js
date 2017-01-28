const express = require('express');
const cheerio = require('cheerio');
const request = require('request');
const Server = require('http').Server;

const app = express();
const http_server = new Server(app);
const cache = {};

app.get('/:country', (req, res) => {
	let country = req.params.country
					.split(' ')
					.map((t) => {
						t = t[0].toUpperCase() + t.substr(1);
						return t;
					})
					.join('_');

	if (cache[country])
		return res.redirect(cache[country]);

	request({
		url: `https://commons.wikimedia.org/wiki/File:Flag_of_${country}.svg`
	}, (e,r,b) => {
		if (res.statusCode === 404 || !b || b.indexOf('No file by this name exists') !== -1)
			return res.status(404).end();

		let $ = cheerio.load(b);

		let u = $('.fullMedia > a').attr('href');
		cache[country] = u;
		res.redirect(u);
	});
});

let port = Number(process.env.PORT) || 3000;
http_server.listen(port, (err) => {
	if (err) process.exit(1);

	console.log(`Listening on ${port}`);
});