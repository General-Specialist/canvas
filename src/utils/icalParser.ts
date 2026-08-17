import { GoogleCalendarEvent, GoogleCalendarFeed } from '../types/googleCalendar';

/**
 * Unescape RFC 5545 iCal text values
 */
const unescapeIcalText = (text: string): string => {
  return text
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .trim();
};

/**
 * Parse standard iCal date string (UTC, Floating, or All-Day)
 */
export const parseIcalDate = (dateStr: string, isAllDayDefault = false): { timestamp: number; allDay: boolean } => {
  // Format: 20260817T143000Z or 20260817T143000 or 20260817
  const cleaned = dateStr.trim();

  // All-day date without time (8 digits: YYYYMMDD)
  if (/^\d{8}$/.test(cleaned)) {
    const y = parseInt(cleaned.substring(0, 4), 10);
    const m = parseInt(cleaned.substring(4, 6), 10) - 1;
    const d = parseInt(cleaned.substring(6, 8), 10);
    const date = new Date(y, m, d, 0, 0, 0, 0);
    return { timestamp: date.getTime(), allDay: true };
  }

  // Date with time (YYYYMMDDTHHmmss or YYYYMMDDTHHmmssZ)
  const match = cleaned.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
  if (match) {
    const y = parseInt(match[1], 10);
    const m = parseInt(match[2], 10) - 1;
    const d = parseInt(match[3], 10);
    const hr = parseInt(match[4], 10);
    const min = parseInt(match[5], 10);
    const sec = parseInt(match[6], 10);
    const isUtc = match[7] === 'Z';

    if (isUtc) {
      const date = new Date(Date.UTC(y, m, d, hr, min, sec));
      return { timestamp: date.getTime(), allDay: false };
    } else {
      // Local floating time
      const date = new Date(y, m, d, hr, min, sec);
      return { timestamp: date.getTime(), allDay: false };
    }
  }

  // Fallback to Date.parse
  const fallback = Date.parse(cleaned);
  return {
    timestamp: isNaN(fallback) ? Date.now() : fallback,
    allDay: isAllDayDefault,
  };
};

/**
 * Parses duration string like PT1H30M or P1D
 */
const parseDurationMs = (durStr: string): number => {
  let ms = 0;
  const hourMatch = durStr.match(/(\d+)H/);
  const minMatch = durStr.match(/(\d+)M/);
  const secMatch = durStr.match(/(\d+)S/);
  const dayMatch = durStr.match(/(\d+)D/);

  if (hourMatch) ms += parseInt(hourMatch[1], 10) * 3600 * 1000;
  if (minMatch) ms += parseInt(minMatch[1], 10) * 60 * 1000;
  if (secMatch) ms += parseInt(secMatch[1], 10) * 1000;
  if (dayMatch) ms += parseInt(dayMatch[1], 10) * 86400 * 1000;

  return ms || 3600 * 1000; // default 1 hour
};

interface RawVEvent {
  summary?: string;
  description?: string;
  location?: string;
  dtstart?: string;
  dtstartParams?: string;
  dtend?: string;
  dtendParams?: string;
  duration?: string;
  rrule?: string;
  uid?: string;
  status?: string;
}

const DAY_NAME_TO_INDEX: Record<string, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

/**
 * Expand RRULE occurrences within a window around centerDate (+/- 6 months)
 */
