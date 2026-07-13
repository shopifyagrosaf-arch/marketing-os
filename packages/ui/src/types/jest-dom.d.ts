// Pulls in @testing-library/jest-dom's `expect` matcher augmentation
// (toBeInTheDocument, toHaveTextContent, ...) for every *.spec.tsx under
// src/ — jest/setup.ts also imports it for the actual test run, but that
// file sits outside this package's `include` globs, so `tsc --noEmit`
// wouldn't otherwise see the augmentation.
import '@testing-library/jest-dom';
