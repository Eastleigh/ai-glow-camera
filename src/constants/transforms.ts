export interface TransformStyle {
  id: string;
  name: string;
  description: string;
  icon: string;
  prompt: string;
  premium: boolean;
  category: 'portrait' | 'lifestyle' | 'creative';
  previewGradient: readonly [string, string];
  estimatedTime: number; // seconds
}

export const TRANSFORM_STYLES: TransformStyle[] = [
  {
    id: 'professional-headshot',
    name: 'Professional Headshot',
    description: 'Studio-quality corporate portrait with perfect lighting',
    icon: '💼',
    prompt: 'Transform this selfie into a professional corporate headshot photo. Studio lighting, clean background, sharp focus, professional attire appearance, LinkedIn-ready portrait. Maintain facial features and likeness.',
    premium: false,
    category: 'portrait',
    previewGradient: ['#1E3A5F', '#4A90D9'],
    estimatedTime: 15,
  },
  {
    id: 'dating-photo',
    name: 'Dating Photo',
    description: 'Attractive, warm portrait perfect for dating profiles',
    icon: '💕',
    prompt: 'Transform this selfie into an attractive dating profile photo. Warm golden hour lighting, natural outdoor setting, genuine smile enhancement, flattering angles, soft bokeh background. Maintain facial features and likeness.',
    premium: false,
    category: 'portrait',
    previewGradient: ['#E91E63', '#FF6F00'],
    estimatedTime: 15,
  },
  {
    id: 'luxury-lifestyle',
    name: 'Luxury Lifestyle',
    description: 'Glamorous portrait with luxury backdrop',
    icon: '✨',
    prompt: 'Transform this selfie into a luxury lifestyle portrait. Elegant setting, designer fashion appearance, premium lighting, high-end aesthetic, magazine-quality composition. Maintain facial features and likeness.',
    premium: false,
    category: 'lifestyle',
    previewGradient: ['#B8860B', '#FFD700'],
    estimatedTime: 18,
  },
  {
    id: 'fitness-glowup',
    name: 'Fitness Glow-Up',
    description: 'Athletic, healthy, energetic transformation',
    icon: '💪',
    prompt: 'Transform this selfie into a fitness-inspired portrait. Athletic appearance, energetic vibe, gym or outdoor fitness setting, healthy glow, motivational fitness photo style. Maintain facial features and likeness.',
    premium: true,
    category: 'lifestyle',
    previewGradient: ['#00C853', '#69F0AE'],
    estimatedTime: 15,
  },
  {
    id: 'influencer-portrait',
    name: 'Influencer Portrait',
    description: 'Instagram-ready influencer aesthetic',
    icon: '📸',
    prompt: 'Transform this selfie into an influencer-style portrait. Perfect Instagram aesthetic, trendy editing, fashionable appearance, social media ready, aspirational lifestyle vibe. Maintain facial features and likeness.',
    premium: false,
    category: 'portrait',
    previewGradient: ['#9C27B0', '#E040FB'],
    estimatedTime: 15,
  },
  {
    id: 'cinematic-portrait',
    name: 'Cinematic Portrait',
    description: 'Movie-quality dramatic portrait',
    icon: '🎬',
    prompt: 'Transform this selfie into a cinematic portrait. Dramatic movie lighting, film grain, Hollywood-quality composition, moody atmosphere, dramatic shadows and highlights. Maintain facial features and likeness.',
    premium: true,
    category: 'creative',
    previewGradient: ['#1A237E', '#7C4DFF'],
    estimatedTime: 20,
  },
  {
    id: 'ai-avatar',
    name: 'AI Avatar',
    description: 'Futuristic digital avatar version of you',
    icon: '🤖',
    prompt: 'Transform this selfie into a futuristic AI avatar. Digital art style, cyberpunk aesthetic, neon accents, sci-fi atmosphere, high-tech portrait. Maintain facial features and likeness but stylize artistically.',
    premium: true,
    category: 'creative',
    previewGradient: ['#00BCD4', '#18FFFF'],
    estimatedTime: 20,
  },
  {
    id: 'before-after-glowup',
    name: 'Before/After Glow-Up',
    description: 'Enhanced best-version-of-you transformation',
    icon: '🔥',
    prompt: 'Transform this selfie into an enhanced glow-up version. Better skin, perfect lighting, enhanced features while keeping natural look, beauty-filter-on-steroids effect, aspirational but realistic. Maintain facial features and likeness.',
    premium: true,
    category: 'portrait',
    previewGradient: ['#FF6F00', '#FF1744'],
    estimatedTime: 15,
  },
];

export const FREE_GENERATIONS = 3;
export const REFERRAL_BONUS_CREDITS = 5;
export const WATERMARK_TEXT = 'Made with AI Glow Camera';
