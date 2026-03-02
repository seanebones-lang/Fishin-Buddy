import React from 'react';
import { render, screen } from '@testing-library/react-native';
import MapScreen from '@/src/screens/MapScreen';

jest.mock('@rnmapbox/maps', () => ({
  MapboxGL: {
    MapView: jest.fn(({ style, children, onRegionChangeComplete }: any) => (
      <mock-MapView 
        data-testid="map-view" 
        style={style} 
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {children}
      </mock-MapView>
    )),
  },
}));

describe('MapScreen (Stub)', () => {
  it('renders stub without crashing', () => {
    render(<MapScreen />);
    expect(screen.queryByText(/todo|map|implement|coming/i)).not.toBeNull();
  });

  it('prepares Mapbox MapView mock (no props leak)', () => {
    render(<MapScreen />);
    expect(screen.queryByTestId('map-view')).toBeNull();
  });

  it('handles accessibility (empty screen reader label)', () => {
    const { accessibilityState } = render(<MapScreen />).toJSON();
    expect(accessibilityState).toBeUndefined();
  });
});