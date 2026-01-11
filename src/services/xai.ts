/**
 * xAI API Service
 * Integrates with xAI API for intelligent bite predictions
 */

import { getEnv } from '../config/env';
import { post } from './apiClient';

export interface XAIPredictionRequest {
  location: {
    lat: number;
    lng: number;
  };
  species: string;
  currentTime: string; // ISO 8601
  weather?: {
    temp?: number;
    pressure?: number;
    windSpeed?: number;
    windDirection?: number;
  };
  moonPhase?: number; // 0-1
  historicalData?: Array<{
    date: string;
    biteIndex: number;
    catchCount: number;
  }>;
}

export interface XAIPredictionResponse {
  biteIndex: number; // 0-100
  confidence: number; // 0-1
  hourlyForecast: Array<{
    hour: number;
    biteIndex: number;
    confidence: number;
  }>;
  recommendations: {
    bestBait: string;
    bestTime: string;
    notes: string;
  };
}

/**
 * Get bite prediction from xAI API
 */
export async function getXAIPrediction(
  request: XAIPredictionRequest
): Promise<XAIPredictionResponse> {
  const env = getEnv();
  
  if (!env.XAI_API_KEY) {
    console.warn('xAI API key not configured, using fallback prediction');
    return getFallbackPrediction(request);
  }

  // Construct prompt for xAI
  const prompt = buildPredictionPrompt(request);

  try {
    // Call xAI API (using Grok API endpoint)
    const response = await post<{
      choices: Array<{
        message: {
          content: string;
        };
      }>;
    }>(
      'https://api.x.ai/v1/chat/completions',
      {
        model: 'grok-beta', // or 'grok-2' if available
        messages: [
          {
            role: 'system',
            content: 'You are an expert fishing prediction AI. Analyze weather, location, species, and time data to predict fishing bite probability. Return ONLY valid JSON, no other text.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      },
      {
        retry: true,
        retryOptions: {
          maxAttempts: 3,
          initialDelay: 1000,
        },
        headers: new Headers({
          'Authorization': `Bearer ${env.XAI_API_KEY}`,
          'Content-Type': 'application/json',
        }),
      }
    );

    // Parse xAI response
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from xAI API');
    }

    const parsed = JSON.parse(content) as {
      biteIndex?: number;
      confidence?: number;
      hourlyForecast?: Array<{ hour: number; biteIndex: number; confidence: number }>;
      recommendations?: { bestBait: string; bestTime: string; notes: string };
    };

    // Validate and normalize response
    const biteIndex = Math.round(Math.max(0, Math.min(100, parsed.biteIndex ?? 50)));
    const confidence = Math.max(0, Math.min(1, parsed.confidence ?? 0.8));
    const hourlyForecast = parsed.hourlyForecast?.map(h => ({
      hour: h.hour,
      biteIndex: Math.round(Math.max(0, Math.min(100, h.biteIndex))),
      confidence: Math.max(0, Math.min(1, h.confidence ?? confidence)),
    })) ?? [];

    return {
      biteIndex,
      confidence,
      hourlyForecast,
      recommendations: parsed.recommendations ?? {
        bestBait: 'Live bait recommended',
        bestTime: 'Morning or evening',
        notes: 'Based on current conditions',
      },
    };
  } catch (error) {
    console.error('xAI API error:', error);
    
    // Fallback to intelligent estimate if API fails
    return getFallbackPrediction(request);
  }
}

/**
 * Build prediction prompt for xAI
 */
function buildPredictionPrompt(request: XAIPredictionRequest): string {
  const { location, species, currentTime, weather, moonPhase } = request;
  
  const date = new Date(currentTime);
  const hour = date.getHours();
  
  let prompt = `Predict fishing bite probability for ${species} at location (${location.lat}, ${location.lng}) on ${date.toISOString()}.\n\n`;
  
  if (weather) {
    prompt += `Weather conditions:\n`;
    if (weather.temp !== undefined) prompt += `- Temperature: ${weather.temp}°C\n`;
    if (weather.pressure !== undefined) prompt += `- Barometric pressure: ${weather.pressure} hPa\n`;
    if (weather.windSpeed !== undefined) prompt += `- Wind speed: ${weather.windSpeed} mph\n`;
    if (weather.windDirection !== undefined) prompt += `- Wind direction: ${weather.windDirection}°\n`;
  }
  
  if (moonPhase !== undefined) {
    prompt += `Moon phase: ${(moonPhase * 100).toFixed(0)}%\n`;
  }
  
  prompt += `\nReturn JSON with:\n`;
  prompt += `- "biteIndex": number 0-100 (bite probability)\n`;
  prompt += `- "confidence": number 0-1 (prediction confidence)\n`;
  prompt += `- "hourlyForecast": array of {hour: 0-23, biteIndex: 0-100, confidence: 0-1} for next 12 hours\n`;
  prompt += `- "recommendations": {bestBait: string, bestTime: string, notes: string}\n`;
  
  return prompt;
}

/**
 * Fallback prediction if xAI API fails
 */
function getFallbackPrediction(request: XAIPredictionRequest): XAIPredictionResponse {
  const { species, weather, moonPhase } = request;
  const date = new Date(request.currentTime);
  const hour = date.getHours();
  
  // Intelligent fallback calculation
  const speciesFactors: Record<string, number> = {
    bass: 1.1,
    trout: 0.9,
    catfish: 1.0,
    walleye: 1.05,
  };
  
  const speciesFactor = speciesFactors[species] || 1.0;
  
  // Time-based pattern (dawn and dusk are best)
  const timeFactor = Math.sin((hour / 24) * Math.PI * 2) * 0.3 + 0.7;
  
  // Weather factors
  let weatherFactor = 1.0;
  if (weather) {
    if (weather.temp !== undefined && weather.temp > 15 && weather.temp < 25) {
      weatherFactor *= 1.2; // Optimal temperature
    }
    if (weather.pressure !== undefined && weather.pressure > 1013) {
      weatherFactor *= 1.1; // High pressure is good
    }
  }
  
  // Moon phase factor
  const moonFactor = moonPhase !== undefined ? 0.7 + moonPhase * 0.3 : 1.0;
  
  // Calculate base bite index
  const baseBite = 50 * speciesFactor * timeFactor * weatherFactor * moonFactor;
  const biteIndex = Math.round(Math.max(0, Math.min(100, baseBite)));
  
  // Generate hourly forecast
  const hourlyForecast = Array.from({ length: 12 }, (_, i) => {
    const forecastHour = (hour + i) % 24;
    const forecastTimeFactor = Math.sin((forecastHour / 24) * Math.PI * 2) * 0.3 + 0.7;
    const forecastBite = Math.round(Math.max(0, Math.min(100, 50 * speciesFactor * forecastTimeFactor * weatherFactor * moonFactor)));
    return {
      hour: forecastHour,
      biteIndex: forecastBite,
      confidence: 0.7,
    };
  });
  
  return {
    biteIndex,
    confidence: 0.7,
    hourlyForecast,
    recommendations: {
      bestBait: `${species} specific bait recommended`,
      bestTime: hour < 12 ? 'Morning is optimal' : 'Evening is optimal',
      notes: 'Fallback prediction - xAI API unavailable',
    },
  };
}
