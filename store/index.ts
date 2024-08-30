import { create } from 'zustand';

import { DriverStore, LocationStore, MarkerData } from '@/types/type';

export const useLocationStore = create<LocationStore>((set) => ({
  userAddress: null,
  userLongitude: null,
  userLatitude: null,

  destinationAddress: null,
  destinationLongitude: null,
  destinationLatitude: null,

  setUserLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    set(() => ({
      userLatitude: latitude,
      userLongitude: longitude,
      userAddress: address,
    }));
  },

  setDestinationLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    set(() => ({
      destinationLatitude: latitude,
      destinationLongitude: longitude,
      destinationAddress: address,
    }));
  },
}));

export const useDriverStore = create<DriverStore>((set) => ({
  drivers: [] as MarkerData[],
  selectedDriver: null,

  setDrivers: (drivers: MarkerData[]) => {
    set(() => ({
      drivers: drivers,
    }));
  },
  setSelectedDriver: (driverId: number) => {
    set(() => ({
      selectedDriver: driverId,
    }));
  },
  clearSelectedDriver: () => {
    set(() => ({
      selectedDriver: null,
    }));
  },
}));
