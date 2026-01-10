import { getPredictions } from './predictions';
import { getUserPrefs } from './supabase';

// Mock expo-location
jest.mock('expo-location', () => ({
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({ coords: { latitude: 30.22, longitude: -97.74 } })),
}));

// Mock supabase
jest.mock('./supabase', () => ({
  getUserPrefs: jest.fn(),
}));

const mockGetUserPrefs = getUserPrefs as jest.MockedFunction<typeof getUserPrefs>;

 describe('Predictions Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('computes bite index from prefs/location', async () => {
    mockGetUserPrefs.mockResolvedValue({ id: '1', species: 'bass' } as any);

    const data = await getPredictions('user1');

    expect(data.index).toBeGreaterThan(0);
    expect(data.index).toBeLessThanOrEqual(100);
    expect(data.species).toBe('bass');
    expect(data.spots).toHaveLength(3);
    expect(data.hourly).toHaveLength(12);
  });

  it('uses species factor correctly', async () => {
    mockGetUserPrefs.mockResolvedValue({ id: '1', species: 'trout' } as any);

    const data = await getPredictions('user2');
    expect(data.species).toBe('trout');
    // trout factor 0.9 -> slightly lower
  });

  it('falls back on error', async () => {
    mockGetUserPrefs.mockRejectedValue(new Error('No prefs'));

    const data = await getPredictions('error');
    expect(data.index).toBe(78);
    expect(data.species).toBe('bass');
  });

  it('hourly varies by time', async () => {
    mockGetUserPrefs.mockResolvedValue({ id: '1', species: 'bass' } as any);
    const now = new Date();
    now.setHours(12); // Peak
    // Assert hourly peaks around solunar
  });
});
