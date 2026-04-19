/**
 * Data fetchers for the Digital Nomad City Comparator.
 * Phase 2: Integrated with Travelpayouts for Flight and Hotel monetization.
 */

const TP_TOKEN = process.env.TRAVELPAYOUTS_TOKEN || '47f0a19d66d6c228fddcfda073131628';
const TP_MARKER = process.env.TRAVELPAYOUTS_MARKER || '520319';

// 1. Geocoding via Open-Meteo (No key)
export async function getCoords(city: string) {
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    const data = await res.json();
    return data.results?.[0] || { latitude: 0, longitude: 0, name: city, country: "", iata: city.toUpperCase() };
  } catch (error) {
    console.error(`Error fetching coords for ${city}:`, error);
    return { latitude: 0, longitude: 0, name: city, country: "", iata: city.toUpperCase() };
  }
}

// 2. Weather via Open-Meteo (No key)
export async function fetchWeather(lat: number, lon: number) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather API failed");
    return await res.json();
  } catch (error) {
    console.error("Error fetching weather:", error);
    return null;
  }
}

// 3. Flights via Travelpayouts Data API (Cached)
export async function fetchTravelpayoutsFlights(origin: string, destination: string) {
  try {
    // Using v1/prices/cheap for cached prices
    const url = `https://api.travelpayouts.com/v1/prices/cheap?origin=${origin}&destination=${destination}&currency=USD&token=${TP_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();
    
    // The data structure is { SUCCESS: true, DATA: { BKK: { "0": { price: ... } } } }
    const flightResults = data.data?.[destination];
    if (flightResults) {
      const cheapest = Object.values(flightResults)[0] as any;
      return {
        price: cheapest.price,
        airline: cheapest.airline,
        link: `https://www.aviasales.com/search/${origin}${cheapest.departure_at.slice(8,10)}${cheapest.departure_at.slice(5,7)}${destination}1?marker=${TP_MARKER}`
      };
    }
    return { price: "N/A", link: "#" };
  } catch (error) {
    console.error("Error fetching Travelpayouts flights:", error);
    return { price: "N/A", link: "#" };
  }
}

// 4. Hotel Prices via Travelpayouts (Hotellook) Data API
export async function fetchHotelPrices(iata: string) {
  try {
    // Get cached hotel prices for the next month
    const checkIn = "2026-05-15";
    const checkOut = "2026-05-20";
    const url = `https://engine.hotellook.com/api/v2/cache.json?location=${iata}&currency=usd&checkIn=${checkIn}&checkOut=${checkOut}&limit=1&token=${TP_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data && data.length > 0) {
      return {
        price: data[0].priceAvg,
        link: `https://search.hotellook.com/hotels?locationId=${iata}&checkIn=${checkIn}&checkOut=${checkOut}&marker=${TP_MARKER}&language=en&currency=usd`
      };
    }
    return { price: "N/A", link: "#" };
  } catch (error) {
    console.error("Error fetching Travelpayouts hotels:", error);
    return { price: "N/A", link: "#" };
  }
}

// 5. City Metrics via Teleport (No key)
export async function fetchTeleportData(cityName: string) {
  try {
    const searchUrl = `https://api.teleport.org/api/cities/?search=${encodeURIComponent(cityName)}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    
    const cityLink = searchData._embedded?.["city:search-results"]?.[0]?._links?.["city:item"]?.href;
    if (!cityLink) return null;

    const cityRes = await fetch(cityLink);
    const cityData = await cityRes.json();
    const urbanAreaLink = cityData._links?.["city:urban_area"]?.href;
    if (!urbanAreaLink) return null;

    const scoresRes = await fetch(`${urbanAreaLink}scores/`);
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
    console.error(`Error fetching Teleport data for ${cityName}:`, error);
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
