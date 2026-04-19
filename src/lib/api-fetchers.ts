/**
 * Data fetchers for the Digital Nomad City Comparator.
 * Phase 3: Ultra-low latency optimization for Vercel 10s timeout.
 */

const TP_TOKEN = process.env.TRAVELPAYOUTS_TOKEN || '47f0a19d66d6c228fddcfda073131628';
const TP_MARKER = process.env.TRAVELPAYOUTS_MARKER || '520319';

// Ultra-fast timeout for Vercel (Max 2.5s per atomic fetch)
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 2500) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'NomadComparator/1.0',
        ...options.headers,
      }
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// 1. Geocoding
export async function getCoords(city: string) {
  try {
    const res = await fetchWithTimeout(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`, {}, 2000);
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.results?.[0] || { latitude: 0, longitude: 0, name: city, country: "", iata: city.toUpperCase() };
  } catch {
    return { latitude: 0, longitude: 0, name: city, country: "", iata: city.toUpperCase() };
  }
}

// 2. Weather
export async function fetchWeather(lat: number, lon: number) {
  try {
    const res = await fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`, {}, 2000);
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

// 3. Flights
export async function fetchTravelpayoutsFlights(origin: string, destination: string) {
  try {
    const res = await fetchWithTimeout(`https://api.travelpayouts.com/v1/prices/cheap?origin=${origin.toUpperCase()}&destination=${destination.toUpperCase()}&currency=USD&token=${TP_TOKEN}`, {}, 3000);
    if (!res.ok) return { price: "N/A", link: "#" };
    const data = await res.json();
    const flightResults = data.data?.[destination.toUpperCase()];
    if (flightResults) {
      const cheapest = Object.values(flightResults)[0] as any;
      return {
        price: cheapest.price,
        airline: cheapest.airline,
        link: `https://www.aviasales.com/search/${origin.toUpperCase()}${cheapest.departure_at.slice(8,10)}${cheapest.departure_at.slice(5,7)}${destination.toUpperCase()}1?marker=${TP_MARKER}`
      };
    }
    return { price: "N/A", link: "#" };
  } catch {
    return { price: "N/A", link: "#" };
  }
}

// 4. Hotel Prices
export async function fetchHotelPrices(iata: string) {
  try {
    const checkIn = "2026-05-15";
    const checkOut = "2026-05-20";
    const res = await fetchWithTimeout(`https://engine.hotellook.com/api/v2/cache.json?location=${iata.toUpperCase()}&currency=usd&checkIn=${checkIn}&checkOut=${checkOut}&limit=1&token=${TP_TOKEN}`, {}, 3000);
    if (!res.ok) return { price: "N/A", link: "#" };
    const data = await res.json();
    if (data?.length > 0) {
      return {
        price: data[0].priceAvg,
        link: `https://search.hotellook.com/hotels?locationId=${iata.toUpperCase()}&checkIn=${checkIn}&checkOut=${checkOut}&marker=${TP_MARKER}&language=en&currency=usd`
      };
    }
    return { price: "N/A", link: "#" };
  } catch {
    return { price: "N/A", link: "#" };
  }
}

// 5. City Metrics (Teleport) - Sequential step optimization
export async function fetchTeleportData(cityName: string) {
  try {
    // Stage 1: Search - 2s limit
    const searchRes = await fetchWithTimeout(`https://api.teleport.org/api/cities/?search=${encodeURIComponent(cityName)}`, {}, 2000);
    const searchData = await searchRes.json();
    const cityLink = searchData._embedded?.["city:search-results"]?.[0]?._links?.["city:item"]?.href;
    if (!cityLink) return null;

    // Stage 2: Get scores - 3s limit
    // We attempt to derive the urban area link from the city name if the API is too slow
    // But for robustness, we follow one level deeper only
    const cityRes = await fetchWithTimeout(cityLink, {}, 2000);
    const cityData = await cityRes.json();
    const urbanAreaLink = cityData._links?.["city:urban_area"]?.href;
    if (!urbanAreaLink) return null;

    const scoresRes = await fetchWithTimeout(`${urbanAreaLink}scores/`, {}, 2500);
    const scoresData = await scoresRes.json();

    const metrics: Record<string, number> = {};
    scoresData.categories.forEach((cat: any) => {
      metrics[cat.name] = cat.score_out_of_10;
    });

    return { scores: metrics, teleport_score: scoresData.teleport_city_score };
  } catch {
    return null; // Silent fallback
  }
}

// 6. Nomad Score Calculation
export function calculateNomadScore(teleportData: any) {
  if (!teleportData || !teleportData.scores) return "75.0"; // Generous default

  const internet = teleportData.scores["Internet Access"] || 7;
  const cost = teleportData.scores["Cost of Living"] || 6;
  const safety = teleportData.scores["Safety"] || 7;

  return (internet * 4 + cost * 3 + safety * 3).toFixed(1);
}
