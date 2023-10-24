const { getLinkPreview } = require('link-preview-js');
const express = require('express');
const bodyParser = require('body-parser');

const generatePreview = async (url) => {
	const response = await getLinkPreview(url, {
		followRedirects: 'follow',
		headers: {
			'user-agent':
				'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
		},
		timeout: 15000,
	});

	if (!response) return undefined;

	const {title, description, images } = response;

	return {
		title,
		description,
		image: images.length ? images[0] : undefined,
	};
}

const app = express();

const PORT = 3000;

app.use(bodyParser.json());

app.post('/generate-preview', async (req, res) => {
	try {
		const { url } = req.body;
		if (!url) {
			return res.status(400).json({ error: 'URL is required' });
		}

		const preview = await generatePreview(url);
		if (!preview) {
			return res.status(404).json({ error: 'Preview not found' });
		}

		res.json(preview);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

app.listen(PORT, () => {
	console.log(`Server started on http://localhost:${PORT}`);
})
