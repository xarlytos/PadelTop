import axios from 'axios';
import NodeCache from 'node-cache';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const PREMIER_PADEL_CHANNEL_ID = process.env.PREMIER_PADEL_CHANNEL_ID || 'UCkgp8Mf8DbjBoI1_o68__FQ';

const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

export interface YouTubeLiveStream {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
}

function extractCourtFromTitle(title: string): string | null {
  const lower = title.toLowerCase();
  if (lower.includes('centre court') || lower.includes('pista central') || lower.includes('central court')) {
    return 'Pista Central';
  }
  if (lower.includes('court 1') || lower.includes('pista 1')) {
    return 'Pista 1';
  }
  if (lower.includes('court 2') || lower.includes('pista 2')) {
    return 'Pista 2';
  }
  if (lower.includes('court 3') || lower.includes('pista 3')) {
    return 'Pista 3';
  }
  return null;
}

export async function getPremierPadelLiveStreams(): Promise<YouTubeLiveStream[]> {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YOUTUBE_API_KEY no está configurada');
  }

  const cacheKey = `premier_padel_livestreams_${PREMIER_PADEL_CHANNEL_ID}`;
  const cached = cache.get<YouTubeLiveStream[]>(cacheKey);
  if (cached) return cached;

  const url = 'https://www.googleapis.com/youtube/v3/search';
  const { data } = await axios.get(url, {
    params: {
      part: 'snippet',
      channelId: PREMIER_PADEL_CHANNEL_ID,
      eventType: 'live',
      type: 'video',
      maxResults: 10,
      key: YOUTUBE_API_KEY,
    },
    timeout: 10000,
  });

  const items = data.items || [];
  const streams: YouTubeLiveStream[] = items.map((item: any) => ({
    id: item.id?.videoId,
    videoId: item.id?.videoId,
    title: item.snippet?.title || 'En directo',
    thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || '',
    publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
    channelTitle: item.snippet?.channelTitle || 'Premier Padel',
  }));

  // Ordenar: Pista Central primero, luego por número de pista
  streams.sort((a, b) => {
    const courtA = extractCourtFromTitle(a.title) || 'Pista 99';
    const courtB = extractCourtFromTitle(b.title) || 'Pista 99';
    return courtA.localeCompare(courtB);
  });

  cache.set(cacheKey, streams, 60);
  return streams;
}
