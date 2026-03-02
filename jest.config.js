module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/__tests__/jest-setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native(-community)?|expo|@expo|react-navigation|@react-navigation|@rnmapbox|@supabase/supabase-js|@lottie-react-native|react-native-svg|nativewind|reanimated)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.ts',
    'src/**/*.tsx',
    'App.tsx',
    '!src/**/*.d.ts',
    '!**/*.test.*',
    '!**/node_modules/**'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapping: {
    '^@/(.*)': '<rootDir>/src/$1'
  }
};