# Weather & Location (Server-Side APIs)

This project is a small backend-focused web app that fetches third-party data **only on the server**, then serves a clean UI that displays the processed results.

## Features

- **Weather (OpenWeather API)** fetched server-side and returned as a normalized JSON object containing:
  - temperature
  - description
  - coordinates
  - feels-like temperature
  - wind speed
  - country code
  - rain volume for the last 3 hours
- **Additional server-side APIs (2)**
  - **REST Countries** (no API key): country details for the returned `country_code`
  - **Wikipedia REST Summary** (no API key): a short city fact/summary for the selected city
- **Simple responsive UI** served from the backend (`/public`)

## Tech Stack / Design Decisions

- **Express**: lightweight HTTP server with clear route handling.
- **dotenv**: keeps secrets like `OPENWEATHER_API_KEY` out of source code.
- **node-fetch**: server-side HTTP requests.
- **Server-side API boundary**: the browser calls only this server (`/api/...`). The OpenWeather API key never appears in client-side code.

## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Copy `.env.example` to `.env` and set your values:

```bash
cp .env .env
```

Then edit `.env` in the project root:

```bash
OPENWEATHER_API_KEY
PORT=3000
```

Note:

- `.env` is gitignored so your API key stays private.

- You can get an OpenWeather key from: https://openweathermap.org/api

### 3) Run the app

```bash
npm run dev
```

Then open:

- `http://localhost:3000`

## API Usage

### Health check

`GET /api/health`

Returns:

```json
{ "ok": true }
```

### Weather

`GET /api/weather?city=Karachi`

Returns (example shape):

```json
{
  "temperature": 28.4,
  "description": "clear sky",
  "coordinates": { "lat": 24.86, "lon": 67.01 },
  "feels_like": 31.2,
  "wind_speed": 3.1,
  "country_code": "PK",
  "rain_3h": 0,
  "city": "Karachi"
}
```

### Country details (Extra API)

`GET /api/country?code=PK`

Returns (example shape):

```json
{
  "country_name": "Pakistan",
  "region": "Asia",
  "subregion": "Southern Asia",
  "capital": "Islamabad",
  "population": 220892331,
  "languages": ["Urdu", "English"],
  "currencies": [{ "code": "PKR", "name": "Pakistani rupee", "symbol": "₨" }],
  "flag_png": "https://flagcdn.com/w320/pk.png"
}
```

### City fact (Extra API)

`GET /api/city-fact?city=Karachi`

Returns (example shape):

```json
{
  "title": "Karachi",
  "description": "Metropolis in Sindh, Pakistan",
  "extract": "Karachi is the capital of the Pakistani province of Sindh...",
  "wikipedia_url": "https://en.wikipedia.org/wiki/Karachi",
  "thumbnail": "https://upload.wikimedia.org/..."
}
```

## UI

- The UI is served at `/` and calls:
  - `/api/weather?city=...`
  - `/api/country?code=...`
  - `/api/city-fact?city=...`

All third-party communication stays on the server.

## Screenshot Requirement

After running the app, take a screenshot of:

- the web page displaying results for a city, **or**
- Postman/cURL showing `/api/weather?city=...` response
