import puppeteer from 'puppeteer';
import { BusyEvent } from './calendarScraper';

/**
 * Server-side calendar scraper using Puppeteer
 * This should be run on the backend to avoid CORS issues
 */
export class GoogleCalendarScraper {
  private calendarUrl: string;

  constructor(calendarUrl: string) {
    this.calendarUrl = calendarUrl;
  }

  /**
   * Scrape calendar events using Puppeteer
   */
  async scrapeEvents(): Promise<BusyEvent[]> {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.goto(this.calendarUrl, { waitUntil: 'networkidle2' });

      // Wait for calendar to load
      await page.waitForSelector('[role="grid"]', { timeout: 10000 });

      // Extract busy events from the calendar
      const events = await page.evaluate(() => {
        const busyEvents: BusyEvent[] = [];
        
        // Look for elements containing busy events
        const eventElements = document.querySelectorAll('div[aria-label*="busy"], div[title*="busy"]');
        
        eventElements.forEach(element => {
          const ariaLabel = element.getAttribute('aria-label') || '';
          const textContent = element.textContent || '';
          
          // Extract date and time information
          // Example aria-label: "8:30am to 9:30am, busy, Calendar: My calendar, June 4, 2025"
          const dateMatch = ariaLabel.match(/(\w+\s+\d{1,2},\s+\d{4})/);
          const timeMatch = ariaLabel.match(/(\d{1,2}):?(\d{0,2})(am|pm)\s+to\s+(\d{1,2}):?(\d{0,2})(am|pm)/i);
          
          if (dateMatch && timeMatch) {
            const dateStr = new Date(dateMatch[1]).toISOString().split('T')[0];
            const startTime = convertTo24Hour(timeMatch[1], timeMatch[2] || '00', timeMatch[3]);
            const endTime = convertTo24Hour(timeMatch[4], timeMatch[5] || '00', timeMatch[6]);
            
            busyEvents.push({
              date: dateStr,
              startTime,
              endTime,
              title: 'busy'
            });
          }
        });
        
        return busyEvents;
      });

      return events;
    } catch (error) {
      console.error('Error scraping calendar:', error);
      return [];
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

/**
 * Convert 12-hour time to 24-hour format
 */
function convertTo24Hour(hours: string, minutes: string, period: string): string {
  let hour = parseInt(hours);
  const min = minutes.padStart(2, '0');
  
  if (period.toLowerCase() === 'pm' && hour !== 12) {
    hour += 12;
  } else if (period.toLowerCase() === 'am' && hour === 12) {
    hour = 0;
  }
  
  return `${hour.toString().padStart(2, '0')}:${min}`;
}

/**
 * API endpoint handler for scraping calendar
 */
export async function handleCalendarScrapeRequest(calendarUrl: string): Promise<BusyEvent[]> {
  const scraper = new GoogleCalendarScraper(calendarUrl);
  return await scraper.scrapeEvents();
}

