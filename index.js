const puppeteer = require('puppeteer');
const express = require('express');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());

const generatePreview = async (url) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

		await page.setUserAgent(
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"
		)

    await page.goto(url, { waitUntil: 'networkidle2' });

    const title = await page.title();
    const description = await page.$eval('meta[name="description"]', element => element.content);
    const images = await page.evaluate(() => Array.from(document.images, img => img.src));
    await browser.close();

    return {
        title,
        description,
        image: images.length ? images[0] : undefined
    };
};

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
});
