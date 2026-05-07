import React, { createContext, useContext, useCallback } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';

type PaywallPlacement =
  | 'premium_upgrade'
  | 'premium_style'
  | 'no_credits'
  | 'campaign_trigger';

interface SuperwallContextType {
  registerPlacement: (placement: PaywallPlacement, params?: Record<string, string>, feature?: () => void) => Promise<void>;
  isNativeAvailable: boolean;
}

const SuperwallContext = createContext<SuperwallContextType | undefined>(undefined);

let NativeSuperwall: {
  SuperwallProvider: React.ComponentType<{ apiKeys: { ios?: string; android?: string }; children: React.ReactNode }>;
  usePlacement: (callbacks?: Record<string, unknown>) => {
    registerPlacement: (args: { placement: string; params?: Record<string, string>; feature?: () => void }) => Promise<void>;
    state: unknown;
  };
} | null = null;

if (Platform.OS !== 'web') {
  try {
    NativeSuperwall = require('expo-superwall');
  } catch {
    NativeSuperwall = null;
  }
}

function NativeSuperwallBridge({ children }: { children: React.ReactNode }) {
  const iosKey = process.env.EXPO_PUBLIC_SUPERWALL_IOS_KEY;
  const androidKey = process.env.EXPO_PUBLIC_SUPERWALL_ANDROID_KEY;
  const Provider = NativeSuperwall?.SuperwallProvider;

  if (!Provider || (!iosKey && !androidKey)) {
    return <>{children}</>;
  }

  return (
    <Provider apiKeys={{ ios: iosKey, android: androidKey }}>
      {children}
    </Provider>
  );
}

function NativePlacementProvider({ children }: { children: React.ReactNode }) {
  const usePlacement = NativeSuperwall?.usePlacement;

  const nativeHook = usePlacement
    ? usePlacement({
        onPresent: (info: unknown) => console.log('[Superwall] Paywall presented:', info),
        onDismiss: (_info: unknown, result: unknown) => console.log('[Superwall] Paywall dismissed:', result),
        onError: (err: string) => console.error('[Superwall] Error:', err),
      })
    : null;

  const registerPlacement = useCallback(
    async (placement: PaywallPlacement, params?: Record<string, string>, feature?: () => void) => {
      if (nativeHook) {
        await nativeHook.registerPlacement({ placement, params, feature });
      }
    },
    [nativeHook],
  );

  return (
    <SuperwallContext.Provider value={{ registerPlacement, isNativeAvailable: !!nativeHook }}>
      {children}
    </SuperwallContext.Provider>
  );
}

function WebFallbackProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const registerPlacement = useCallback(
    async (_placement: PaywallPlacement, _params?: Record<string, string>, feature?: () => void) => {
      router.push('/pricing');
      if (feature) feature();
    },
    [router],
  );

  return (
    <SuperwallContext.Provider value={{ registerPlacement, isNativeAvailable: false }}>
      {children}
    </SuperwallContext.Provider>
  );
}

export function SuperwallProvider({ children }: { children: React.ReactNode }) {
  if (Platform.OS === 'web' || !NativeSuperwall) {
    return <WebFallbackProvider>{children}</WebFallbackProvider>;
  }

  return (
    <NativeSuperwallBridge>
      <NativePlacementProvider>{children}</NativePlacementProvider>
    </NativeSuperwallBridge>
  );
}

export function useSuperwall() {
  const context = useContext(SuperwallContext);
  if (!context) {
    throw new Error('useSuperwall must be used within a SuperwallProvider');
  }
  return context;
}
