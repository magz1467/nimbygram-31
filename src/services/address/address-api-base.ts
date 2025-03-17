
// Import the centralized API key utility
import { getGoogleMapsApiKey } from "@/utils/api-keys";

// OS API Key has to be accessed differently in browser environment
// This is a workaround for the "process is not defined" error
export const OS_API_KEY = 'ZTEafpzqZzMQXvUiMJFqnkEhdXrLbsLp'; // Default key, should be replaced with env var in production

// Use the correct Google Maps API key from the centralized source
export const GOOGLE_MAPS_API_KEY = getGoogleMapsApiKey();
