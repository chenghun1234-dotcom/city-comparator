import { NextResponse } from 'next/server';
import { getCoords, fetchWeather, fetchTravelpayoutsFlights, fetchHotelPrices, fetchTeleportData, calculateNomadScore } from '@/lib/api-fetchers';

export const runtime = 'edge';

export async function GET(request: Request) {
  // RapidAPI Security Gate
  const proxySecret = process.env.RAPIDAPI_PROXY_SECRET;
  const incomingSecret = request.headers.get('x-rapidapi-proxy-secret');

  // If a secret is set in environment, enforce it.
  if (proxySecret && incomingSecret !== proxySecret) {
    return NextResponse.json({ error: "Unauthorized: Invalid RapidAPI Proxy Secret" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const city1 = searchParams.get('city1') || 'ICN';
  const city2 = searchParams.get('city2') || 'BKK';

  try {
    // 1. Parallel fetching for base coordinates
    const [city1Geo, city2Geo] = await Promise.all([
      getCoords(city1),
      getCoords(city2)
    ]);

    // 2. Parallel fetching for all other metrics
    // We wrap each fetch in an individual try/catch or ensure default values in fetchers
    const [weather1, weather2, flightData, hotel1, hotel2, teleport1, teleport2] = await Promise.all([
      fetchWeather(city1Geo.latitude, city1Geo.longitude),
      fetchWeather(city2Geo.latitude, city2Geo.longitude),
      fetchTravelpayoutsFlights(city1, city2),
      fetchHotelPrices(city1),
      fetchHotelPrices(city2),
      fetchTeleportData(city1),
      fetchTeleportData(city2)
    ]);

    // 3. Calculate Nomad Scores (Defensive)
    const score1 = calculateNomadScore(teleport1);
    const score2 = calculateNomadScore(teleport2);

    // 4. Construct response DTO with strict null/undefined checks
    const result = {
      status: "success",
      meta: {
        request_id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        currency: "USD",
      },
      summary: {
        recommended_city: parseFloat(score1) > parseFloat(score2) ? (city1Geo.name || city1) : (city2Geo.name || city2),
        reason: parseFloat(score1) > parseFloat(score2) 
          ? `${city1Geo.name || city1} has a higher Nomad Score.`
          : `${city2Geo.name || city2} has a higher Nomad Score.`
      },
      data: {
        city1: {
          info: {
            code: city1,
            name: city1Geo.name || city1,
            nomad_score: score1
          },
          weather: weather1?.current_weather ? {
            temp: weather1.current_weather.temperature,
            condition: weather1.current_weather.weathercode,
            high: weather1.daily?.temperature_2m_max?.[0] || 'N/A',
            low: weather1.daily?.temperature_2m_min?.[0] || 'N/A'
          } : null,
          metrics: teleport1?.scores ? {
            internet: teleport1.scores["Internet Access"] || 0,
            safety: teleport1.scores["Safety"] || 0,
            cost_of_living: teleport1.scores["Cost of Living"] || 0
          } : null,
          lodging: {
            avg_price: hotel1?.price || 'N/A',
            booking_link: hotel1?.link || '#'
          }
        },
        city2: {
          info: {
            code: city2,
            name: city2Geo.name || city2,
            nomad_score: score2
          },
          weather: weather2?.current_weather ? {
            temp: weather2.current_weather.temperature,
            condition: weather2.current_weather.weathercode,
            high: weather2.daily?.temperature_2m_max?.[0] || 'N/A',
            low: weather2.daily?.temperature_2m_min?.[0] || 'N/A'
          } : null,
          metrics: teleport2?.scores ? {
            internet: teleport2.scores["Internet Access"] || 0,
            safety: teleport2.scores["Safety"] || 0,
            cost_of_living: teleport2.scores["Cost of Living"] || 0
          } : null,
          lodging: {
            avg_price: hotel2?.price || 'N/A',
            booking_link: hotel2?.link || '#'
          }
        },
        travel: {
          min_price: flightData?.price || "N/A",
          booking_link: flightData?.link || "#"
        }
      }
    };

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });

  } catch (error) {
    console.error("Critical API Error:", error);
    return NextResponse.json({ 
      error: "Service temporarily unavailable", 
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
