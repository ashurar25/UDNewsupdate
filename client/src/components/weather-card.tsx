import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type WeatherForecast, type WeatherLocation } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloudRain, Sun, Cloud, Wind, Droplets, Eye, Thermometer, Calendar } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface WeatherCardProps {
  locationId: string;
  locationName: string;
}

export default function WeatherCard({ locationId, locationName }: WeatherCardProps) {
  const [activeTab, setActiveTab] = useState<"forecast" | "historical">("forecast");

  // Fetch forecast data
  const { data: forecastData = [], isLoading: forecastLoading } = useQuery<WeatherForecast[]>({
    queryKey: ["/api/weather/forecast", locationId, { historical: false, days: 7 }],
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
  });

  // Fetch historical data
  const { data: historicalData = [], isLoading: historicalLoading } = useQuery<WeatherForecast[]>({
    queryKey: ["/api/weather/forecast", locationId, { historical: true, days: 7 }],
    refetchInterval: 60 * 60 * 1000, // Refetch every hour
  });

  const getWeatherIcon = (icon: string | null) => {
    switch (icon) {
      case "sunny":
        return <Sun className="w-8 h-8 text-yellow-500" />;
      case "partly-cloudy":
        return <Cloud className="w-8 h-8 text-gray-400" />;
      case "cloudy":
        return <Cloud className="w-8 h-8 text-gray-600" />;
      case "rainy":
      case "stormy":
        return <CloudRain className="w-8 h-8 text-blue-500" />;
      default:
        return <Sun className="w-8 h-8 text-yellow-500" />;
    }
  };

  const renderWeatherList = (data: WeatherForecast[], loading: boolean) => {
    if (loading) {
      return (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>ไม่พบข้อมูลสภาพอากาศ</p>
        </div>
      );
    }

    return (
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {data.slice(0, 7).map((weather) => (
          <div key={weather.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-3">
              {getWeatherIcon(weather.icon)}
              <div>
                <div className="font-medium text-gray-800">
                  {format(new Date(weather.date), "d MMM", { locale: th })}
                </div>
                <div className="text-sm text-gray-600">{weather.description}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-800">
                {weather.temperature}°C
              </div>
              <div className="text-sm text-gray-500">
                {weather.temperatureMin}° - {weather.temperatureMax}°
              </div>
              <div className="flex items-center text-xs text-blue-600 mt-1">
                <Droplets className="w-3 h-3 mr-1" />
                {weather.rainChance}%
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const currentWeather = forecastData[0];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Thermometer className="w-5 h-5 text-thai-orange" />
          <span>สภาพอากาศ {locationName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Weather Summary */}
        {currentWeather && (
          <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getWeatherIcon(currentWeather.icon)}
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {currentWeather.temperature}°C
                  </div>
                  <div className="text-gray-600">{currentWeather.description}</div>
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Wind className="w-4 h-4 mr-1" />
                  {currentWeather.windSpeed} m/s
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Droplets className="w-4 h-4 mr-1" />
                  {currentWeather.humidity}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Forecast/Historical Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "forecast" | "historical")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="forecast">พยากรณ์อากาศ</TabsTrigger>
            <TabsTrigger value="historical">ข้อมูลย้อนหลัง</TabsTrigger>
          </TabsList>
          
          <TabsContent value="forecast" className="mt-4">
            {renderWeatherList(forecastData, forecastLoading)}
          </TabsContent>
          
          <TabsContent value="historical" className="mt-4">
            {renderWeatherList(historicalData, historicalLoading)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}