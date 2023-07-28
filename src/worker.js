import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();
app.use('/api/*', cors());

const LENGTH_SHORTEND = 6;
const MAX_RETRIES = 3;
function generate_new_shorten() {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	for (let i = 0; i < LENGTH_SHORTEND; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

export async function getHostname(request) {
	return new URL(request.url).hostname;
}

function is_valid_url(string) {
	try {
		new URL(string);
		return true;
	} catch (_) {
		return false;
	}
}

app.post('/api/new_shorten', async (c) => {
	const { url } = await c.req.json();
	if (!url) return c.text('Missing value for URL');
	if (!is_valid_url(url)) return c.text('Invalid URL');
	let retryCount = 0;
	let shorten = generate_new_shorten();
	while (retryCount < MAX_RETRIES) {
		const { success } = await c.env.DB.prepare(
			`
			SELECT * FROM short_urls WHERE short = ?`
		)
			.bind(shorten)
			.all();
		if (success) {
			break;
		}
		retryCount++;
		shorten = generate_new_shorten();
	}
	if (retryCount === MAX_RETRIES) {
		return c.text('Failed to generate shortened URL');
	}
	const { success } = await c.env.DB.prepare(
		`
	INSERT INTO short_urls (url, short) VALUES (?, ?)`
	)
		.bind(url, shorten)
		.run();
	if (!success) {
		return c.text('Failed to generate shortened URL');
	}
	const hostname = await getHostname(c.req);
	console.log(c.text("https://"+hostname + '/' + shorten));
	return c.text("https://"+hostname + '/' + shorten);
});

app.get('/:url_id', async (c) => {
	const { url_id } = c.req.param();
	const url = await c.env.DB.prepare(
		`
    SELECT url from short_urls WHERE short = ?`
	)
		.bind(url_id)
		.first('url');
	console.log(url);
	return c.redirect(url);
});

app.get("/", async(c) =>{
	return c.redirect("https://shorten.link.pinapelz.com") // TODO: Change this to your own frontend
});

export default app;
