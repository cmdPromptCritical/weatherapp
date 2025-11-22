export const WEATHER_LOCATIONS = {
  bowmanville: {
    name: "Bowmanville, ON",
    latitude: 43.9135,
    longitude: -78.6864,
  },
  lindsey: {
    name: "Lindsey, ON",
    latitude: 44.3501,
    longitude: -78.8496,
  },
} as const

export type LocationKey = keyof typeof WEATHER_LOCATIONS
