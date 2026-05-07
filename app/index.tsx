import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/lib/auth';
import { COLORS, FONT, SPACING } from '../src/constants/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      if (session) {
        router.replace('/(tabs)/camera');
      } else {
        router.replace('/(auth)/login');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [session, loading]);

  return (
    <LinearGradient
      colors={[COLORS.bg, '#1A1A2E', COLORS.primaryDark + '40']}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Text style={styles.logoEmoji}>✨</Text>
        <Text style={styles.logoText}>AI Glow</Text>
        <Text style={styles.logoSubText}>Camera</Text>
      </View>

      <Text style={styles.tagline}>Transform your selfies with AI magic</Text>

      <ActivityIndicator
        size="small"
        color={COLORS.primary}
        style={styles.loader}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logoEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  logoText: {
    fontSize: FONT.sizes.hero,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -1,
  },
  logoSubText: {
    fontSize: FONT.sizes.xxl,
    fontWeight: '300',
    color: COLORS.primaryLight,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: FONT.sizes.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  loader: {
    position: 'absolute',
    bottom: height * 0.12,
  },
});
