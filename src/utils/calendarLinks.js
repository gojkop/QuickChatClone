// src/utils/calendarLinks.js

/**
 * Generate Google Calendar URL with pre-filled event
 */
export function getGoogleCalendarUrl(question, options = {}) {
  const { scheduledDate, duration = 30 } = options;
  const questionUrl = `${window.location.origin}/expert#question-${question.id}`;

  const startTime = scheduledDate || getDefaultStartTime();
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + duration);
  
  const answerUrl = `${window.location.origin}/expert#question-${question.id}`;
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `💬 mindPick: ${question.title}`,
    dates: `${formatGoogleDate(startTime)}/${formatGoogleDate(endTime)}`,
    details: buildEventDescription(question, answerUrl),
    location: 'mindPick'
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook.com calendar URL
 */
export function getOutlookCalendarUrl(question, options = {}) {
  const { scheduledDate, duration = 30 } = options;
  const questionUrl = `${window.location.origin}/expert#question-${question.id}`;

  const startTime = scheduledDate || getDefaultStartTime();
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + duration);
  
  const answerUrl = `${window.location.origin}/expert#question-${question.id}`;
  
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: `💬 mindPick: ${question.title}`,
    startdt: startTime.toISOString(),
    enddt: endTime.toISOString(),
    body: buildEventDescription(question, answerUrl),
    location: 'mindPick'
  });
  
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate Office 365 calendar URL
 */
export function getOffice365CalendarUrl(question, options = {}) {
  const { scheduledDate, duration = 30 } = options;
  const questionUrl = `${window.location.origin}/expert#question-${question.id}`;

  const startTime = scheduledDate || getDefaultStartTime();
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + duration);
  
  const answerUrl = `${window.location.origin}/expert#question-${question.id}`;
  
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: `💬 mindPick: ${question.title}`,
    startdt: startTime.toISOString(),
    enddt: endTime.toISOString(),
    body: buildEventDescription(question, answerUrl),
    location: 'mindPick'
  });
  
  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate Apple Calendar data URL
 */
export function getAppleCalendarUrl(question, options = {}) {
  const { scheduledDate, duration = 30 } = options;
  const questionUrl = `${window.location.origin}/expert#question-${question.id}`;

  const startTime = scheduledDate || getDefaultStartTime();
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + duration);
  
  const answerUrl = `${window.location.origin}/expert#question-${question.id}`;
  
  const formatICSDate = (date) => {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
  };
  
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//mindPick//EN
BEGIN:VEVENT
DTSTART:${formatICSDate(startTime)}
DTEND:${formatICSDate(endTime)}
SUMMARY:💬 mindPick: ${question.title}
DESCRIPTION:${buildEventDescription(question, answerUrl).replace(/\n/g, '\\n')}
LOCATION:mindPick
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;
  
  return `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;
}

/**
 * Build event description
 */
function buildEventDescription(question, answerUrl) {
  const price = ((question.price_cents || 0) / 100).toFixed(0);
  const from = question.payer_name || 'Anonymous';
  
  let description = `Answer question from ${from}\n\n`;
  
  if (question.text) {
    const preview = question.text.length > 150 
      ? question.text.substring(0, 150) + '...'
      : question.text;
    description += `Preview: ${preview}\n\n`;
  }
  
  description += `💰 Payment: $${price}\n`;
  
  if (question.sla_hours) {
    description += `⏰ Due in ${question.sla_hours} hours\n`;
  }
  
  description += `\n🔗 Click to answer: ${answerUrl}`;
  
  return description;
}

/**
 * Format date for Google Calendar
 */
function formatGoogleDate(date) {
  const pad = (n) => n.toString().padStart(2, '0');
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

/**
 * Get default start time (next hour)
 */
function getDefaultStartTime() {
  const now = new Date();
  now.setHours(now.getHours() + 1, 0, 0, 0);
  return now;
}

/**
 * Detect user's preferred calendar service
 */
export function detectCalendarService() {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/iphone|ipad|ipod|macintosh/.test(userAgent)) {
    return 'apple';
  }
  
  if (/android/.test(userAgent)) {
    return 'google';
  }
  
  return 'google'; // Default
}
