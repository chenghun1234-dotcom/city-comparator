import { NextResponse } from 'next/server';
import { getCoords, fetchWeather, fetchTravelpayoutsFlights, fetchHotelPrices, fetchTeleportData, calculateNomadScore } from '@/lib/api-fetchers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city1 = searchParams.get('city1') || 'ICN';
  const city2 = searchParams.get('city2') || 'BKK';

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

    // Ensure NO null objects in crucial fields
    return NextResponse.json({
      status: "success",
      summary: {
        recommended_city: parseFloat(score1) > parseFloat(score2) ? (city1Geo.name) : (city2Geo.name),
        reason: `${parseFloat(score1) > parseFloat(score2) ? city1Geo.name : city2Geo.name} has superior nomad metrics.`
      },
      data: {
        city1: { 
          info: { code: city1, name: city1Geo.name, nomad_score: score1 }, 
          weather: weather1?.current_weather || {}, 
          metrics: teleport1?.scores || {}, 
          lodging: hotel1 || { price: "N/A", link: "#" } 
        },
        city2: { 
          info: { code: city2, name: city2Geo.name, nomad_score: score2 }, 
          weather: weather2?.current_weather || {}, 
          metrics: teleport2?.scores || {}, 
          lodging: hotel2 || { price: "N/A", link: "#" } 
        },
        travel: flightData || { price: "N/A", link: "#" }
      }
    });

  } catch (error) {
    return NextResponse.json({ error: "Stabilization in progress" }, { status: 500 });
  }
}
