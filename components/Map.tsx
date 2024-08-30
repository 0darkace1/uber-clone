import React, { useEffect, useState } from 'react';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { ActivityIndicator, Text, View } from 'react-native';
import MapViewDirections from 'react-native-maps-directions';

import { icons } from '@/constants';
import { Driver, MarkerData } from '@/types/type';
import { useDriverStore, useLocationStore } from '@/store';
import {
  calculateDriverTimes,
  calculateRegion,
  generateMarkersFromData,
} from '@/lib/map';
import { fetchAPI, useFetch } from '@/lib/fetch';

const Map = () => {
  const {
    userLongitude,
    userLatitude,
    destinationLongitude,
    destinationLatitude,
  } = useLocationStore();
  const { selectedDriver, setDrivers } = useDriverStore();

  const [markers, setMarkers] = useState<MarkerData[]>([]);

  const { data: drivers, loading, error } = useFetch<Driver[]>('/(api)/driver');

  const region = calculateRegion({
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  });

  useEffect(() => {
    if (Array.isArray(drivers)) {
      if (!userLatitude || !userLongitude) {
        return;
      }

      const newMarkers = generateMarkersFromData({
        data: drivers,
        userLatitude,
        userLongitude,
      });

      setMarkers(newMarkers);
    }
  }, [drivers, setMarkers, userLatitude, userLongitude]);

  useEffect(() => {
    if (markers.length > 0 && destinationLatitude && destinationLongitude) {
      calculateDriverTimes({
        markers,
        userLongitude,
        userLatitude,
        destinationLatitude,
        destinationLongitude,
      }).then((drivers) => {
        setDrivers(drivers as MarkerData[]);
      });
    }
  }, [
    setDrivers,
    drivers,
    destinationLatitude,
    destinationLongitude,
    userLatitude,
    userLongitude,
    markers,
  ]);

  if (loading || !userLatitude || !userLongitude) {
    return (
      <View className="flex justify-center items-center w-full">
        <ActivityIndicator size={'small'} color={'#000'} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex justify-center items-center w-full">
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      className="w-full h-full rounded-xl"
      tintColor="black"
      userInterfaceStyle="light"
      showsPointsOfInterest={false}
      showsUserLocation={true}
      mapType="mutedStandard"
      initialRegion={region}>
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          title={marker.title}
          image={
            selectedDriver === marker.id ? icons.selectedMarker : icons.marker
          }
        />
      ))}
      {destinationLatitude && destinationLongitude && (
        <>
          <Marker
            key="destination"
            coordinate={{
              latitude: destinationLatitude,
              longitude: destinationLongitude,
            }}
            title="Destination"
            image={icons.pin}
          />
          <MapViewDirections
            origin={{ latitude: userLatitude, longitude: userLongitude }}
            destination={{
              latitude: destinationLatitude,
              longitude: destinationLongitude,
            }}
            apikey={`${process.env.EXPO_PUBLIC_GOOGLE_API_KEY}`}
            strokeColor="#0286FF"
            strokeWidth={4}
          />
        </>
      )}
    </MapView>
  );
};

export default Map;
