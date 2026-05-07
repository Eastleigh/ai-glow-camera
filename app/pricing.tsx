import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../src/lib/auth';
import { PLANS, type PlanType } from '../src/lib/types';
import { COLORS, SPACING, RADIUS, FONT, GRADIENTS } from '../src/constants/theme';

export default function PricingScreen() {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('premium');
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const currentPlan = user?.plan ?? 'free';

  const handleSubscribe = (plan: PlanType) => {
    if (plan === currentPlan) return;
    if (plan === 'free') return;

    Alert.alert(
      `Subscribe to ${PLANS[plan].name}`,
      `You'll be charged ${PLANS[plan].price}. This will be processed through Stripe/RevenueCat.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: () => {
            Alert.alert('Coming Soon', 'Payment integration will be available in the next update.');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Unlock Your Glow ✨</Text>
        <Text style={styles.subtitle}>
          Choose a plan that works for you
        </Text>

        {/* Plan cards */}
        {(['free', 'premium', 'pro'] as PlanType[]).map((planKey) => {
          const plan = PLANS[planKey];
          const isSelected = selectedPlan === planKey;
          const isCurrent = currentPlan === planKey;
          const isPremiumCard = planKey === 'premium';

          return (
            <TouchableOpacity
              key={planKey}
              onPress={() => setSelectedPlan(planKey)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.planCard,
                  isSelected && styles.planCardSelected,
                  isPremiumCard && styles.planCardPopular,
                ]}
              >
                {isPremiumCard && (
                  <LinearGradient
                    colors={[GRADIENTS.primary[0], GRADIENTS.primary[1]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.popularBadge}
                  >
                    <Text style={styles.popularText}>MOST POPULAR</Text>
                  </LinearGradient>
                )}

                <View style={styles.planHeader}>
                  <View>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                  </View>
                  {isCurrent && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentText}>Current</Text>
                    </View>
                  )}
                </View>

                <View style={styles.featureList}>
                  {plan.features.map((feature, idx) => (
                    <View key={idx} style={styles.featureRow}>
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={COLORS.success}
                      />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}

                  {plan.watermark && (
                    <View style={styles.featureRow}>
                      <Ionicons name="close-circle" size={18} color={COLORS.error} />
                      <Text style={[styles.featureText, styles.featureDisabled]}>
                        Watermark on exports
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Subscribe button */}
        {selectedPlan !== 'free' && selectedPlan !== currentPlan && (
          <TouchableOpacity
            onPress={() => handleSubscribe(selectedPlan)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.subscribeButton}
            >
              <Text style={styles.subscribeText}>
                Subscribe to {PLANS[selectedPlan].name} — {PLANS[selectedPlan].price}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <Text style={styles.disclaimer}>
          Cancel anytime. Subscriptions auto-renew monthly.{'\n'}
          Managed through App Store / Google Play.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl * 2,
  },
  title: {
    fontSize: FONT.sizes.xxxl,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT.sizes.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  planCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardSelected: {
    borderColor: COLORS.primary,
  },
  planCardPopular: {
    overflow: 'hidden',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderBottomLeftRadius: RADIUS.md,
  },
  popularText: {
    color: COLORS.white,
    fontSize: FONT.sizes.xs,
    fontWeight: '800',
    letterSpacing: 1,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  planName: {
    fontSize: FONT.sizes.xl,
    fontWeight: '700',
    color: COLORS.white,
  },
  planPrice: {
    fontSize: FONT.sizes.xxl,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 4,
  },
  currentBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  currentText: {
    color: COLORS.success,
    fontSize: FONT.sizes.xs,
    fontWeight: '700',
  },
  featureList: {
    gap: SPACING.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureText: {
    color: COLORS.textSecondary,
    fontSize: FONT.sizes.md,
  },
  featureDisabled: {
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  subscribeButton: {
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  subscribeText: {
    color: COLORS.white,
    fontSize: FONT.sizes.lg,
    fontWeight: '700',
  },
  disclaimer: {
    color: COLORS.textMuted,
    fontSize: FONT.sizes.xs,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: SPACING.lg,
  },
});
