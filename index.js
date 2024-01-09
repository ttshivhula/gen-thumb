const { getLinkPreview } = require('link-preview-js');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const sizeOf = require('image-size');

const getImageDimensions = async (url)  => {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);
        return sizeOf(buffer);
    } catch (error) {
        console.error(error);
        return undefined;
    }
};



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

    let dimensions = undefined;

    if (images.length) {
        const response = await getImageDimensions(images[0]);

        if (response) {
            dimensions = {
                width: response.width,
                height: response.height,
            };
        }
    }

	return {
		title,
		description,
		image: images.length ? images[0] : undefined,
        imageDimension: dimensions,
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
