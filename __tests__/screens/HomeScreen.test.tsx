import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../../mobile/screens/HomeScreen'; // Adjust path per tsconfig @/src

// Mocks for HomeScreen deps
jest.mock('@tensorflow/tfjs-react-native', () => ({
  initModel: jest.fn(() => Promise.resolve({ model: 'mocked' })),
  getBiteIndex: jest.fn((features) => Promise.resolve(0.8)), // Good bite
}));
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({ coords: { latitude: 30.2, longitude: -97.7 } })),
}));
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: {} } })) },
  })),
}));
// Mock OpenWeather stub/fetch
const mockOpenWeather = jest.fn(() => Promise.resolve({ main: { temp: 72 }, wind: { speed: 6 } }));
jest.mock('your-openweather-lib', () => ({ getWeather: mockOpenWeather }));
jest.mock('expo-haptics', () => ({ ImpactFeedback: jest.fn() }));

// Mock navigation if used
const mockNavigation = { navigate: jest.fn() };


describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading spinner initially', () => {
    render(<HomeScreen />);
    expect(screen.getByTestId('loading-spinner')).toBeOnTheScreen();
  });

  it('initializes model, fetches location/weather, updates bite index on mount', async () => {
    render(<HomeScreen navigation={mockNavigation} />);

    // Initial loading
    expect(screen.getByTestId('loading-spinner')).toBeOnTheScreen();

    await waitFor(() => {
      expect(screen.getByText(/Bite Index:/)).toBeOnTheScreen();
      expect(screen.getByText('Good')).toBeOnTheScreen(); // Or '0.8'
    });

    expect(initModel).toHaveBeenCalled();
    expect(getCurrentPositionAsync).toHaveBeenCalled();
    expect(mockOpenWeather).toHaveBeenCalled();
    expect(getBiteIndex).toHaveBeenCalledWith(expect.arrayContaining([0.72, 0.863, 0.85, 0.25]));
  });

  it('handles model init error, shows error UI', async () => {
    (initModel as jest.Mock).mockRejectedValueOnce(new Error('Model load fail'));
    render(<HomeScreen />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load model')).toBeOnTheScreen();
    });
  });

  it('refresh button re-runs updateBite with haptics', async () => {
    render(<HomeScreen />);
    await waitFor(() => screen.getByTestId('bite-index'));

    const refreshBtn = screen.getByTestId('refresh-btn');
    fireEvent.press(refreshBtn);

    await waitFor(() => {
      expect(ImpactFeedback).toHaveBeenCalled();
      expect(getBiteIndex).toHaveBeenCalledTimes(2);
    });
  });

  it('navigates to MapScreen on map button press', () => {
    render(<HomeScreen navigation={mockNavigation} />);
    const mapBtn = screen.getByTestId('map-btn');
    fireEvent.press(mapBtn);
    expect(mockNavigation.navigate).toHaveBeenCalledWith('MapScreen');
  });

  it('displays accessibility labels and roles', () => {
    render(<HomeScreen />);
    expect(screen.getByTestId('bite-index')).toBeAccessible();
    expect(screen.getByRole('button', { name: /refresh/i })).toBeOnTheScreen();
  });
});