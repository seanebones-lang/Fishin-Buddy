/**
 * Environment Configuration with Validation
 * Validates all required environment variables at runtime
 */

interface EnvConfig {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  OPENWEATHER_API_KEY?: string;
  USGS_API_KEY?: string;
  NOAA_API_KEY?: string;
  FISHBRAIN_API_KEY?: string;
  MAPBOX_ACCESS_TOKEN?: string;
  SENTRY_DSN?: string;
  XAI_API_KEY?: string;
  ENV: 'development' | 'production' | 'staging';
}

class EnvValidationError extends Error {
  constructor(message: string) {
    super(`Environment Configuration Error: ${message}`);
    this.name = 'EnvValidationError';
  }
}

/**
 * Validates that a required environment variable exists
 */
function validateEnv(key: string, optional = false): string {
  const value = process.env[key];
  
  if (!value && !optional) {
    throw new EnvValidationError(
      `Missing required environment variable: ${key}. ` +
      `Please check your .env file or environment configuration.`
    );
  }
  
  return value || '';
}

/**
 * Validates URL format
 */
function validateUrl(key: string, value: string): string {
  try {
    new URL(value);
    return value;
  } catch {
    throw new EnvValidationError(
      `Invalid URL format for ${key}: ${value}`
    );
  }
}

/**
 * Get validated environment configuration
 */
export function getEnvConfig(): EnvConfig {
  const supabaseUrl = validateEnv('EXPO_PUBLIC_SUPABASE_URL');
  const supabaseAnonKey = validateEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  
  // Validate Supabase URL format
  validateUrl('EXPO_PUBLIC_SUPABASE_URL', supabaseUrl);
  
  // Validate Supabase key format (should start with eyJ)
  if (!supabaseAnonKey.startsWith('eyJ')) {
    throw new EnvValidationError(
      'EXPO_PUBLIC_SUPABASE_ANON_KEY appears to be invalid. ' +
      'Supabase keys typically start with "eyJ" (JWT format).'
    );
  }
  
  const env = (process.env.EXPO_PUBLIC_ENV || 'development') as EnvConfig['ENV'];
  
  if (!['development', 'production', 'staging'].includes(env)) {
    throw new EnvValidationError(
      `Invalid ENV value: ${env}. Must be one of: development, production, staging`
    );
  }
  
  return {
    SUPABASE_URL: supabaseUrl,
    SUPABASE_ANON_KEY: supabaseAnonKey,
    OPENWEATHER_API_KEY: validateEnv('EXPO_PUBLIC_OPENWEATHER_API_KEY', true),
    USGS_API_KEY: validateEnv('EXPO_PUBLIC_USGS_API_KEY', true),
    NOAA_API_KEY: validateEnv('EXPO_PUBLIC_NOAA_API_KEY', true),
    FISHBRAIN_API_KEY: validateEnv('EXPO_PUBLIC_FISHBRAIN_API_KEY', true),
    MAPBOX_ACCESS_TOKEN: validateEnv('EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN', true),
    SENTRY_DSN: validateEnv('EXPO_PUBLIC_SENTRY_DSN', true),
    XAI_API_KEY: validateEnv('EXPO_PUBLIC_XAI_API_KEY', true),
    ENV: env,
  };
}

// Export singleton instance
let envConfig: EnvConfig | null = null;

export function getEnv(): EnvConfig {
  if (!envConfig) {
    envConfig = getEnvConfig();
  }
  return envConfig;
}

// Validate on module load (fail fast)
try {
  getEnv();
} catch (error) {
  if (error instanceof EnvValidationError) {
    console.error('\n❌', error.message);
    console.error('\n💡 Tip: Copy .env.example to .env and fill in your values\n');
    // In development, we might want to allow missing env vars for testing
    // In production, we should crash immediately
    if (process.env.EXPO_PUBLIC_ENV === 'production') {
      throw error;
    }
  } else {
    throw error;
  }
}
