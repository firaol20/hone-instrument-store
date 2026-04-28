import { Library } from '@googlemaps/js-api-loader';

export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || 'AIzaSyCr9bohuNl3PctSvvnsp1WIbfUeh6PJ1KI';

// Using a static array reference to prevent "LoadScript has been reloaded" performance warnings
export const MAP_LIBRARIES: Library[] = ['marker'];
