import '@testing-library/jest-dom';

window.getOpenmrsSpaBase = jest.fn(() => '/openmrs/spa/');

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
