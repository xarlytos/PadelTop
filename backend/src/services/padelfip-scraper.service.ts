import axios from 'axios';
import * as cheerio from 'cheerio';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

export interface PhaseSchedule {
  phase: string;
  roundName: string;
  date: string;
  startTime: string;
}

const ROUND_MAPPING: Record<string, string> = {
  'qualifying': 'Qualifying',
  '1st round': 'Round of 32',
  'round of 32': 'Round of 32',
  'round of 16': 'Round of 16',
  'quarter-finals': 'Quarter',
  'quarter finals': 'Quarter',
  'semi-finals': 'Semifinals',
  'semi finals': 'Semifinals',
  'final': 'Finals',
};

function normalizeRoundName(phaseText: string): string {
  const lower = phaseText.toLowerCase();
  for (const [key, value] of Object.entries(ROUND_MAPPING)) {
    if (lower.includes(key)) return value;
  }
  return phaseText;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function parseTime(text: string): string | null {
  // Match patterns like "10.00 am", "4.00 pm", "2.00 pm"
  const match = text.match(/(\d{1,2})\.(\d{2})\s*(am|pm)/i);
  if (!match) return null;
  let hour = parseInt(match[1], 10);
  const minute = match[2];
  const period = match[3].toLowerCase();
  if (period === 'pm' && hour !== 12) hour += 12;
  if (period === 'am' && hour === 12) hour = 0;
  return `${hour.toString().padStart(2, '0')}:${minute}`;
}

function extractDateFromLine(line: string, year: number): string | null {
  const monthMap: Record<string, number> = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
    jan: 1, feb: 2, mar: 3, apr: 4, jun: 6,
    jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
  };

  // Pattern: "23 April" or "April 23"
  const patterns = [
    /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)/i,
    /(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{1,2})/i,
  ];

  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match) {
      const day = parseInt(match[1] || match[2], 10);
      const monthStr = (match[2] || match[1]).toLowerCase();
      const month = monthMap[monthStr];
      if (month) {
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      }
    }
  }

  return null;
}

function isPhaseLine(line: string): boolean {
  const lower = line.toLowerCase();
  return lower.includes('qualifying') ||
    lower.includes('main draw') ||
    lower.includes('round of') ||
    lower.includes('quarter') ||
    lower.includes('semi') ||
    lower.includes('final');
}

export async function scrapeTournamentSchedule(tournamentName: string, year: number): Promise<PhaseSchedule[]> {
  const cacheKey = `padelfip_schedule_${slugify(tournamentName)}_${year}`;
  const cached = cache.get<PhaseSchedule[]>(cacheKey);
  if (cached) return cached;

  const slug = slugify(tournamentName);
  const url = `https://www.padelfip.com/events/${slug}/`;

  try {
    const { data: html } = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(html);
    const schedules: PhaseSchedule[] = [];

    // Find the Play Order section - look for overview__listText that contains schedule info
    const scheduleText = $('.overview__listText').filter((_, el) => {
      const text = $(el).text().toLowerCase();
      return text.includes('qualifying') && text.includes('start time');
    }).first().text();

    if (!scheduleText) {
      cache.set(cacheKey, []);
      return [];
    }

    // Parse the text line by line
    const lines = scheduleText.split('\n').map(l => l.trim()).filter(Boolean);

    let currentPhase = '';
    let currentRoundName = '';
    let currentDate: string | null = null;

    for (const line of lines) {
      // Check if this is a phase header
      if (isPhaseLine(line)) {
        currentPhase = line;
        currentRoundName = normalizeRoundName(line);
        currentDate = null; // Reset date for new phase
        continue;
      }

      // Try to extract date from this line
      const lineDate = extractDateFromLine(line, year);
      if (lineDate) {
        currentDate = lineDate;
      }

      // Try to extract time from this line
      const time = parseTime(line);
      if (time && currentDate && currentRoundName) {
        // Avoid duplicates
        const exists = schedules.some(s =>
          s.roundName === currentRoundName && s.date === currentDate && s.startTime === time
        );
        if (!exists) {
          schedules.push({
            phase: currentPhase,
            roundName: currentRoundName,
            date: currentDate,
            startTime: time,
          });
        }
      }
    }

    cache.set(cacheKey, schedules);
    return schedules;
  } catch (err: any) {
    if (err.response?.status === 404) {
      console.warn(`[PadelFIP Scraper] Tournament page not found: ${url}`);
    } else {
      console.warn(`[PadelFIP Scraper] Failed to scrape ${url}:`, err.message);
    }
    return [];
  }
}
