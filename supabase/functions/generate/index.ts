// Supabase Edge Function: AI Image Generation
// This function handles the AI transformation pipeline:
// 1. Validates user auth and credits
// 2. Creates a generation record
// 3. Calls AI API (Replicate/Fal.ai/OpenAI)
// 4. Stores result and updates credits

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');
const FAL_KEY = Deno.env.get('FAL_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateRequest {
  original_url: string;
  style_id: string;
  style_name: string;
  prompt: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ message: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: GenerateRequest = await req.json();

    // Check user plan
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return new Response(JSON.stringify({ message: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Atomically deduct credit (prevents race condition / double-spending)
    const { data: deductResult, error: deductError } = await supabase
      .rpc('deduct_credit', { user_uuid: user.id });

    if (deductError || deductResult === null) {
      return new Response(JSON.stringify({ message: 'Insufficient credits' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create generation record
    const { data: generation, error: genError } = await supabase
      .from('generations')
      .insert({
        user_id: user.id,
        original_url: body.original_url,
        style_id: body.style_id,
        style_name: body.style_name,
        prompt: body.prompt,
        status: 'processing',
        credits_used: 1,
      })
      .select()
      .single();

    if (genError) {
      return new Response(JSON.stringify({ message: 'Failed to create generation' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Credit already deducted atomically above

    // Log credit transaction
    await supabase.from('credit_transactions').insert({
      user_id: user.id,
      amount: -1,
      type: 'usage',
      description: `AI transformation: ${body.style_name}`,
      generation_id: generation.id,
    });

    const startTime = Date.now();
    let resultUrl: string | null = null;
    let aiProvider = 'none';

    // Try AI providers in order of preference
    if (REPLICATE_API_TOKEN) {
      try {
        resultUrl = await generateWithReplicate(body.original_url, body.prompt);
        aiProvider = 'replicate';
      } catch (err) {
        console.error('Replicate failed:', err);
      }
    }

    if (!resultUrl && FAL_KEY) {
      try {
        resultUrl = await generateWithFal(body.original_url, body.prompt);
        aiProvider = 'fal';
      } catch (err) {
        console.error('Fal.ai failed:', err);
      }
    }

    if (!resultUrl && OPENAI_API_KEY) {
      try {
        resultUrl = await generateWithOpenAI(body.original_url, body.prompt);
        aiProvider = 'openai';
      } catch (err) {
        console.error('OpenAI failed:', err);
      }
    }

    const processingTime = Date.now() - startTime;

    if (resultUrl) {
      // Upload to Supabase Storage
      const storedUrl = await storeResult(supabase, resultUrl, user.id, generation.id);

      await supabase
        .from('generations')
        .update({
          result_url: storedUrl || resultUrl,
          status: 'completed',
          processing_time_ms: processingTime,
          ai_provider: aiProvider,
          completed_at: new Date().toISOString(),
        })
        .eq('id', generation.id);

      const { data: updatedGen } = await supabase
        .from('generations')
        .select()
        .eq('id', generation.id)
        .single();

      return new Response(JSON.stringify(updatedGen), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Atomically refund credit on failure
      await supabase.rpc('refund_credit', { user_uuid: user.id });

      await supabase
        .from('generations')
        .update({
          status: 'failed',
          error_message: 'No AI provider available or all providers failed',
          processing_time_ms: processingTime,
        })
        .eq('id', generation.id);

      return new Response(
        JSON.stringify({ message: 'AI generation failed. Credit refunded.', ...generation, status: 'failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (err) {
    console.error('Unhandled error:', err);
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateWithReplicate(imageUrl: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'a07f252abbbd832009640b27f063ea52d87d7a23a185ca165bec23b5b6f15a1',
      input: {
        image: imageUrl,
        prompt: prompt,
        num_inference_steps: 30,
        guidance_scale: 7.5,
        strength: 0.65,
      },
    }),
  });

  const prediction = await response.json();

  // Poll for result
  let result = prediction;
  while (result.status === 'starting' || result.status === 'processing') {
    await new Promise((r) => setTimeout(r, 2000));
    const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
      headers: { 'Authorization': `Token ${REPLICATE_API_TOKEN}` },
    });
    result = await pollResponse.json();
  }

  if (result.status === 'succeeded' && result.output) {
    const output = Array.isArray(result.output) ? result.output[0] : result.output;
    return output;
  }

  throw new Error(`Replicate failed: ${result.error || 'Unknown error'}`);
}

async function generateWithFal(imageUrl: string, prompt: string): Promise<string> {
  const response = await fetch('https://fal.run/fal-ai/flux/dev/image-to-image', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: imageUrl,
      prompt: prompt,
      strength: 0.65,
      num_inference_steps: 28,
      guidance_scale: 7.5,
    }),
  });

  const result = await response.json();
  if (result.images && result.images[0]) {
    return result.images[0].url;
  }

  throw new Error('Fal.ai returned no images');
}

async function generateWithOpenAI(imageUrl: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
    }),
  });

  const result = await response.json();
  if (result.data && result.data[0]) {
    return result.data[0].url;
  }

  throw new Error('OpenAI returned no images');
}

async function storeResult(
  supabase: ReturnType<typeof createClient>,
  imageUrl: string,
  userId: string,
  generationId: string
): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const fileName = `${userId}/${generationId}.jpg`;
    const { data, error } = await supabase.storage
      .from('generations')
      .upload(fileName, uint8Array, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('Storage upload failed:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('generations')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (err) {
    console.error('Failed to store result:', err);
    return null;
  }
}
