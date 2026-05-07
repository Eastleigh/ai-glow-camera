export interface User {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  credits: number;
  plan: 'free' | 'premium' | 'pro';
  referral_code: string;
  referred_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Generation {
  id: string;
  user_id: string;
  original_url: string;
  result_url: string | null;
  style_id: string;
  style_name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  credits_used: number;
  processing_time_ms: number | null;
  created_at: string;
  completed_at: string | null;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'purchase' | 'usage' | 'referral' | 'bonus';
  description: string;
  generation_id: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'premium' | 'pro';
  status: 'active' | 'cancelled' | 'past_due' | 'expired';
  stripe_subscription_id: string | null;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
}

export type PlanType = 'free' | 'premium' | 'pro';

export interface PlanDetails {
  name: string;
  price: string;
  priceMonthly: number;
  credits: number | 'unlimited';
  features: string[];
  watermark: boolean;
  hdExport: boolean;
  videoFeatures: boolean;
  commercialUse: boolean;
  priority: boolean;
}

export const PLANS: Record<PlanType, PlanDetails> = {
  free: {
    name: 'Free',
    price: 'Free',
    priceMonthly: 0,
    credits: 3,
    features: ['3 free generations', 'Basic styles', 'Watermarked exports'],
    watermark: true,
    hdExport: false,
    videoFeatures: false,
    commercialUse: false,
    priority: false,
  },
  premium: {
    name: 'Premium',
    price: '$9.99/mo',
    priceMonthly: 9.99,
    credits: 50,
    features: [
      '50 credits/month',
      'All styles unlocked',
      'No watermark',
      'HD exports',
    ],
    watermark: false,
    hdExport: true,
    videoFeatures: false,
    commercialUse: false,
    priority: false,
  },
  pro: {
    name: 'Pro',
    price: '$29/mo',
    priceMonthly: 29,
    credits: 200,
    features: [
      '200 credits/month',
      'All styles + early access',
      'No watermark',
      'HD exports',
      'AI video features',
      'Commercial use license',
      'Priority generation',
    ],
    watermark: false,
    hdExport: true,
    videoFeatures: true,
    commercialUse: true,
    priority: true,
  },
};
