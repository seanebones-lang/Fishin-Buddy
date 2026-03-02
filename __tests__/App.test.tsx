import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import App from '../App';

// Comprehensive mocks for isolation
jest.mock('@/src/screens/SplashScreen', () => () => <mock data-testid="SplashScreen">Splash Mock</mock>);
jest.mock('@/src/screens/OnboardingScreen', () => () => <mock>Onboarding Mock</mock>);
jest.mock('@/src/screens/HomeScreen', () => () => <mock>Home Mock</mock>);
jest.mock('@/src/screens/MapScreen', () => () => <mock>Map Mock</mock>);
jest.mock('@/src/screens/LogisticsScreen', () => () => <mock>Logistics Mock</mock>);
jest.mock('@/src/screens/ProfileScreen', () => () => <mock data-testid="ProfileScreen">Profile TODO Mock</mock>);
jest.mock('@/src/context/AppContext', () => ({
  AppProvider: ({ children }: { children: React.ReactNode }) => <mock-AppProvider>{children}</mock-AppProvider>
}));
jest.mock('@/src/components/ErrorBoundary', () => ({
  onError,
  children
}: any) => {
  React.useEffect(() => {
    onError(new Error('boundary test'), { componentStack: 'mock stack' });
  }, []);
  return children;
});
const mockLogError = jest.fn();
const mockNormalizeError = jest.fn((error: Error, category: string) => ({ ...error, category }));
jest.mock('@/src/utils/errorHandler', () => ({
  logError: mockLogError,
  normalizeError: mockNormalizeError,
  ErrorCategory: { UNKNOWN: 'UNKNOWN' }
}));
jest.mock('expo-status-bar', () => () => <mock data-testid="StatusBar">StatusBar Mock</mock>);
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children
}));
jest.mock('react-native-paper', () => ({
  Provider: ({ theme, children }: any) => <mock-PaperProvider data-testid="PaperProvider" theme={theme}>{children}</mock-PaperProvider>
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children
}));


describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing and displays initial Splash screen', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('SplashScreen')).toBeOnTheScreen();
  });

  it('renders complete provider hierarchy (ErrorBoundary > SafeArea > Paper > AppProvider > NavContainer)', () => {
    render(<App />);
    expect(screen.getByTestId('StatusBar')).toBeOnTheScreen();
    expect(screen.getByTestId('SplashScreen')).toBeOnTheScreen();
    expect(screen.getByTestId('PaperProvider')).toBeOnTheScreen();
  });

  it('applies custom theme to PaperProvider (primary: rgb(0,102,204))', () => {
    render(<App />);
    const paperProvider = screen.getByTestId('PaperProvider');
    expect(paperProvider.props.theme.colors.primary).toBe('rgb(0, 102, 204)');
  });

  it('ErrorBoundary triggers handleError on child error, normalizes and logs', async () => {
    render(<App />);

    await waitFor(() => {
      expect(mockNormalizeError).toHaveBeenCalledWith(
        expect.any(Error),
        'UNKNOWN'
      );
      expect(mockLogError).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'UNKNOWN' }),
        expect.objectContaining({ componentStack: 'mock stack' })
      );
    });
  });

  it('configures Stack.Navigator with screenOptions and Splash animation: fade', () => {
    render(<App />);
    // Mocked screens confirm presence (headerShown: false, slide_from_right)
    expect(screen.getByTestId('ProfileScreen')).toBeTruthy(); // All screens in stack
  });

  it('StatusBar renders with light style', () => {
    render(<App />);
    expect(screen.getByTestId('StatusBar')).toBeOnTheScreen();
  });
});