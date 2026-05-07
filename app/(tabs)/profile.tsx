import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/lib/auth';
import { COLORS, SPACING, RADIUS, FONT, GRADIENTS } from '../../src/constants/theme';
import { PLANS } from '../../src/lib/types';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const plan = user?.plan ?? 'free';
  const planDetails = PLANS[plan];

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleShareReferral = async () => {
    const code = user?.referral_code || 'AIGLOW';
    try {
      await Share.share({
        message: `Try AI Glow Camera! Use my code ${code} for 5 free credits. Download: https://aiglowcamera.app`,
      });
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      {/* User info card */}
      <View style={styles.card}>
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.accent]}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>
              {(user?.display_name || user?.email || 'U')[0].toUpperCase()}
            </Text>
          </LinearGradient>
        </View>
        <Text style={styles.userName}>{user?.display_name || 'Guest User'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'Not signed in'}</Text>
      </View>

      {/* Plan & Credits card */}
      <View style={styles.card}>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user?.credits ?? 3}</Text>
            <Text style={styles.statLabel}>Credits</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: COLORS.gold }]}>
              {planDetails.name}
            </Text>
            <Text style={styles.statLabel}>Plan</Text>
          </View>
        </View>

        {plan === 'free' && (
          <TouchableOpacity onPress={() => router.push('/pricing')} activeOpacity={0.8}>
            <LinearGradient
              colors={[GRADIENTS.premium[0], GRADIENTS.premium[1]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.upgradeButton}
            >
              <Ionicons name="diamond" size={18} color={COLORS.white} />
              <Text style={styles.upgradeText}>Upgrade to Premium</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Referral card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Invite Friends</Text>
        <Text style={styles.cardDescription}>
          Share your referral code and both of you get 5 free credits!
        </Text>
        <View style={styles.referralCodeContainer}>
          <Text style={styles.referralCode}>
            {user?.referral_code || 'SIGN IN'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleShareReferral} activeOpacity={0.8}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.accent]}
            style={styles.shareButton}
          >
            <Ionicons name="share-social" size={18} color={COLORS.white} />
            <Text style={styles.shareText}>Share Code</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Menu items */}
      <View style={styles.card}>
        <MenuItem
          icon="card-outline"
          label="Manage Subscription"
          onPress={() => router.push('/pricing')}
        />
        <MenuItem
          icon="help-circle-outline"
          label="Help & Support"
          onPress={() => {}}
        />
        <MenuItem
          icon="document-text-outline"
          label="Terms of Service"
          onPress={() => {}}
        />
        <MenuItem
          icon="shield-outline"
          label="Privacy Policy"
          onPress={() => {}}
        />
      </View>

      {user && (
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.version}>AI Glow Camera v1.0.0</Text>
    </ScrollView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.menuItem} activeOpacity={0.7}>
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon} size={22} color={COLORS.textSecondary} />
        <Text style={styles.menuItemLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl * 2,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT.sizes.xxl,
    fontWeight: '800',
    color: COLORS.white,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FONT.sizes.xxl,
    fontWeight: '800',
    color: COLORS.white,
  },
  userName: {
    fontSize: FONT.sizes.xl,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: FONT.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT.sizes.xxl,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT.sizes.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.surface,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  upgradeText: {
    color: COLORS.white,
    fontSize: FONT.sizes.md,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: FONT.sizes.lg,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  cardDescription: {
    fontSize: FONT.sizes.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  referralCodeContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    borderStyle: 'dashed',
  },
  referralCode: {
    fontSize: FONT.sizes.xl,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 4,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  shareText: {
    color: COLORS.white,
    fontSize: FONT.sizes.md,
    fontWeight: '700',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  menuItemLabel: {
    fontSize: FONT.sizes.md,
    color: COLORS.white,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    marginTop: SPACING.md,
  },
  signOutText: {
    color: COLORS.error,
    fontSize: FONT.sizes.md,
    fontWeight: '600',
  },
  version: {
    color: COLORS.textMuted,
    fontSize: FONT.sizes.sm,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});
