import type { GeoPoint } from "@/types";

/**
 * Lightweight geocoding table used by the mock geocoder.
 * A production build would call a geocoding API instead.
 */
export interface CityRecord extends GeoPoint {
  city: string;
  state?: string;
  country: string;
  aliases?: string[];
}

export const CITIES: CityRecord[] = [
  { city: "Fairfax", state: "VA", country: "United States", lat: 38.8462, lng: -77.3064, aliases: ["fairfax county"] },
  { city: "Chantilly", state: "VA", country: "United States", lat: 38.8943, lng: -77.4311 },
  { city: "Centreville", state: "VA", country: "United States", lat: 38.8404, lng: -77.4289 },
  { city: "Herndon", state: "VA", country: "United States", lat: 38.9696, lng: -77.3861 },
  { city: "Reston", state: "VA", country: "United States", lat: 38.9586, lng: -77.357 },
  { city: "Vienna", state: "VA", country: "United States", lat: 38.9012, lng: -77.2653 },
  { city: "Tysons", state: "VA", country: "United States", lat: 38.9187, lng: -77.2311, aliases: ["tysons corner", "mclean"] },
  { city: "Falls Church", state: "VA", country: "United States", lat: 38.8823, lng: -77.1711 },
  { city: "Annandale", state: "VA", country: "United States", lat: 38.8304, lng: -77.1964 },
  { city: "Arlington", state: "VA", country: "United States", lat: 38.8816, lng: -77.091 },
  { city: "Alexandria", state: "VA", country: "United States", lat: 38.8048, lng: -77.0469 },
  { city: "Springfield", state: "VA", country: "United States", lat: 38.7893, lng: -77.1872 },
  { city: "Manassas", state: "VA", country: "United States", lat: 38.7509, lng: -77.4753 },
  { city: "Woodbridge", state: "VA", country: "United States", lat: 38.6582, lng: -77.2497 },
  { city: "Ashburn", state: "VA", country: "United States", lat: 39.0438, lng: -77.4874 },
  { city: "Sterling", state: "VA", country: "United States", lat: 39.0062, lng: -77.4286 },
  { city: "Leesburg", state: "VA", country: "United States", lat: 39.1157, lng: -77.5636 },
  { city: "Richmond", state: "VA", country: "United States", lat: 37.5407, lng: -77.436 },
  { city: "Washington", state: "DC", country: "United States", lat: 38.9072, lng: -77.0369, aliases: ["washington dc", "dc", "washington, d.c.", "d.c."] },
  { city: "Silver Spring", state: "MD", country: "United States", lat: 38.9907, lng: -77.0261 },
  { city: "Bethesda", state: "MD", country: "United States", lat: 38.9847, lng: -77.0947 },
  { city: "Rockville", state: "MD", country: "United States", lat: 39.084, lng: -77.1528 },
  { city: "Gaithersburg", state: "MD", country: "United States", lat: 39.1434, lng: -77.2014 },
  { city: "College Park", state: "MD", country: "United States", lat: 38.9897, lng: -76.9378 },
  { city: "Baltimore", state: "MD", country: "United States", lat: 39.2904, lng: -76.6122 },
  { city: "New York", state: "NY", country: "United States", lat: 40.7128, lng: -74.006, aliases: ["nyc", "new york city", "brooklyn", "queens", "manhattan"] },
  { city: "Jersey City", state: "NJ", country: "United States", lat: 40.7178, lng: -74.0431 },
  { city: "Edison", state: "NJ", country: "United States", lat: 40.5187, lng: -74.4121 },
  { city: "Philadelphia", state: "PA", country: "United States", lat: 39.9526, lng: -75.1652 },
  { city: "Boston", state: "MA", country: "United States", lat: 42.3601, lng: -71.0589 },
  { city: "Atlanta", state: "GA", country: "United States", lat: 33.749, lng: -84.388 },
  { city: "Charlotte", state: "NC", country: "United States", lat: 35.2271, lng: -80.8431 },
  { city: "Miami", state: "FL", country: "United States", lat: 25.7617, lng: -80.1918 },
  { city: "Orlando", state: "FL", country: "United States", lat: 28.5383, lng: -81.3792 },
  { city: "Chicago", state: "IL", country: "United States", lat: 41.8781, lng: -87.6298 },
  { city: "Detroit", state: "MI", country: "United States", lat: 42.3314, lng: -83.0458 },
  { city: "Minneapolis", state: "MN", country: "United States", lat: 44.9778, lng: -93.265 },
  { city: "Houston", state: "TX", country: "United States", lat: 29.7604, lng: -95.3698 },
  { city: "Dallas", state: "TX", country: "United States", lat: 32.7767, lng: -96.797 },
  { city: "Austin", state: "TX", country: "United States", lat: 30.2672, lng: -97.7431 },
  { city: "Denver", state: "CO", country: "United States", lat: 39.7392, lng: -104.9903 },
  { city: "Phoenix", state: "AZ", country: "United States", lat: 33.4484, lng: -112.074 },
  { city: "Los Angeles", state: "CA", country: "United States", lat: 34.0522, lng: -118.2437, aliases: ["la"] },
  { city: "San Diego", state: "CA", country: "United States", lat: 32.7157, lng: -117.1611 },
  { city: "San Jose", state: "CA", country: "United States", lat: 37.3382, lng: -121.8863 },
  { city: "San Francisco", state: "CA", country: "United States", lat: 37.7749, lng: -122.4194, aliases: ["sf"] },
  { city: "Oakland", state: "CA", country: "United States", lat: 37.8044, lng: -122.2712 },
  { city: "Seattle", state: "WA", country: "United States", lat: 47.6062, lng: -122.3321 },
  { city: "Portland", state: "OR", country: "United States", lat: 45.5152, lng: -122.6784 },
  { city: "Toronto", state: "ON", country: "Canada", lat: 43.6532, lng: -79.3832 },
  { city: "Vancouver", state: "BC", country: "Canada", lat: 49.2827, lng: -123.1207 },
  { city: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278 },
];
