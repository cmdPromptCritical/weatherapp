import { WeatherDashboard } from "@/components/weather-dashboard"
import { fetchWeatherData } from "@/lib/weather-api"
import type { LocationKey } from "@/lib/weather-config"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function Home({ searchParams }: { searchParams: Promise<any> }) {
  const resolvedSearchParams = await searchParams;
  const currentLocation = (resolvedSearchParams?.location as LocationKey) || "bowmanville"

  try {
    const weatherData = await fetchWeatherData(currentLocation)

    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <WeatherDashboard weatherData={weatherData} currentLocation={currentLocation} />
      </main>
    )
  } catch (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="container mx-auto p-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <div className="text-red-600 mb-4">⚠️ Weather data unavailable</div>
              <p className="text-red-700 mb-4">
                {error instanceof Error ? error.message : "Failed to fetch weather data"}
              </p>
              <a href={`/?location=${currentLocation}`}>
                <Button variant="outline">Try Again</Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }
}