const expandRRule = (
  raw: RawVEvent,
  feed: GoogleCalendarFeed,
  windowStart: number,
  windowEnd: number
): GoogleCalendarEvent[] => {
  const events: GoogleCalendarEvent[] = [];
  if (!raw.dtstart) return events;

  const isAllDayStart = raw.dtstartParams?.includes('VALUE=DATE') || /^\d{8}$/.test(raw.dtstart);
  const { timestamp: startTs, allDay } = parseIcalDate(raw.dtstart, isAllDayStart);

  let durationMs = 3600 * 1000; // 1 hr default
  if (raw.dtend) {
    const endParsed = parseIcalDate(raw.dtend, allDay);
    durationMs = Math.max(0, endParsed.timestamp - startTs);
  } else if (raw.duration) {
    durationMs = parseDurationMs(raw.duration);
  } else if (allDay) {
    durationMs = 24 * 3600 * 1000;
  }

  const rruleParts = (raw.rrule || '').split(';').reduce<Record<string, string>>((acc, part) => {
    const [k, v] = part.split('=');
    if (k && v) acc[k.toUpperCase()] = v;
    return acc;
  }, {});

  const freq = rruleParts['FREQ'];
  const interval = parseInt(rruleParts['INTERVAL'] || '1', 10);
  const count = rruleParts['COUNT'] ? parseInt(rruleParts['COUNT'], 10) : undefined;
  const untilTs = rruleParts['UNTIL'] ? parseIcalDate(rruleParts['UNTIL']).timestamp : undefined;
  const byDays = rruleParts['BYDAY'] ? rruleParts['BYDAY'].split(',').map((d) => d.trim().slice(-2).toUpperCase()) : null;

  const baseDate = new Date(startTs);
  const title = raw.summary ? unescapeIcalText(raw.summary) : 'Untitled Event';
  const description = raw.description ? unescapeIcalText(raw.description) : undefined;
  const location = raw.location ? unescapeIcalText(raw.location) : undefined;
  const baseUid = raw.uid || `event-${Math.random().toString(36).slice(2, 9)}`;

  let occurrenceIndex = 0;
  const maxOccurrences = count || 500;

  // For weekly recurrence with BYDAY (e.g. MO,WE,FR)
  if (freq === 'WEEKLY') {
    const cursor = new Date(baseDate);
    // Align cursor to beginning of the week
    const targetDays = byDays && byDays.length > 0
      ? byDays.map((d) => DAY_NAME_TO_INDEX[d]).filter((d) => d !== undefined)
      : [baseDate.getDay()];

    let currentWeekStart = new Date(cursor);
    currentWeekStart.setDate(cursor.getDate() - cursor.getDay());
    currentWeekStart.setHours(cursor.getHours(), cursor.getMinutes(), cursor.getSeconds(), 0);

    while (occurrenceIndex < maxOccurrences) {
      for (const targetDay of targetDays) {
        const occDate = new Date(currentWeekStart);
        occDate.setDate(currentWeekStart.getDate() + targetDay);
        const occStart = occDate.getTime();

        if (occStart < startTs) continue;
        if (untilTs && occStart > untilTs) return events;
        if (occStart > windowEnd) return events;

        if (occStart >= windowStart && occStart <= windowEnd) {
          events.push({
            id: `${baseUid}_${occStart}`,
            calendarId: feed.id,
            calendarName: feed.name,
            calendarColor: feed.color,
            title,
            description,
            location,
            start: occStart,
            end: occStart + durationMs,
            allDay,
            isRecurring: true,
            rawUid: baseUid,
          });
        }

        occurrenceIndex++;
        if (count && occurrenceIndex >= count) return events;
      }

      currentWeekStart.setDate(currentWeekStart.getDate() + 7 * interval);
      if (currentWeekStart.getTime() > windowEnd && (!untilTs || currentWeekStart.getTime() > untilTs)) {
        break;
      }
    }
  } else if (freq === 'DAILY') {
    const cursor = new Date(baseDate);
    while (occurrenceIndex < maxOccurrences) {
      const occStart = cursor.getTime();
      if (untilTs && occStart > untilTs) break;
      if (occStart > windowEnd) break;

      if (occStart >= windowStart && occStart <= windowEnd) {
        events.push({
          id: `${baseUid}_${occStart}`,
          calendarId: feed.id,
          calendarName: feed.name,
          calendarColor: feed.color,
          title,
          description,
          location,
          start: occStart,
          end: occStart + durationMs,
          allDay,
          isRecurring: true,
          rawUid: baseUid,
        });
      }

      occurrenceIndex++;
      cursor.setDate(cursor.getDate() + interval);
    }
  } else if (freq === 'MONTHLY') {
    const cursor = new Date(baseDate);
    while (occurrenceIndex < maxOccurrences) {
      const occStart = cursor.getTime();
      if (untilTs && occStart > untilTs) break;
      if (occStart > windowEnd) break;

      if (occStart >= windowStart && occStart <= windowEnd) {
        events.push({
          id: `${baseUid}_${occStart}`,
          calendarId: feed.id,
          calendarName: feed.name,
          calendarColor: feed.color,
          title,
          description,
          location,
          start: occStart,
          end: occStart + durationMs,
          allDay,
          isRecurring: true,
          rawUid: baseUid,
        });
      }

      occurrenceIndex++;
      cursor.setMonth(cursor.getMonth() + interval);
    }
  } else if (freq === 'YEARLY') {
    const cursor = new Date(baseDate);
    while (occurrenceIndex < maxOccurrences) {
      const occStart = cursor.getTime();
      if (untilTs && occStart > untilTs) break;
      if (occStart > windowEnd) break;

      if (occStart >= windowStart && occStart <= windowEnd) {
        events.push({
          id: `${baseUid}_${occStart}`,
          calendarId: feed.id,
          calendarName: feed.name,
          calendarColor: feed.color,
          title,
          description,
          location,
          start: occStart,
          end: occStart + durationMs,
          allDay,
          isRecurring: true,
          rawUid: baseUid,
        });
      }

      occurrenceIndex++;
      cursor.setFullYear(cursor.getFullYear() + interval);
    }
  } else {
    // Fallback: single instance
    if (startTs >= windowStart && startTs <= windowEnd) {
      events.push({
        id: `${baseUid}_${startTs}`,
        calendarId: feed.id,
        calendarName: feed.name,
        calendarColor: feed.color,
        title,
        description,
        location,
        start: startTs,
        end: startTs + durationMs,
        allDay,
        isRecurring: true,
        rawUid: baseUid,
      });
    }
  }

  return events;
};

