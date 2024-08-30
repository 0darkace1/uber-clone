import {
  Text,
  SafeAreaView,
  FlatList,
  View,
  Image,
  ActivityIndicator,
} from 'react-native';
import React from 'react';
import { useUser } from '@clerk/clerk-expo';

import { Ride } from '@/types/type';
import { images } from '@/constants';
import { useFetch } from '@/lib/fetch';
import RideCard from '@/components/RideCard';

const Rides = () => {
  const { user } = useUser();

  const { data: recentRides, loading } = useFetch<Ride[]>(
    `/(api)/ride/${user?.id}`,
  );

  return (
    <SafeAreaView>
      <FlatList
        data={recentRides}
        renderItem={({ item }) => <RideCard ride={item} />}
        className="px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center">
            {!loading ? (
              <>
                <Image
                  source={images.noResult}
                  className="w-40 h-40"
                  alt="No recent rides found"
                  resizeMode="contain"
                />
                <Text className="text-sm">No recent rides found</Text>
              </>
            ) : (
              <ActivityIndicator size={'small'} color={'#000'} />
            )}
          </View>
        )}
        ListHeaderComponent={() => (
          <>
            <Text className="text-xl font-JakartaBold my-5">Your Rides</Text>
          </>
        )}
      />
    </SafeAreaView>
  );
};

export default Rides;
