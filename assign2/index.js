const path = require('path');

const dotenv = require('dotenv');
const express = require('express');

dotenv.config();

const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const app = express();

const PORT = Number(process.env.PORT || 3000);
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/weather', async (req, res) => {
  try {
    if (!OPENWEATHER_API_KEY) {
      return res.status(500).json({ error: 'Server misconfiguration: OPENWEATHER_API_KEY is missing' });
    }

    const city = String(req.query.city || '').trim();
    const lat = req.query.lat != null ? Number(req.query.lat) : null;
    const lon = req.query.lon != null ? Number(req.query.lon) : null;

    if (!city && (lat == null || Number.isNaN(lat) || lon == null || Number.isNaN(lon))) {
      return res.status(400).json({ error: 'Provide either ?city=CityName or ?lat=..&lon=..' });
    }

    const url = new URL('https://api.openweathermap.org/data/2.5/weather');
    url.searchParams.set('appid', OPENWEATHER_API_KEY);
    url.searchParams.set('units', 'metric');

    if (city) {
      url.searchParams.set('q', city);
    } else {
      url.searchParams.set('lat', String(lat));
      url.searchParams.set('lon', String(lon));
    }

    const r = await fetch(url);
    const data = await r.json();

    if (!r.ok) {
      return res.status(r.status).json({
        error: data?.message || 'Failed to fetch weather data',
      });
    }

    return res.json({
      temperature: data?.main?.temp ?? null,
      description: data?.weather?.[0]?.description ?? null,
      coordinates: {
        lat: data?.coord?.lat ?? null,
        lon: data?.coord?.lon ?? null,
      },
      feels_like: data?.main?.feels_like ?? null,
      wind_speed: data?.wind?.speed ?? null,
      country_code: data?.sys?.country ?? null,
      rain_3h: data?.rain?.['3h'] ?? 0,
      city: data?.name ?? city,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error' });
  }
});

app.get('/api/country', async (req, res) => {
  try {
    const code = String(req.query.code || '').trim().toUpperCase();
    if (!code) {
      return res.status(400).json({ error: 'Provide ?code=COUNTRY_CODE (e.g., US, PK)' });
    }

    const url = new URL(`https://restcountries.com/v3.1/alpha/${encodeURIComponent(code)}`);
    const r = await fetch(url);
    const data = await r.json();

    if (!r.ok) {
      return res.status(r.status).json({ error: 'Failed to fetch country data' });
    }

    const c = Array.isArray(data) ? data[0] : data;
    const currencies = c?.currencies ? Object.keys(c.currencies).map((k) => ({
      code: k,
      name: c.currencies[k]?.name ?? null,
      symbol: c.currencies[k]?.symbol ?? null,
    })) : [];

    return res.json({
      country_name: c?.name?.common ?? null,
      region: c?.region ?? null,
      subregion: c?.subregion ?? null,
      capital: Array.isArray(c?.capital) ? c.capital[0] : null,
      population: c?.population ?? null,
      languages: c?.languages ? Object.values(c.languages) : [],
      currencies,
      flag_png: c?.flags?.png ?? null,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error' });
  }
});

app.get('/api/city-fact', async (req, res) => {
  try {
    const city = String(req.query.city || '').trim();
    if (!city) {
      return res.status(400).json({ error: 'Provide ?city=CityName' });
    }

    const url = new URL(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city)}`);
    const r = await fetch(url, {
      headers: {
        'accept': 'application/json',
        'user-agent': 'backend2-weather-assignment/1.0',
      },
    });

    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: 'Failed to fetch city fact' });
    }

    return res.json({
      title: data?.title ?? city,
      description: data?.description ?? null,
      extract: data?.extract ?? null,
      wikipedia_url: data?.content_urls?.desktop?.page ?? null,
      thumbnail: data?.thumbnail?.source ?? null,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error' });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
});