/**
 * Parse an entire iCal (.ics) string into GoogleCalendarEvent list
 */
export const parseIcsContent = (
  icsText: string,
  feed: GoogleCalendarFeed,
  windowDaysPast = 90,
  windowDaysFuture = 365
): GoogleCalendarEvent[] => {
  const now = Date.now();
  const windowStart = now - windowDaysPast * 24 * 3600 * 1000;
  const windowEnd = now + windowDaysFuture * 24 * 3600 * 1000;

  // 1. Unfold lines (RFC 5545: lines ending with CRLF followed by space/tab are folded)
  const cleanText = icsText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rawLines = cleanText.split('\n');
  const unfoldedLines: string[] = [];

  for (const line of rawLines) {
    if (line.startsWith(' ') || line.startsWith('\t')) {
      if (unfoldedLines.length > 0) {
        unfoldedLines[unfoldedLines.length - 1] += line.substring(1);
      }
    } else if (line.trim().length > 0) {
      unfoldedLines.push(line);
    }
  }

  const events: GoogleCalendarEvent[] = [];
  let inVEvent = false;
  let currentEvent: RawVEvent = {};

  for (const line of unfoldedLines) {
    if (line === 'BEGIN:VEVENT') {
      inVEvent = true;
      currentEvent = {};
      continue;
    }

    if (line === 'END:VEVENT') {
      inVEvent = false;
      if (currentEvent.status === 'CANCELLED') {
        continue;
      }

      if (currentEvent.rrule) {
        const recurring = expandRRule(currentEvent, feed, windowStart, windowEnd);
        events.push(...recurring);
      } else if (currentEvent.dtstart) {
        const isAllDay =
          currentEvent.dtstartParams?.includes('VALUE=DATE') ||
          /^\d{8}$/.test(currentEvent.dtstart);
        const { timestamp: startTs, allDay } = parseIcalDate(currentEvent.dtstart, isAllDay);

        let durationMs = 3600 * 1000;
        if (currentEvent.dtend) {
          const endParsed = parseIcalDate(currentEvent.dtend, allDay);
          durationMs = Math.max(0, endParsed.timestamp - startTs);
        } else if (currentEvent.duration) {
          durationMs = parseDurationMs(currentEvent.duration);
        } else if (allDay) {
          durationMs = 24 * 3600 * 1000;
        }

        const endTs = startTs + durationMs;

        // Keep events within window or near current time
        if (endTs >= windowStart && startTs <= windowEnd) {
          const baseUid = currentEvent.uid || `event-${Math.random().toString(36).slice(2, 9)}`;
          events.push({
            id: `${baseUid}_${startTs}`,
            calendarId: feed.id,
            calendarName: feed.name,
            calendarColor: feed.color,
            title: currentEvent.summary ? unescapeIcalText(currentEvent.summary) : 'Untitled Event',
            description: currentEvent.description ? unescapeIcalText(currentEvent.description) : undefined,
            location: currentEvent.location ? unescapeIcalText(currentEvent.location) : undefined,
            start: startTs,
            end: endTs,
            allDay,
            isRecurring: false,
            rawUid: baseUid,
          });
        }
      }
      continue;
    }

    if (!inVEvent) continue;

    // Parse property and value
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const propHeader = line.substring(0, colonIndex);
    const value = line.substring(colonIndex + 1);

    const [propName, ...paramParts] = propHeader.split(';');
    const propUpper = propName.toUpperCase();
    const params = paramParts.join(';');

    switch (propUpper) {
      case 'SUMMARY':
        currentEvent.summary = value;
        break;
      case 'DESCRIPTION':
        currentEvent.description = value;
        break;
      case 'LOCATION':
        currentEvent.location = value;
        break;
      case 'DTSTART':
        currentEvent.dtstart = value;
        currentEvent.dtstartParams = params;
        break;
      case 'DTEND':
        currentEvent.dtend = value;
        currentEvent.dtendParams = params;
        break;
      case 'DURATION':
        currentEvent.duration = value;
        break;
      case 'RRULE':
        currentEvent.rrule = value;
        break;
      case 'UID':
        currentEvent.uid = value;
        break;
      case 'STATUS':
        currentEvent.status = value.toUpperCase();
        break;
    }
  }

  // Sort events chronologically by start time
  return events.sort((a, b) => a.start - b.start);
};
