# Cloudflare D1 URL Shortener
A URL Shortener made using Cloudflare Worker's and the new D1 Serverless SQL Database.

## Deploy
Edit `wrangler.toml` to match your D1 Database and Cloudflare Worker name (change all fields below)
```ini
name = "name-of-your-worker"

[[d1_databases]]
database_name = ""
database_id = ""
```

Then create a table to hold your shortened URL data based on `schema.sql`
```bash
wrangler d1 execute DATABASE_NAME --file=./schema.sql
```

Deploy your Worker
```bash
npm run deploy
```

## Usage
Send a POST request to your Worker with the following JSON body to shorten a new URL
```json
{
    "url": "https://url-to-be-shortened.com"
}
```
Response (text):
```
https://your-domain/url-id
```

You can deploy this with a simple front-end such as the one [here](https://git.pinapelz.moe/pinapelz/link-shortener-static-template):