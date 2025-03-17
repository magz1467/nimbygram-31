
/**
 * Types for coordinate fetching strategies
 */

// Callbacks interface to pass to strategy functions
export type CoordinateCallbacks = {
  setCoordinates: (coords: [number, number]) => void;
  setPostcode: (pc: string | null) => void;
};
