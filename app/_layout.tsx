import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/lib/auth';
import { SuperwallProvider } from '../src/lib/superwall';
import { COLORS } from '../src/constants/theme';

export default function RootLayout() {
  return (
    <AuthProvider>
      <SuperwallProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.bg },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen
            name="transform"
            options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
          />
          <Stack.Screen
            name="result"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="pricing"
            options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
          />
        </Stack>
      </SuperwallProvider>
    </AuthProvider>
  );
}
