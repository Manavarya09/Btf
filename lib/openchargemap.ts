/**
 * Open Charge Map API Integration
 * Provides real EV charger data for Dubai and UAE
 */

const API_KEY = '92fe322a-a75f-4a2c-ad75-9d7a448ab443';
const BASE_URL = 'https://api.openchargemap.io/v3';

export interface OCMCharger {
  id: number;
  uuid: string;
  title: string;
  address: {
    title: string;
    addressLine1: string;
    town: string;
    stateOrProvince: string;
    postcode: string;
    country: {
      isoCode: string;
      title: string;
    };
    latitude: number;
    longitude: number;
  };
  connections: OCMConnection[];
  operatorInfo?: {
    title: string;
    website?: string;
    contactEmail?: string;
    faultReportEmail?: string;
    isPrivateIndividual?: boolean;
  };
  usageType?: {
    title: string;
    isPayAtLocation?: boolean;
    isMembershipRequired?: boolean;
    isAccessKeyRequired?: boolean;
  };
  statusType?: {
    title: string;
    isOperational?: boolean;
    isUserSelectable?: boolean;
  };
  submissionStatus?: {
    title: string;
    isLive?: boolean;
  };
  dateCreated: string;
  dateLastStatusUpdate: string;
  dateLastVerified: string;
  numberOfPoints: number;
  generalComments?: string;
}

export interface OCMConnection {
  id: number;
  connectionType: {
    title: string;
    formalName?: string;
    isDiscontinued?: boolean;
    isObsolete?: boolean;
  };
  powerKW?: number;
  currentType?: {
    title: string;
    description?: string;
  };
  voltage?: number;
  amperage?: number;
  quantity: number;
  statusType?: {
    title: string;
    isOperational?: boolean;
  };
}

/**
 * Convert OCM charger data to our internal format
 */
function convertOCMToInternal(charger: any) {
  console.log('Converting charger:', charger.ID, charger.AddressInfo?.Title);
  
  const converted = {
    id: `ocm-${charger.ID}`,
    latitude: charger.AddressInfo?.Latitude,
    longitude: charger.AddressInfo?.Longitude,
    address: charger.AddressInfo?.AddressLine1 || charger.AddressInfo?.Title,
    district: charger.AddressInfo?.Town || charger.AddressInfo?.StateOrProvince || 'Dubai',
    type: getChargerType(charger.Connections),
    totalSockets: charger.NumberOfPoints || charger.Connections?.length || 1,
    availableSockets: getAvailableSockets(charger),
    powerOutput: getMaxPowerKW(charger.Connections),
    price: getPricingEstimate(charger),
    operator: charger.OperatorInfo?.Title || 'Unknown Operator',
    amenities: getAmenities(charger),
    reliability: getReliabilityScore(charger),
    predictedFreeTime: null, // Would need separate prediction service
  };
  
  console.log('Converted charger:', converted);
  return converted;
}

/**
 * Determine charger type based on connections
 */
function getChargerType(connections: any[]): 'slow' | 'fast' | 'ultra-fast' {
  if (!connections || connections.length === 0) return 'slow';
  
  const maxPower = Math.max(...connections.map(c => c.PowerKW || 0));
  
  if (maxPower >= 100) return 'ultra-fast';
  if (maxPower >= 22) return 'fast';
  return 'slow';
}

/**
 * Get available sockets (OCM doesn't provide real-time availability, so we estimate)
 */
function getAvailableSockets(charger: any): number {
  // OCM doesn't provide real-time availability, so we estimate based on status
  const isOperational = charger.StatusType?.IsOperational !== false;
  const totalPoints = charger.NumberOfPoints || charger.Connections?.length || 1;
  
  // Estimate 60-80% availability for operational chargers
  return isOperational ? Math.ceil(totalPoints * 0.7) : 0;
}

/**
 * Get maximum power output in kW
 */
function getMaxPowerKW(connections: any[]): number {
  if (!connections || connections.length === 0) return 7;
  return Math.max(...connections.map(c => c.PowerKW || 7));
}

/**
 * Estimate pricing based on charger type and operator
 */
