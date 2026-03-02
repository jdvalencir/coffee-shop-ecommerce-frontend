import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// React Router v7 needs TextEncoder/TextDecoder which older jsdom doesn't supply
global.TextEncoder = TextEncoder;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.TextDecoder = TextDecoder as any;

// jsdom does not implement window.matchMedia — provide a minimal stub
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
