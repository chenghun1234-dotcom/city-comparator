/**
 * Data fetchers for the Digital Nomad City Comparator.
 * Phase 2+: Hardened with timeouts and deep error handling for production stability.
 */

const TP_TOKEN = process.env.TRAVELPAYOUTS_TOKEN || '47f0a19d66d6c228fddcfda073131628';
const TP_MARKER = process.env.TRAVELPAYOUTS_MARKER || '520319';

// Helper for fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 6000) {
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

// 1. Geocoding via Open-Meteo
export async function getCoords(city: string) {
  try {
    const res = await fetchWithTimeout(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    if (!res.ok) throw new Error("Geocoding failed");
    const data = await res.json();
    return data.results?.[0] || { latitude: 0, longitude: 0, name: city, country: "", iata: city.toUpperCase() };
  } catch (error) {
    console.warn(`Geocoding fallback for ${city}`);
    return { latitude: 0, longitude: 0, name: city, country: "", iata: city.toUpperCase() };
  }
}

// 2. Weather via Open-Meteo
export async function fetchWeather(lat: number, lon: number) {
  try {
    const res = await fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Weather error:", error);
    return null;
  }
}

// 3. Flights via Travelpayouts
export async function fetchTravelpayoutsFlights(origin: string, destination: string) {
  try {
    const res = await fetchWithTimeout(`https://api.travelpayouts.com/v1/prices/cheap?origin=${origin.toUpperCase()}&destination=${destination.toUpperCase()}&currency=USD&token=${TP_TOKEN}`);
    if (!res.ok) throw new Error("TP Flight API failed");
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
  } catch (error) {
    console.error("TP Flight error:", error);
    return { price: "N/A", link: "#" };
  }
}

// 4. Hotel Prices via Travelpayouts
export async function fetchHotelPrices(iata: string) {
  try {
    const checkIn = "2026-05-15";
    const checkOut = "2026-05-20";
    const res = await fetchWithTimeout(`https://engine.hotellook.com/api/v2/cache.json?location=${iata.toUpperCase()}&currency=usd&checkIn=${checkIn}&checkOut=${checkOut}&limit=1&token=${TP_TOKEN}`);
    if (!res.ok) throw new Error("TP Hotel API failed");
    const data = await res.json();

    if (data && data.length > 0) {
      return {
        price: data[0].priceAvg,
        link: `https://search.hotellook.com/hotels?locationId=${iata.toUpperCase()}&checkIn=${checkIn}&checkOut=${checkOut}&marker=${TP_MARKER}&language=en&currency=usd`
      };
    }
    return { price: "N/A", link: "#" };
  } catch (error) {
    console.error("TP Hotel error:", error);
    return { price: "N/A", link: "#" };
  }
}

// 5. City Metrics via Teleport
export async function fetchTeleportData(cityName: string) {
  try {
    // 1. Search city
    const searchRes = await fetchWithTimeout(`https://api.teleport.org/api/cities/?search=${encodeURIComponent(cityName)}`, {}, 4000);
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    
    const cityLink = searchData._embedded?.["city:search-results"]?.[0]?._links?.["city:item"]?.href;
    if (!cityLink) return null;

    // 2. Get urban area
    const cityRes = await fetchWithTimeout(cityLink, {}, 4000);
    if (!cityRes.ok) return null;
    const cityData = await cityRes.json();
    const urbanAreaLink = cityData._links?.["city:urban_area"]?.href;
    if (!urbanAreaLink) return null;

    // 3. Get scores
    const scoresRes = await fetchWithTimeout(`${urbanAreaLink}scores/`, {}, 4000);
    if (!scoresRes.ok) return null;
    const scoresData = await scoresRes.json();

    const metrics: Record<string, number> = {};
    scoresData.categories.forEach((cat: any) => {
      metrics[cat.name] = cat.score_out_of_10;
    });

    return {
      scores: metrics,
      summary: scoresData.summary,
      teleport_score: scoresData.teleport_city_score
    };
  } catch (error) {
    console.error(`Teleport error for ${cityName}:`, error);
    return null;
  }
}

// 6. Nomad Score Calculation
export function calculateNomadScore(teleportData: any) {
  if (!teleportData || !teleportData.scores) return "50.0";

  const internet = teleportData.scores["Internet Access"] || 5;
  const cost = teleportData.scores["Cost of Living"] || 5;
  const safety = teleportData.scores["Safety"] || 5;

  return (internet * 4 + cost * 3 + safety * 3).toFixed(1);
}
