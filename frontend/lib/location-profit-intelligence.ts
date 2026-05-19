export type LocationCity = {
  name: string;
  center: {
    lat: number;
    lng: number;
  };
};

export type LocationState = {
  name: string;
  cities: LocationCity[];
};

export type LocationCountry = {
  name: string;
  states: LocationState[];
};

export type ProfitZoneStatus = "high" | "medium" | "low";

export type ProfitZone = {
  id: string;
  name: string;
  center: {
    lat: number;
    lng: number;
  };
  polygon: Array<{
    lat: number;
    lng: number;
  }>;
  populationDensity: number;
  businessDensity: number;
  competitionLevel: number;
  demandEstimate: number;
  profitScore: number;
  status: ProfitZoneStatus;
  recommendation: string;
};

export const LOCATION_DATA: LocationCountry[] = [
  {
    name: "India",
    states: [
      {
        name: "Karnataka",
        cities: [
          { name: "Bengaluru", center: { lat: 12.9716, lng: 77.5946 } },
          { name: "Mysuru", center: { lat: 12.2958, lng: 76.6394 } },
        ],
      },
      {
        name: "Maharashtra",
        cities: [
          { name: "Mumbai", center: { lat: 19.076, lng: 72.8777 } },
          { name: "Pune", center: { lat: 18.5204, lng: 73.8567 } },
        ],
      },
      {
        name: "Delhi",
        cities: [{ name: "New Delhi", center: { lat: 28.6139, lng: 77.209 } }],
      },
    ],
  },
  {
    name: "United States",
    states: [
      {
        name: "California",
        cities: [
          { name: "San Francisco", center: { lat: 37.7749, lng: -122.4194 } },
          { name: "Los Angeles", center: { lat: 34.0522, lng: -118.2437 } },
        ],
      },
      {
        name: "New York",
        cities: [{ name: "New York City", center: { lat: 40.7128, lng: -74.006 } }],
      },
      {
        name: "Texas",
        cities: [
          { name: "Austin", center: { lat: 30.2672, lng: -97.7431 } },
          { name: "Dallas", center: { lat: 32.7767, lng: -96.797 } },
        ],
      },
    ],
  },
  {
    name: "United Kingdom",
    states: [
      {
        name: "England",
        cities: [
          { name: "London", center: { lat: 51.5072, lng: -0.1276 } },
          { name: "Manchester", center: { lat: 53.4808, lng: -2.2426 } },
        ],
      },
    ],
  },
];

export function getDefaultLocation() {
  const country = LOCATION_DATA[0];
  const state = country.states[0];
  const city = state.cities[0];

  return {
    country: country.name,
    state: state.name,
    city: city.name,
    center: city.center,
  };
}

export function findCity(countryName: string, stateName: string, cityName: string): LocationCity {
  const fallback = getDefaultLocation();
  const country = LOCATION_DATA.find((item) => item.name === countryName);
  const state = country?.states.find((item) => item.name === stateName);
  const city = state?.cities.find((item) => item.name === cityName);

  return city ?? { name: fallback.city, center: fallback.center };
}

function hashSeed(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function getStatus(score: number): ProfitZoneStatus {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function getRecommendation(status: ProfitZoneStatus, score: number) {
  if (status === "high") {
    return `Prioritize this zone. Profit score ${score}/100 indicates strong demand with manageable competition.`;
  }
  if (status === "medium") {
    return `Test with a small launch. Profit score ${score}/100 suggests balanced opportunity and competition.`;
  }
  return `Avoid heavy investment first. Profit score ${score}/100 suggests high competition or weaker demand.`;
}

export function analyzeLocationProfit({
  country,
  state,
  city,
  businessType,
}: {
  country: string;
  state: string;
  city: string;
  businessType: string;
}) {
  const selectedCity = findCity(country, state, city);
  const random = seededRandom(hashSeed(`${country}:${state}:${city}:${businessType}`));
  const rows = 5;
  const columns = 6;
  const latSpan = 0.1;
  const lngSpan = 0.12;
  const startLat = selectedCity.center.lat - latSpan / 2;
  const startLng = selectedCity.center.lng - lngSpan / 2;
  const cellLat = latSpan / rows;
  const cellLng = lngSpan / columns;

  const zones: ProfitZone[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const north = startLat + (row + 1) * cellLat;
      const south = startLat + row * cellLat;
      const west = startLng + column * cellLng;
      const east = startLng + (column + 1) * cellLng;
      const center = {
        lat: (north + south) / 2,
        lng: (west + east) / 2,
      };

      const centerBias = 1 - Math.min(1, Math.hypot(row - 2, column - 2.5) / 3.4);
      const populationDensity = Math.round(clamp(42 + centerBias * 38 + random() * 20));
      const businessDensity = Math.round(clamp(28 + centerBias * 48 + random() * 26));
      const competitionLevel = Math.round(clamp(businessDensity * 0.72 + random() * 26));
      const demandEstimate = Math.round(clamp(populationDensity * 0.64 + centerBias * 22 + random() * 28));
      const profitScore = Math.round(clamp(50 + demandEstimate * 0.62 - competitionLevel * 0.42 + random() * 16 - 8));
      const status = getStatus(profitScore);

      zones.push({
        id: `${selectedCity.name}-${row}-${column}`,
        name: `Zone ${String.fromCharCode(65 + row)}${column + 1}`,
        center,
        polygon: [
          { lat: north, lng: west },
          { lat: north, lng: east },
          { lat: south, lng: east },
          { lat: south, lng: west },
        ],
        populationDensity,
        businessDensity,
        competitionLevel,
        demandEstimate,
        profitScore,
        status,
        recommendation: getRecommendation(status, profitScore),
      });
    }
  }

  return {
    center: selectedCity.center,
    city: selectedCity.name,
    country,
    state,
    businessType,
    zones,
  };
}
