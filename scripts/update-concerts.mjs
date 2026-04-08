/**
 * Concert Schedule Updater for SuiteKeep Support
 *
 * Scrapes upcoming concerts from fordamphitheater.live and updates
 * assets/2026FordAmp.json with any new shows found.
 *
 * No dependencies required - uses Node.js built-in fetch and fs.
 *
 * Usage: node scripts/update-concerts.mjs
 */

import { readFileSync, writeFileSync, appendFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const JSON_PATH = join(__dirname, '..', 'assets', '2026FordAmp.json');

// Strip fractional seconds from ISO dates — Swift's .iso8601 decoder doesn't support them
function safeISO(date) {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

// --- Scraping ---

async function fetchConcertPage() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch('https://www.fordamphitheater.live/premium-experience/premium-shows/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out after 30 seconds');
    }
    throw err;
  }
}

function parseConcertsFromHTML(html) {
  // Primary strategy: parse JSON-LD structured data embedded in the page.
  // The premium shows page includes schema.org Event objects with accurate
  // artist names and start times — much more reliable than HTML scraping.
  const jsonLdConcerts = parseJsonLd(html);
  if (jsonLdConcerts.length > 0) {
    console.log(`Found ${jsonLdConcerts.length} concert(s) via JSON-LD structured data`);
    return jsonLdConcerts;
  }

  // Fallback: scrape HTML structure (homepage format with <h4><a> blocks)
  console.log('No JSON-LD found, falling back to HTML parsing...');
  const concerts = parseHtmlBlocks(html);
  console.log(`Found ${concerts.length} concert(s) via HTML parsing`);
  return concerts;
}