function getPricingEstimate(charger: any): number {
  const type = getChargerType(charger.Connections);
  const basePrice = type === 'ultra-fast' ? 2.5 : type === 'fast' ? 1.2 : 0.8;
  
  // Adjust based on operator (some premium operators charge more)
  const operator = charger.OperatorInfo?.Title.toLowerCase() || '';
  const premiumOperators = ['tesla', 'porsche', 'ionity', 'fastned'];
  const multiplier = premiumOperators.some(premium => operator.includes(premium)) ? 1.3 : 1.0;
  
  return +(basePrice * multiplier).toFixed(2);
}

/**
 * Extract amenities from charger data
 */
function getAmenities(charger: any): string[] {
  const amenities = [];
  
  if (charger.UsageType?.IsPayAtLocation) amenities.push('Pay at Location');
  if (charger.GeneralComments?.toLowerCase().includes('wifi')) amenities.push('WiFi');
  if (charger.GeneralComments?.toLowerCase().includes('coffee')) amenities.push('Coffee Shop');
  if (charger.GeneralComments?.toLowerCase().includes('restroom')) amenities.push('Restroom');
  if (charger.GeneralComments?.toLowerCase().includes('shade')) amenities.push('Shaded Parking');
  
  return amenities;
}

/**
 * Calculate reliability score based on verification status
 */
function getReliabilityScore(charger: any): number {
  let score = 70; // Base score
  
  // Boost score if recently verified
  const lastVerified = new Date(charger.DateLastVerified);
  const daysSinceVerified = (Date.now() - lastVerified.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceVerified < 30) score += 15;
  else if (daysSinceVerified < 90) score += 10;
  
  // Boost score if operational
  if (charger.StatusType?.IsOperational) score += 10;
  
  // Boost score if recently updated
  const lastUpdated = new Date(charger.DateLastStatusUpdate);
  const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceUpdate < 7) score += 5;
  
  return Math.min(score, 95);
}

/**
 * Fetch EV chargers from Open Charge Map API
 */
export async function fetchChargersFromOCM(
  latitude: number, 
  longitude: number, 
  radiusKm: number = 10
): Promise<any[]> {
  try {
    const params = new URLSearchParams({
      key: API_KEY,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      distance: radiusKm.toString(),
      distanceunit: 'KM',
      countrycode: 'AE', // UAE
      maxresults: '50',
      verbose: 'false',
      includecomments: 'true',
    });

    const response = await fetch(`${BASE_URL}/poi?${params}`);
    
    if (!response.ok) {
      throw new Error(`OCM API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.error('Unexpected OCM API response format:', data);
      return [];
    }
    
    console.log(`Fetched ${data.length} chargers from OCM`);
    
    // Filter and convert chargers
    console.log('Filtering chargers...');
    const validChargers = data.filter((charger, index) => {
      const hasAddress = charger.AddressInfo?.Latitude && charger.AddressInfo?.Longitude;
      console.log(`Charger ${index}: hasAddress=${hasAddress}, ID=${charger.ID}`);
      return hasAddress;
    });
    
    console.log(`Found ${validChargers.length} valid chargers`);
    const convertedChargers = validChargers.map(convertOCMToInternal);
    
    console.log(`Converted ${convertedChargers.length} chargers`);
    return convertedChargers;
      
  } catch (error) {
    console.error('Error fetching chargers from OCM:', error);
    return [];
  }
}

/**
 * Get charger details by ID
 */
export async function getChargerDetails(chargerId: string): Promise<any | null> {
  try {
    // Extract OCM ID from our internal ID format
    const ocmId = chargerId.replace('ocm-', '');
    
    const params = new URLSearchParams({
      key: API_KEY,
      chargepointid: ocmId,
      verbose: 'true',
    });

    const response = await fetch(`${BASE_URL}/poi?${params}`);
    
    if (!response.ok) {
      throw new Error(`OCM API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }
    
    return convertOCMToInternal(data[0]);
    
  } catch (error) {
    console.error('Error fetching charger details from OCM:', error);
    return null;
  }
}