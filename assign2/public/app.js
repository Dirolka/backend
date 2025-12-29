const $ = (id) => document.getElementById(id);

const statusEl = $('status');
const form = $('searchForm');
const cityInput = $('cityInput');

const setStatus = (text, type) => {
  statusEl.textContent = text;
  statusEl.classList.toggle('error', type === 'error');
};

const setText = (id, value) => {
  const el = $(id);
  el.textContent = value == null || value === '' ? '-' : String(value);
};

const setImg = (id, src, alt) => {
  const el = $(id);
  if (!src) {
    el.removeAttribute('src');
    el.setAttribute('alt', '');
    el.style.display = 'none';
    return;
  }
  el.style.display = '';
  el.src = src;
  el.alt = alt || '';
};

const formatNumber = (n) => {
  if (n == null || Number.isNaN(Number(n))) return '-';
  return new Intl.NumberFormat(undefined).format(Number(n));
};

const fetchJson = async (url) => {
  const r = await fetch(url);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw new Error(data?.error || 'Request failed');
  }
  return data;
};

const loadAll = async (city) => {
  setStatus('Loading...', '');

  const weather = await fetchJson(`/api/weather?city=${encodeURIComponent(city)}`);

  setText('w_temp', weather.temperature != null ? `${weather.temperature} °C` : '-');
  setText('w_feels', weather.feels_like != null ? `${weather.feels_like} °C` : '-');
  setText('w_desc', weather.description);
  setText('w_wind', weather.wind_speed != null ? `${weather.wind_speed} m/s` : '-');
  setText('w_country', weather.country_code);
  setText(
    'w_coord',
    weather.coordinates?.lat != null && weather.coordinates?.lon != null
      ? `${weather.coordinates.lat}, ${weather.coordinates.lon}`
      : '-'
  );
  setText('w_rain', weather.rain_3h != null ? `${weather.rain_3h} mm` : '0 mm');

  const [country, fact] = await Promise.all([
    weather.country_code
      ? fetchJson(`/api/country?code=${encodeURIComponent(weather.country_code)}`)
      : Promise.resolve(null),
    fetchJson(`/api/city-fact?city=${encodeURIComponent(weather.city || city)}`),
  ]);

  if (country) {
    setImg('c_flag', country.flag_png, `${country.country_name || ''} flag`);
    setText('c_name', country.country_name);
    setText('c_region', [country.region, country.subregion].filter(Boolean).join(' • ') || '-');
    setText('c_capital', country.capital);
    setText('c_population', formatNumber(country.population));
    setText('c_languages', (country.languages || []).join(', ') || '-');

    const currencyText = (country.currencies || []).map((c) => {
      const parts = [c.code];
      if (c.name) parts.push(c.name);
      if (c.symbol) parts.push(`(${c.symbol})`);
      return parts.join(' ');
    }).join(', ');

    setText('c_currencies', currencyText || '-');
  } else {
    setImg('c_flag', null);
    setText('c_name', '-');
    setText('c_region', '-');
    setText('c_capital', '-');
    setText('c_population', '-');
    setText('c_languages', '-');
    setText('c_currencies', '-');
  }

  setImg('f_thumb', fact.thumbnail, fact.title);
  setText('f_title', fact.title);
  setText('f_desc', fact.description);
  setText('f_extract', fact.extract || 'No summary available.');

  const link = $('f_link');
  if (fact.wikipedia_url) {
    link.href = fact.wikipedia_url;
    link.style.pointerEvents = 'auto';
    link.style.opacity = '1';
  } else {
    link.href = '#';
    link.style.pointerEvents = 'none';
    link.style.opacity = '0.6';
  }

  setStatus('Done.', '');
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const city = String(cityInput.value || '').trim();
  if (!city) {
    setStatus('Please type a city name.', 'error');
    return;
  }

  try {
    await loadAll(city);
  } catch (err) {
    setStatus(err.message || 'Something went wrong.', 'error');
  }
});

setStatus('Enter a city and press Search.', '');
