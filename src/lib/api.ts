import { supabase } from './supabase';
import { readAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import type { Generation } from './types';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://your-api.supabase.co/functions/v1';

export async function uploadPhoto(uri: string, userId: string): Promise<string> {
  const fileName = `${userId}/${Date.now()}.jpg`;
  const base64 = await readAsStringAsync(uri, {
    encoding: EncodingType.Base64,
  });

  const { data, error } = await supabase.storage
    .from('originals')
    .upload(fileName, decode(base64), {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage
    .from('originals')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function generateTransformation(
  originalUrl: string,
  styleId: string,
  styleName: string,
  userId: string,
  prompt: string
): Promise<Generation> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  const response = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      original_url: originalUrl,
      style_id: styleId,
      style_name: styleName,
      prompt,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Generation failed' }));
    throw new Error(err.message || 'Generation failed');
  }

  return response.json();
}

export async function pollGeneration(generationId: string): Promise<Generation> {
  const { data, error } = await supabase
    .from('generations')
    .select('*')
    .eq('id', generationId)
    .single();

  if (error) throw new Error(`Failed to fetch generation: ${error.message}`);
  return data as Generation;
}

export async function getUserGenerations(userId: string): Promise<Generation[]> {
  const { data, error } = await supabase
    .from('generations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch generations: ${error.message}`);
  return (data || []) as Generation[];
}

export async function getUserCredits(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('users')
    .select('credits')
    .eq('id', userId)
    .single();

  if (error) return 0;
  return data?.credits || 0;
}

export async function applyReferralCode(userId: string, referralCode: string): Promise<boolean> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  const response = await fetch(`${API_BASE}/referral`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ referral_code: referralCode }),
  });

  return response.ok;
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