function parseJsonLd(html) {
  const concerts = [];
  const jsonLdPattern = /<script\s+type="application\/ld\+json"\s*>([\s\S]*?)<\/script>/gi;

  for (const match of html.matchAll(jsonLdPattern)) {
    try {
      const data = JSON.parse(match[1]);
      const events = Array.isArray(data) ? data : [data];

      for (const event of events) {
        if (event['@type'] !== 'Event' || !event.name || !event.startDate) continue;

        const startDate = new Date(event.startDate);
        if (isNaN(startDate.getTime()) || startDate.getFullYear() !== 2026) continue;

        const artist = event.name.replace(/&#038;/g, '&').trim();
        concerts.push({ artist, date: safeISO(startDate) });
      }
    } catch {
      // Skip malformed JSON-LD blocks
    }
  }

  // Deduplicate and sort
  return deduplicateAndSort(concerts);
}

function parseHtmlBlocks(html) {
  const concerts = [];
  const eventBlockPattern = /<h4[^>]*>\s*<a[^>]*>([^<]+)<\/a>\s*<\/h4>([\s\S]*?)(?=<h4|<\/div>\s*<a[^>]*class="buy-tickets")/gi;
  const datePattern = /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s*(\d{4})/i;

  for (const block of html.matchAll(eventBlockPattern)) {
    const artistRaw = block[1].replace(/&#038;/g, '&').trim();
    const detailsRaw = block[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    const dateMatch = detailsRaw.match(datePattern);
    if (!dateMatch) continue;

    const month = dateMatch[1];
    const day = dateMatch[2];
    const year = dateMatch[3];
    if (parseInt(year) !== 2026) continue;

    let hours = 19, minutes = 30;
    const showTimeMatch = detailsRaw.match(/Show\s*Time:?\s*(\d{1,2}):(\d{2})\s*(am|pm)/i);
    const anyTimeMatch = detailsRaw.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
    const timeMatch = showTimeMatch || anyTimeMatch;
    if (timeMatch) {
      hours = parseInt(timeMatch[1]);
      minutes = parseInt(timeMatch[2]);
      if (timeMatch[3].toLowerCase() === 'pm' && hours !== 12) hours += 12;
      else if (timeMatch[3].toLowerCase() === 'am' && hours === 12) hours = 0;
    }

    const monthIndex = monthToIndex(month);
    const utcDate = new Date(Date.UTC(parseInt(year), monthIndex, parseInt(day), hours + 6, minutes));
    concerts.push({ artist: artistRaw, date: safeISO(utcDate) });
  }

  return deduplicateAndSort(concerts);
}

function deduplicateAndSort(concerts) {
  const seen = new Set();
  const deduped = [];
  for (const c of concerts) {
    const key = normalize(c.artist);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(c);
  }
  deduped.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return deduped;
}

// --- Comparison helpers ---

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function fuzzyMatch(a, b) {
  // Match if one contains the first 10 chars of the other
  const prefix = Math.min(10, Math.min(a.length, b.length));
  return a.includes(b.slice(0, prefix)) || b.includes(a.slice(0, prefix));
}

function monthToIndex(month) {
  const months = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  };
  return months[month.toLowerCase()] ?? 0;
}

// --- JSON handling ---

function loadCurrentJSON() {
  const raw = readFileSync(JSON_PATH, 'utf-8');
  return JSON.parse(raw);
}

function makeNewConcertEntry(artist, dateISO, id) {
  const now = safeISO(new Date());
  const seat = {
    status: 'available',
    cost: 25,
    modificationHistory: [],
    lastModifiedDate: now,
    conflictResolutionVersion: 1,
  };

  return {
    sharedVersion: 1,
    seats: Array.from({ length: 8 }, () => ({ ...seat })),
    date: dateISO,
    id,
    parkingTicket: { status: 'available', cost: 0 },
    lastModifiedDate: now,
    artist,
  };
}

function findNewConcerts(scraped, existing) {
  const existingNormalized = existing.map(c => normalize(c.artist));

  return scraped.filter(sc => {
    const norm = normalize(sc.artist);
    return !existingNormalized.some(en => fuzzyMatch(en, norm));
  });
}

// --- Main ---

async function main() {
  console.log('Ford Amphitheater Concert Schedule Updater\n');

  // Fetch and parse
  console.log('Fetching fordamphitheater.live...');
  const html = await fetchConcertPage();
  console.log(`Fetched ${html.length} bytes\n`);

  const scraped = parseConcertsFromHTML(html);
  console.log(`Scraped ${scraped.length} concert(s):`);
  for (const c of scraped) {
    console.log(`  - ${c.artist} (${new Date(c.date).toLocaleDateString()})`);
  }

  // Load current data
  const data = loadCurrentJSON();
  console.log(`\nExisting concerts in JSON: ${data.concerts.length}`);
  for (const c of data.concerts) {
    console.log(`  - ${c.artist}`);
  }

  // Find new concerts
  const newConcerts = findNewConcerts(scraped, data.concerts);

  if (newConcerts.length === 0) {
    console.log('\nNo new concerts found. JSON is up to date.');

    // Write GitHub Actions summary if available
    if (process.env.GITHUB_STEP_SUMMARY) {
      appendFileSync(process.env.GITHUB_STEP_SUMMARY,
        `## Concert Schedule Check\n\nNo new concerts found. Currently tracking ${data.concerts.length} concerts.\n`
      );
    }
    process.exit(0);
  }

  console.log(`\nFound ${newConcerts.length} NEW concert(s):`);

  // Calculate next ID
  let nextId = Math.max(...data.concerts.map(c => c.id)) + 1;

  const addedNames = [];
  for (const nc of newConcerts) {
    console.log(`  + ${nc.artist} (${new Date(nc.date).toLocaleDateString()})`);
    data.concerts.push(makeNewConcertEntry(nc.artist, nc.date, nextId++));
    addedNames.push(nc.artist);
  }

  // Sort concerts by date
  data.concerts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Update backup date
  data.backupDate = safeISO(new Date());

  // Write updated JSON
  writeFileSync(JSON_PATH, JSON.stringify(data, null, 2) + '\n');
  console.log(`\nUpdated ${JSON_PATH}`);
  console.log(`Total concerts: ${data.concerts.length}`);

  // GitHub Actions outputs
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT,
      `new_concerts=true\nconcert_count=${newConcerts.length}\nconcert_names=${addedNames.join(', ')}\n`
    );
  }

  // GitHub Actions step summary
  if (process.env.GITHUB_STEP_SUMMARY) {
    const summary = [
      `## Concert Schedule Updated`,
      ``,
      `Added ${newConcerts.length} new concert(s):`,
      ...addedNames.map(n => `- ${n}`),
      ``,
      `Total concerts now: ${data.concerts.length}`,
    ].join('\n');
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n');
  }

  console.log('\nDone.');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
