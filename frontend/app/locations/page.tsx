'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

// Dynamically import LocationPicker to avoid SSR issues
const LocationPicker = dynamic(
  () => import('@/components/LocationPicker').then((mod) => mod.LocationPicker),
  {
    loading: () => <div className="w-full h-96 bg-gray-200 rounded-lg animate-pulse" />,
    ssr: false,
  }
);

interface StoreLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}

// Sample store locations
const STORE_LOCATIONS: StoreLocation[] = [
  {
    id: '1',
    name: 'Hone-Musical-Instruments - Addis Ababa',
    address: 'Megenagna (Near Marathon Motor)',
    city: 'Addis Ababa',
    state: 'Addis Ababa',
    zip: '1000',
    // Updated to your exact coordinates
    latitude: 9.0198494,
    longitude: 38.8005477,
    phone: '+251 98 261 6263',
    email: 'info@honestore.com',
    hours: {
      monday: '9:00 AM - 7:00 PM',
      tuesday: '9:00 AM - 7:00 PM',
      wednesday: '9:00 AM - 7:00 PM',
      thursday: '9:00 AM - 7:00 PM',
      friday: '9:00 AM - 7:00 PM',
      saturday: '10:00 AM - 5:00 PM',
      sunday: 'Closed',
    },
  },
];

export default function StoreLocations() {
  const [selectedLocation, setSelectedLocation] = useState<StoreLocation | null>(STORE_LOCATIONS[0]);
  const [todayHours, setTodayHours] = useState<string>('');

  useEffect(() => {
    if (selectedLocation) {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const today = days[new Date().getDay()];
      setTodayHours(selectedLocation.hours[today as keyof typeof selectedLocation.hours]);
    }
  }, [selectedLocation]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Store Locations</h1>
          <p className="text-lg text-gray-600">
            Visit one of our showrooms to experience premium instruments in person
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <LocationPicker
                  mode="deliver"
                  onLocationSelect={(c) => console.log('User pinned at:', c)}
                  staticMarkers={[
                    {
                      id: 'hone-showroom',
                      lat: selectedLocation?.latitude || 9.0198494,
                      lng: selectedLocation?.longitude || 38.8005477,
                      label: 'HONE'
                    }
                  ]}
                  style={{ width: '100%', height: '450px', borderRadius: '2rem' }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Location Details */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Store Locations</CardTitle>
                <CardDescription>Select a location to view details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {STORE_LOCATIONS.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => setSelectedLocation(location)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition ${selectedLocation?.id === location.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                        }`}
                    >
                      <div className="font-semibold text-sm">{location.name}</div>
                      <div className="text-xs text-gray-600">{location.city}, {location.state}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedLocation && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedLocation.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Address */}
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-semibold">{selectedLocation.address}</div>
                      <div className="text-gray-600">
                        {selectedLocation.city}, {selectedLocation.state} {selectedLocation.zip}
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex gap-3">
                    <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <a
                      href={`tel:${selectedLocation.phone}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {selectedLocation.phone}
                    </a>
                  </div>

                  {/* Email */}
                  <div className="flex gap-3">
                    <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <a
                      href={`mailto:${selectedLocation.email}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {selectedLocation.email}
                    </a>
                  </div>

                  {/* Hours */}
                  <div className="pt-4 border-t">
                    <div className="flex gap-3 mb-3">
                      <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-sm">Hours Today</div>
                        <div className="text-sm text-gray-600">{todayHours}</div>
                      </div>
                    </div>

                    <details className="text-sm">
                      <summary className="cursor-pointer font-semibold text-blue-600 hover:text-blue-700">
                        View full hours
                      </summary>
                      <div className="mt-2 space-y-1 text-gray-600">
                        <div className="flex justify-between">
                          <span>Monday</span>
                          <span>{selectedLocation.hours.monday}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tuesday</span>
                          <span>{selectedLocation.hours.tuesday}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Wednesday</span>
                          <span>{selectedLocation.hours.wednesday}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Thursday</span>
                          <span>{selectedLocation.hours.thursday}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Friday</span>
                          <span>{selectedLocation.hours.friday}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Saturday</span>
                          <span>{selectedLocation.hours.saturday}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sunday</span>
                          <span>{selectedLocation.hours.sunday}</span>
                        </div>
                      </div>
                    </details>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
