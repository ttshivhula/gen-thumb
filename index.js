const { getLinkPreview } = require('link-preview-js');
const express = require('express');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;

const generatePreview = async (url) => {
const response = await getLinkPreview(url, {
    timeout: 10000,
    followRedirects: "manual",
    handleRedirects: (baseURL, forwardedURL) => {
        const base = new URL(baseURL).hostname
        const forwarded = new URL(forwardedURL).hostname
        return (forwarded === base || forwarded === "www." + base)
    },
    headers: {
        "user-agent": "Mozilla/5.0 (Linux; Android 11; vivo 1904; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/87.0.4280.141 Mobile Safari/537.36 VivoBrowser/8.7.0.1"
    }
})

	if (!response) return undefined;

	const {title, description, images } = response;

	return {
		title,
		description,
		image: images.length ? images[0] : undefined,
	};
}

const app = express();

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

app.listen(port, () => {
	console.log(`Server started on http://localhost:${port}`);
})
