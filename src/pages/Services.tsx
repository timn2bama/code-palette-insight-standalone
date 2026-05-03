import { useState, useEffect } from "react";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { useLocalServices } from "@/hooks/useLocalServices";
import { useSavedServices } from "@/hooks/useSavedServices";
import { logger } from "@/utils/logger";

const Services = () => {
  const [searchLocation, setSearchLocation] = useState("San Francisco, CA");
  const [currentLocation, setCurrentLocation] = useState("San Francisco, CA");
  const [locationLoading, setLocationLoading] = useState(false);
  const { toast } = useToast();
  const { isServiceSaved, toggleSaveService } = useSavedServices();

  // Function to detect if a string contains coordinates
  const isCoordinateString = (location: string): boolean => {
    const coordPattern = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
    return coordPattern.test(location.trim());
  };

  // Function to geocode coordinates to city name
  const geocodeCoordinates = async (location: string): Promise<string> => {
    if (!isCoordinateString(location)) {
      return location; // Already a city name
    }

    const [lat, lng] = location.split(',').map(coord => parseFloat(coord.trim()));
    
    try {
      logger.info(`🌍 Geocoding coordinates: ${lat}, ${lng}`);
      
      // Try BigDataCloud first (more reliable and no CORS issues)
      const bdcResponse = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      
      if (bdcResponse.ok) {
        const bdcData = await bdcResponse.json();
        logger.info('🌍 BigDataCloud response:', bdcData);
        
        const city = bdcData.city || bdcData.locality;
        const state = bdcData.principalSubdivision;
        const country = bdcData.countryName;
        
        if (city && state && country === 'United States') {
          const result = `${city}, ${state}`;
          logger.info(`✅ Geocoded to: ${result}`);
          return result;
        } else if (city && state) {
          const result = `${city}, ${state}`;
          logger.info(`✅ Geocoded to: ${result}`);
          return result;
        } else if (city) {
          logger.info(`✅ Geocoded to: ${city}`);
          return city;
        }
      }
      
      // Fallback: Try a simpler approach with ipapi.co (works well for general location)
      try {
        logger.info('🌍 Trying alternative geocoding...');
        const response = await fetch(`https://ipapi.co/json/`);
        if (response.ok) {
          const data = await response.json();
          if (data.city && data.region) {
            const result = `${data.city}, ${data.region}`;
            logger.info(`✅ Fallback geocoded to: ${result}`);
            return result;
          }
        }
      } catch (fallbackError) {
        logger.info('⚠️ Fallback geocoding failed:', fallbackError);
      }
      
    } catch (error) {
      logger.error('❌ Geocoding failed:', error);
    }
    
    // Return formatted coordinates as final fallback
    logger.info(`⚠️ Using coordinates as fallback: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };
  
  const { data, loading, error, refetch } = useLocalServices({
    location: currentLocation
  });

  // Auto-geocode coordinates when component loads
  useEffect(() => {
    const autoGeocodeLocation = async () => {
      if (isCoordinateString(currentLocation)) {
        logger.info('Auto-geocoding coordinates on load:', currentLocation);
        const geocodedLocation = await geocodeCoordinates(currentLocation);
        if (geocodedLocation !== currentLocation) {
          setCurrentLocation(geocodedLocation);
          setSearchLocation(geocodedLocation);
        }
      }
    };

    autoGeocodeLocation();
  }, []); // Only run on initial load

  const handleSearch = async () => {
    // Try to geocode if it looks like coordinates
    const locationToUse = await geocodeCoordinates(searchLocation);
    setCurrentLocation(locationToUse);
    setSearchLocation(locationToUse);
    refetch();
  };

  const getCurrentLocation = () => {
    logger.info('📍 getCurrentLocation called');
    setLocationLoading(true);
    
    if (!navigator.geolocation) {
      logger.error('❌ Geolocation not supported');
      toast({
        title: "Error",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      });
      setLocationLoading(false);
      return;
    }

    logger.info('🔍 Requesting current position...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        logger.info(`✅ Got coordinates: ${latitude}, ${longitude}`);
        
        try {
          // Use the same geocoding function we created earlier
          const locationName = await geocodeCoordinates(`${latitude}, ${longitude}`);
          logger.info('📍 Geocoded location:', locationName);
          
          setSearchLocation(locationName);
          setCurrentLocation(locationName);
          
          toast({
            title: "Location Found!",
            description: `Using your current location: ${locationName}`,
          });
          
        } catch (error) {
          logger.error('❌ Geocoding failed:', error);
          // Fallback to coordinates with better formatting
          const coordsLocation = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setSearchLocation(coordsLocation);
          setCurrentLocation(coordsLocation);
          
          toast({
            title: "Location Found",
            description: "Using coordinates (city name lookup failed)",
          });
        }
        
        setLocationLoading(false);
      },
      (error) => {
        logger.error('❌ Geolocation error:', error);
        let errorMessage = "Unable to retrieve your location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions in your browser.";
            logger.error('Permission denied for location access');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            logger.error('Position unavailable');
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            logger.error('Location request timeout');
            break;
          default:
            logger.error('Unknown geolocation error:', error.message);
        }
        
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout
        maximumAge: 300000 // 5 minutes cache
      }
    );
  };

  const openDirections = (service: any) => {
    logger.info('🗺️ Opening directions for:', service);
    const address = service.address || service.name;
    const encodedAddress = encodeURIComponent(address);
    
    // Create maps URL that works on all platforms
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    logger.info('🗺️ Maps URL:', mapsUrl);
    
    // Try to open in new tab/window
    const result = window.open(mapsUrl, '_blank');
    
    // If popup blocked, offer alternative
    if (!result || result.closed || typeof result.closed === 'undefined') {
      logger.warn('⚠️ Popup blocked, offering alternatives');
      
      // Try to copy URL to clipboard as fallback
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(mapsUrl).then(() => {
          toast({
            title: "Directions Link Copied",
            description: "The Google Maps link has been copied to your clipboard. Paste it in a new tab to open directions.",
          });
        }).catch(() => {
          // Final fallback - open in same tab
          window.location.href = mapsUrl;
        });
      } else {
        // No clipboard support, open in same tab
        window.location.href = mapsUrl;
      }
    }
  };

  const getPriceColor = (price: string) => {
    switch (price) {
      case "$": return "text-green-600";
      case "$$": return "text-yellow-600";
      case "$$$": return "text-orange-600";
      case "$$$$": return "text-red-600";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Local Services</h1>
          <p className="text-muted-foreground">Find trusted cleaners, tailors, and garment care services nearby</p>
        </div>

        {/* Search Section */}
        <Card className="shadow-elegant mb-8 bg-gradient-accent">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Search Location
                </label>
                <div className="flex gap-2">
                  <Input 
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="Enter your location..."
                    className="bg-background/50 flex-1"
                  />
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                    className="px-4"
                    title="Use current GPS location"
                  >
                    {locationLoading ? "📡" : "📍"}
                  </Button>
                </div>
              </div>
              <Button 
                variant="premium" 
                size="lg" 
                className="px-8"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? "Searching..." : "🔍 Find Services"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="space-y-8">
            {[...Array(3)].map((_, categoryIndex) => (
              <div key={categoryIndex} className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} className="shadow-card">
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="shadow-card">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Services</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button variant="outline" onClick={refetch}>
                🔄 Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Services by Category */}
        {!loading && !error && data && (
          <div className="space-y-8">
            {data.categories.map((category) => {
              const categoryServices = data.servicesByCategory[category.id] || [];
              
              if (categoryServices.length === 0) return null;
              
              return (
                <div key={category.id} className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{category.icon}</span>
                    <h2 className="text-2xl font-bold text-primary">{category.name}</h2>
                    <Badge variant="secondary" className="ml-2">
                      {categoryServices.length} found
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {categoryServices.map((service) => (
                      <Card key={service.id} className="shadow-card hover:shadow-elegant transition-all duration-300">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{service.name}</CardTitle>
                              <p className="text-sm text-muted-foreground">{service.address}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 mb-1">
                                <span className="text-fashion-gold">⭐</span>
                                <span className="font-semibold">{service.rating}</span>
                              </div>
                              <span className={`font-bold ${getPriceColor(service.price)}`}>
                                {service.price}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {/* Distance and Contact */}
                            <div className="flex justify-between items-center">
                              <Badge variant="outline" className="text-xs">
                                📍 {service.distance}
                              </Badge>
                              <a 
                                href={`tel:${service.phone}`}
                                className="text-sm text-primary hover:text-accent transition-colors"
                              >
                                {service.phone}
                              </a>
                            </div>

                            {/* Services Offered */}
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">Services</h4>
                              <div className="flex flex-wrap gap-1">
                                {service.services.map((serviceItem, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {serviceItem}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Specialties */}
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">Specialties</h4>
                              <div className="flex flex-wrap gap-1">
                                {service.specialties.map((specialty, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {specialty}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Hours */}
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Hours</h4>
                              <p className="text-sm text-foreground">{service.hours}</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2">
                              <Button 
                                variant="gold" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => openDirections(service)}
                              >
                                🗺️ Directions
                              </Button>
                              <Button 
                                variant={isServiceSaved(service.name, service.address || '') ? "default" : "premium"} 
                                size="sm" 
                                className="flex-1"
                                onClick={() => toggleSaveService(service)}
                              >
                                {isServiceSaved(service.name, service.address || '') ? (
                                  <>
                                    <Heart className="w-4 h-4 mr-1 fill-current" />
                                    Saved
                                  </>
                                ) : (
                                  <>
                                    <Star className="w-4 h-4 mr-1" />
                                    Save
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {/* No Services Found */}
            {data.categories.every(cat => (data.servicesByCategory[cat.id] || []).length === 0) && (
              <Card className="shadow-card">
                <CardContent className="p-8 text-center">
                  <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Services Found</h3>
                  <p className="text-muted-foreground mb-4">
                    We couldn't find any services in your area. Try searching a different location.
                  </p>
                  <Button variant="outline" onClick={refetch}>
                    🔄 Try Again
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Add Service CTA */}
        <div className="text-center mt-8">
          <Card className="shadow-card bg-secondary/30">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-primary mb-2">Can't find what you're looking for?</h3>
              <p className="text-muted-foreground mb-4">
                Help us improve by suggesting a service in your area.
              </p>
              <Button variant="premium" size="lg">
                Suggest a Service
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Services;