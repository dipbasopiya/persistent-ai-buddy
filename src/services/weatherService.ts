// Weather service using Open-Meteo API (no API key needed)
// Uses browser geolocation for accurate location detection

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  condition: string;
  windSpeed: number;
  feelsLike: number;
}

const LOCATION_KEY = 'jarvis-location';
const WEATHER_KEY = 'jarvis-weather-cache';

// Weather code to condition mapping
const weatherCodeToCondition: Record<number, string> = {
  0: 'Clear',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Foggy',
  51: 'Light Drizzle',
  53: 'Drizzle',
  55: 'Dense Drizzle',
  56: 'Freezing Drizzle',
  57: 'Freezing Drizzle',
  61: 'Light Rain',
  63: 'Rain',
  65: 'Heavy Rain',
  66: 'Freezing Rain',
  67: 'Freezing Rain',
  71: 'Light Snow',
  73: 'Snow',
  75: 'Heavy Snow',
  77: 'Snow Grains',
  80: 'Light Showers',
  81: 'Showers',
  82: 'Heavy Showers',
  85: 'Snow Showers',
  86: 'Heavy Snow Showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with Hail',
  99: 'Thunderstorm with Hail',
};

export function getSavedLocation(): LocationData | null {
  const stored = localStorage.getItem(LOCATION_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

export function saveLocation(location: LocationData): void {
  localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
}

export async function getCurrentPosition(): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        // Try to get city name using reverse geocoding
        try {
          const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${location.latitude}&longitude=${location.longitude}&format=json`
          );
          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              location.city = data.results[0].name;
              location.country = data.results[0].country;
            }
          }
        } catch (e) {
          // Ignore geocoding errors, we still have coordinates
          console.log('Reverse geocoding failed:', e);
        }

        saveLocation(location);
        resolve(location);
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  });
}

export async function fetchWeather(location: LocationData): Promise<WeatherData> {
  const { latitude, longitude } = location;
  
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }

  const data = await response.json();
  const current = data.current;

  const weather: WeatherData = {
    temperature: Math.round(current.temperature_2m),
    humidity: current.relative_humidity_2m,
    condition: weatherCodeToCondition[current.weather_code] || 'Unknown',
    windSpeed: Math.round(current.wind_speed_10m),
    feelsLike: Math.round(current.apparent_temperature),
  };

  // Cache weather data
  localStorage.setItem(WEATHER_KEY, JSON.stringify({
    data: weather,
    timestamp: Date.now(),
  }));

  return weather;
}

export function getCachedWeather(): { data: WeatherData; timestamp: number } | null {
  const stored = localStorage.getItem(WEATHER_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

export async function searchLocation(query: string): Promise<LocationData[]> {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
  );

  if (!response.ok) {
    throw new Error('Failed to search location');
  }

  const data = await response.json();
  
  if (!data.results) {
    return [];
  }

  return data.results.map((result: any) => ({
    latitude: result.latitude,
    longitude: result.longitude,
    city: result.name,
    country: result.country,
  }));
}
