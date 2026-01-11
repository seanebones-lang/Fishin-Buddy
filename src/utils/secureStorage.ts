/**
 * Secure Storage Utility
 * Wraps expo-secure-store for secure token and sensitive data storage
 */

import * as SecureStore from 'expo-secure-store';

const STORAGE_KEYS = {
  AUTH_TOKEN: 'bitecast.auth.token',
  REFRESH_TOKEN: 'bitecast.auth.refresh_token',
  USER_ID: 'bitecast.user.id',
} as const;

/**
 * Store a value securely
 */
export async function setSecureItem(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`Failed to store secure item ${key}:`, error);
    throw new Error(`Secure storage failed: ${error}`);
  }
}

/**
 * Retrieve a value from secure storage
 */
export async function getSecureItem(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Failed to retrieve secure item ${key}:`, error);
    return null;
  }
}

/**
 * Remove a value from secure storage
 */
export async function deleteSecureItem(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`Failed to delete secure item ${key}:`, error);
  }
}

/**
 * Store auth tokens securely
 */
export async function storeAuthTokens(accessToken: string, refreshToken: string): Promise<void> {
  await Promise.all([
    setSecureItem(STORAGE_KEYS.AUTH_TOKEN, accessToken),
    setSecureItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
  ]);
}

/**
 * Get stored auth tokens
 */
export async function getAuthTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
  const [accessToken, refreshToken] = await Promise.all([
    getSecureItem(STORAGE_KEYS.AUTH_TOKEN),
    getSecureItem(STORAGE_KEYS.REFRESH_TOKEN),
  ]);
  
  return { accessToken, refreshToken };
}

/**
 * Clear all auth tokens
 */
export async function clearAuthTokens(): Promise<void> {
  await Promise.all([
    deleteSecureItem(STORAGE_KEYS.AUTH_TOKEN),
    deleteSecureItem(STORAGE_KEYS.REFRESH_TOKEN),
    deleteSecureItem(STORAGE_KEYS.USER_ID),
  ]);
}

/**
 * Store user ID securely
 */
export async function storeUserId(userId: string): Promise<void> {
  await setSecureItem(STORAGE_KEYS.USER_ID, userId);
}

/**
 * Get stored user ID
 */
export async function getUserId(): Promise<string | null> {
  return await getSecureItem(STORAGE_KEYS.USER_ID);
}
