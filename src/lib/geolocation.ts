interface GeolocationResponse {
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  timezone?: string;
  error?: string;
}

// Restricted countries/regions (add more as needed)
const RESTRICTED_REGIONS = [
  'US', // United States
  'CN', // China
  'KP', // North Korea
  'IR', // Iran
  'SY', // Syria
  'MM', // Myanmar
  'CU', // Cuba
  'SD', // Sudan
  // Add more ISO country codes as needed
];

export async function getUserLocation(): Promise<GeolocationResponse> {
  try {
    // Using multiple fallback services for reliability
    const services = [
      'https://ipapi.co/json/',
      'https://api.ipgeolocation.io/ipgeo?apiKey=free',
      'https://ipinfo.io/json',
      'https://api.country.is/',
    ];

    for (const service of services) {
      try {
        const response = await fetch(service, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          // Normalize response based on service
          const normalizedData: GeolocationResponse = {
            country: data.country || data.country_name,
            countryCode: data.country_code || data.countryCode || data.country,
            region: data.region || data.region_name,
            city: data.city,
            timezone: data.timezone,
          };

          return normalizedData;
        }
      } catch (error) {
        console.warn(`Geolocation service failed: ${service}`, error);
        continue;
      }
    }

    throw new Error('All geolocation services failed');
  } catch (error) {
    console.error('Error getting user location:', error);
    return { error: 'Failed to determine location' };
  }
}

export function isRegionRestricted(countryCode?: string): boolean {
  // Allow bypass for testing/admin
  if (typeof window !== 'undefined' && localStorage.getItem('bypass-region-restriction')) {
    return false;
  }
  
  if (!countryCode) return false;
  return RESTRICTED_REGIONS.includes(countryCode.toUpperCase());
}

export function getRestrictionMessage(countryCode?: string): string {
  const messages: Record<string, string> = {
    'US': 'Due to regulatory requirements, ChimeraAI is not available in the United States.',
    'CN': 'ChimeraAI is not available in China due to local regulations.',
    'default': 'ChimeraAI is not available in your region due to regulatory restrictions.'
  };

  return messages[countryCode?.toUpperCase() || 'default'] || messages.default;
}

// For testing purposes
export function bypassRegionRestriction() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('bypass-region-restriction', 'true');
    window.location.reload();
  }
}