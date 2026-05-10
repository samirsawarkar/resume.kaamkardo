import { NextResponse } from 'next/server';
import axios from 'axios';
import { withAuth } from '@/src/lib/auth-guard';
import { env } from '@/src/config/env';
import { z } from 'zod';
import { AppError } from '@/src/lib/errors';

const schema = z.object({
  q: z.string().min(1, 'Query is required'),
  location: z.string().optional(),
});

export const POST = withAuth(async (req) => {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const { q, location } = parsed.data;

  let data = JSON.stringify({
    q: location ? `${q} jobs in ${location}` : `${q} jobs`,
    num: 50
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://google.serper.dev/search',
    headers: { 
      'X-API-KEY': env.SERPER_API_KEY, 
      'Content-Type': 'application/json'
    },
    data: data
  };

  const response = await axios.request(config);
  return NextResponse.json({ results: response.data.organic || [] });
});
