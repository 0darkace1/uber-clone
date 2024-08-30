import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { Link, router } from 'expo-router';
import Modal from 'react-native-modal';

import { icons, images } from '@/constants';
import InputField from '@/components/InputField';
import CustomButton from '@/components/CustomButton';
import OAuth from '@/components/OAuth';
import { fetchAPI } from '@/lib/fetch';

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [verification, setVerification] = useState({
    state: 'default',
    error: '',
    code: '',
  });

  const handleSignUp = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
        firstName: form.name,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      setVerification({ ...verification, state: 'pending' });
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling

      Alert.alert('Error while Sign Up', err.errors[0].longMessage);

      console.error(JSON.stringify(err, null, 2));
    }
  };

  const handleVerifyEmail = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });

      if (completeSignUp.status === 'complete') {
        await fetchAPI('/(api)/user', {
          method: 'POST',
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            clerkId: completeSignUp.createdUserId,
          }),
        });

        await setActive({ session: completeSignUp.createdSessionId });

        setVerification({
          ...verification,
          state: 'success',
        });
      } else {
        setVerification({
          ...verification,
          state: 'failed',
          error: 'Verification failed',
        });

        console.error(JSON.stringify(completeSignUp, null, 2));
      }
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      setVerification({
        ...verification,
        state: 'failed',
        error: err.errors[0].longMessage,
      });

      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView className="flex-1 bg-white">
        <View className="flex-1 bg-white">
          <View className="relative w-full h-[250px]">
            <Image source={images.signUpCar} className="z-0 w-full h-[250px]" />

            <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
              Create your account
            </Text>
          </View>

          <View className="p-5">
            <InputField
              label="Name"
              placeholder="Enter your name"
              icon={icons.person}
              value={form.name}
              onChangeText={(value: string) =>
                setForm({ ...form, name: value })
              }
            />
            <InputField
              label="Email"
              placeholder="Enter your email"
              autoCapitalize="none"
              keyboardType="email-address"
              icon={icons.email}
              value={form.email}
              onChangeText={(value: string) =>
                setForm({ ...form, email: value })
              }
            />
            <InputField
              label="Password"
              placeholder="Enter your password"
              autoCapitalize="none"
              keyboardType="email-address"
              secureTextEntry={true}
              icon={icons.lock}
              value={form.password}
              onChangeText={(value: string) =>
                setForm({ ...form, password: value })
              }
              onSubmitEditing={handleSignUp}
            />

            <CustomButton
              title="Sign Up"
              onPress={handleSignUp}
              className="mt-6"
            />

            <OAuth />

            <Link
              href={'/sign-in'}
              className="text-lg text-center text-general-200 mt-10">
              <Text>Already have an account ? </Text>
              <Text className="text-primary-500">Log In</Text>
            </Link>

            <Modal
              isVisible={verification.state === 'pending'}
              onModalHide={() => {
                // setVerification({ ...verification, state: "success" });
                if (verification.state === 'success') {
                  setShowSuccessModal(true);
                }
              }}>
              <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
                <Text className="text-2xl font-JakartaExtraBold mb-2">
                  Verification
                </Text>
                <Text className="font-Jakarta mb-5">
                  We've sent a verification code to {form.email}
                </Text>

                <InputField
                  label="Code"
                  icon={icons.lock}
                  placeholder="12345"
                  value={verification.code}
                  keyboardType="numeric"
                  onChangeText={(code) =>
                    setVerification({ ...verification, code })
                  }
                  onSubmitEditing={handleVerifyEmail}
                />

                {verification.error && (
                  <Text className="text-red-500 text-sm mt-1">
                    {verification.error}
                  </Text>
                )}

                <CustomButton
                  title="Verify Email"
                  onPress={handleVerifyEmail}
                  className="mt-5 bg-success-500"
                />
              </View>
            </Modal>

            <Modal isVisible={showSuccessModal}>
              <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
                <Image
                  source={images.check}
                  className="w-[100px] h-[100px] mx-auto my-5"
                />

                <Text className="text-3xl font-JakartaBold text-center">
                  Verified
                </Text>
                <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
                  You have successfully verified your account.
                </Text>

                <CustomButton
                  title="Browse Home"
                  onPress={() => {
                    setShowSuccessModal(false);
                    router.push('/(root)/(tabs)/home');
                  }}
                  className="mt-5"
                />
              </View>
            </Modal>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUp;
