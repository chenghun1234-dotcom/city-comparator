import { NextResponse } from 'next/server';
import { getCoords, fetchWeather, fetchTravelpayoutsFlights, fetchHotelPrices, fetchTeleportData, calculateNomadScore } from '@/lib/api-fetchers';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city1 = searchParams.get('city1') || 'ICN';
  const city2 = searchParams.get('city2') || 'BKK';
  
  // 1. RapidAPI Proxy Secret Validation
  const headerList = await headers();
  const incomingSecret = headerList.get('x-rapidapi-proxy-secret');
  const localSecret = process.env.RAPIDAPI_PROXY_SECRET;

  // For local testing: Skip validation if requested via browser (no header) 
  // but keep it active for production envs.
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd && localSecret && localSecret !== 'your_rapidapi_proxy_secret_here' && incomingSecret !== localSecret) {
    return NextResponse.json({ 
      status: "error", 
      message: "Unauthorized: Missing or invalid RapidAPI Proxy Secret" 
    }, { status: 401 });
  }

  const requestId = crypto.randomUUID();

  try {
    const [city1Geo, city2Geo] = await Promise.all([
      getCoords(city1),
      getCoords(city2)
    ]);

    const [weather1, weather2, flightData, hotel1, hotel2, teleport1, teleport2] = await Promise.all([
      fetchWeather(city1Geo.latitude, city1Geo.longitude),
      fetchWeather(city2Geo.latitude, city2Geo.longitude),
      fetchTravelpayoutsFlights(city1, city2),
      fetchHotelPrices(city1),
      fetchHotelPrices(city2),
      fetchTeleportData(city1),
      fetchTeleportData(city2)
    ]);

    const score1 = calculateNomadScore(teleport1);
    const score2 = calculateNomadScore(teleport2);

    return NextResponse.json({
      status: "success",
      meta: {
        request_id: requestId,
        timestamp: new Date().toISOString(),
        currency: "USD"
      },
      summary: {
        recommended_city: parseFloat(score1) > parseFloat(score2) ? (city1Geo.name) : (city2Geo.name),
        reason: `${parseFloat(score1) > parseFloat(score2) ? city1Geo.name : city2Geo.name} has superior nomad metrics based on current data.`
      },
      data: {
        city1: { 
          info: { code: city1, name: city1Geo.name, nomad_score: score1 }, 
          weather: weather1?.current_weather || {}, 
          metrics: teleport1?.scores || { "Internet Access": 5, "Cost of Living": 5, "Safety": 5 }, 
          lodging: hotel1 || { price: "N/A", link: "#" } 
        },
        city2: { 
          info: { code: city2, name: city2Geo.name, nomad_score: score2 }, 
          weather: weather2?.current_weather || {}, 
          metrics: teleport2?.scores || { "Internet Access": 5, "Cost of Living": 5, "Safety": 5 }, 
          lodging: hotel2 || { price: "N/A", link: "#" } 
        },
        travel: {
          min_price: flightData?.price || "N/A",
          booking_link: flightData?.link || "#",
          airline: flightData?.airline || "N/A"
        }
      }
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ 
      status: "error", 
      message: "An internal error occurred during comparison. Stabilization in progress." 
    }, { status: 500 });
  }
}
