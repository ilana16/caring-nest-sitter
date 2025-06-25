import ICAL from 'ical.js';
import { BusyEvent } from './calendarScraper';

// Define TimeSlot type, used by BookingForm and TimeSlotSelector
export interface TimeSlot {
  time: string; // e.g., "09:00"
  available: boolean;
  duration?: number; // Duration in minutes for this slot
}

/**
 * Business hours configuration for Jerusalem, Israel timezone
 * Sunday-Thursday 7:30-23:30
 */
export const BUSINESS_HOURS = {
  // Days of week: 0=Sunday, 1=Monday, ..., 6=Saturday
  workingDays: [0, 1, 2, 3, 4], // Sunday through Thursday
  startHour: 7,
  startMinute: 30,
  endHour: 23,
  endMinute: 30
};

/**
 * Fetches an ICS file from the given URL and parses it into an array of ICAL.Event objects.
 * @param url The URL of the ICS file.
 * @returns A promise that resolves to an array of ICAL.Event objects.
 */
export async function fetchAndParseICS(url: string): Promise<ICAL.Event[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ICS file: ${response.statusText}`);
    }
    const icsData = await response.text();
    const jcalData = ICAL.parse(icsData);
    const vcalendar = new ICAL.Component(jcalData);
    const veventsComponents = vcalendar.getAllSubcomponents('vevent');

    const events: ICAL.Event[] = veventsComponents.map((veventComponent: any) => {
      return new ICAL.Event(veventComponent);
    });
    return events;
  } catch (error) {
    console.error('Error fetching or parsing ICS data:', error);
    return []; 
  }
}

/**
 * Fetches busy events from Google Calendar ICS feed via backend proxy
 */
export async function fetchBusyEvents(calendarUrl: string): Promise<BusyEvent[]> {
  try {
    // Use backend proxy to avoid CORS issues
    const backendUrl = 'https://5001-ioh40819ng3kwlicduoa7-df129213.manusvm.computer/api/get-calendar-events';
    
    // Fetch ICS data from backend proxy
    const response = await fetch(backendUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch calendar data: ${response.statusText}`);
    }
    
    const icsData = await response.text();
    console.log("Fetched ICS data length:", icsData.length); // Add logging
    
    // Parse ICS data
    const jcalData = ICAL.parse(icsData);
    const vcalendar = new ICAL.Component(jcalData);
    const veventsComponents = vcalendar.getAllSubcomponents('vevent');

    const icsEvents: ICAL.Event[] = veventsComponents.map((veventComponent: any) => {
      return new ICAL.Event(veventComponent);
    });
    
    console.log("Fetched ICS Events:", icsEvents); // Add logging
    
    // Convert ICAL events to our BusyEvent format
    const busyEvents: BusyEvent[] = icsEvents.map(event => {
      const startDate = event.startDate.toJSDate();
      const endDate = event.endDate.toJSDate();
      
      return {
        date: startDate.toISOString().split("T")[0],
        startTime: formatTime(startDate),
        endTime: formatTime(endDate),
        title: event.summary || "busy"
      };
    });
    console.log("Converted Busy Events:", busyEvents); // Add logging
    
    return busyEvents;
    
  } catch (error) {
    console.error('Error fetching busy events:', error);
    
    // Fallback to mock data for testing if API fails
    console.log('Falling back to mock data for testing');
    const today = new Date();
    const mockEvents: BusyEvent[] = [];
    
    // Generate some test events for the next few days
    for (let i = 0; i < 7; i++) {
      const eventDate = new Date(today);
      eventDate.setDate(today.getDate() + i);
      
      // Skip weekends for business hours
      if (eventDate.getDay() === 5 || eventDate.getDay() === 6) continue;
      
      mockEvents.push(
        {
          date: eventDate.toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '10:00',
          title: 'busy'
        },
        {
          date: eventDate.toISOString().split('T')[0],
          startTime: '14:00',
          endTime: '15:30',
          title: 'busy'
        }
      );
    }
    
    return mockEvents;
  }
}

/**
 * Convert Google Calendar embed URL to ICS feed URL
 */
function convertEmbedUrlToIcs(embedUrl: string): string {
  try {
    const url = new URL(embedUrl);
    const src = url.searchParams.get('src');
    
    if (!src) {
      throw new Error('No src parameter found in embed URL');
    }
    
    // Decode the email address
    const email = decodeURIComponent(src);
    
    // Convert to ICS format
    return `https://calendar.google.com/calendar/ical/${encodeURIComponent(email)}/public/basic.ics`;
  } catch (error) {
    console.error('Error converting embed URL to ICS:', error);
    // Fallback to a direct conversion
    const email = 'ilana.cunningham16@gmail.com';
    return `https://calendar.google.com/calendar/ical/${encodeURIComponent(email)}/public/basic.ics`;
  }
}

// Helper to format a Date object to HH:MM string
function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Checks if a given date/time falls within business hours
 */
export function isWithinBusinessHours(date: Date): boolean {
  const dayOfWeek = date.getDay();
  const hour = date.getHours();
  const minute = date.getMinutes();
  
  // Check if it's a working day
  if (!BUSINESS_HOURS.workingDays.includes(dayOfWeek)) {
    return false;
  }
  
  // Check if it's within working hours
  const timeInMinutes = hour * 60 + minute;
  const startTimeInMinutes = BUSINESS_HOURS.startHour * 60 + BUSINESS_HOURS.startMinute;
  const endTimeInMinutes = BUSINESS_HOURS.endHour * 60 + BUSINESS_HOURS.endMinute;
  
  return timeInMinutes >= startTimeInMinutes && timeInMinutes <= endTimeInMinutes;
}

/**
 * Parse time string with specific date
 */
function parseTimeWithDate(timeStr: string, date: Date): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

/**
 * Adds buffer time around busy events
 * @param busyEvents Array of busy events
 * @param bufferMinutes Buffer time in minutes (default: 60)
 */
export function addBufferToBusyEvents(busyEvents: BusyEvent[], bufferMinutes: number = 60): BusyEvent[] {
  return busyEvents.map(event => {
    const eventDate = new Date(event.date);
    const startTime = parseTimeWithDate(event.startTime, eventDate);
    const endTime = parseTimeWithDate(event.endTime, eventDate);
    
    // Add buffer before and after
    const bufferedStart = new Date(startTime.getTime() - bufferMinutes * 60000);
    const bufferedEnd = new Date(endTime.getTime() + bufferMinutes * 60000);
    
    return {
      ...event,
      startTime: formatTime(bufferedStart),
      endTime: formatTime(bufferedEnd)
    };
  });
}

/**
 * Checks if a given time slot overlaps with any of the provided busy events.
 * @param slotStart The start Date object of the time slot.
 * @param slotEnd The end Date object of the time slot.
 * @param busyEvents An array of BusyEvent objects representing busy periods.
 * @param selectedDate The date being checked
 * @returns True if the slot overlaps with any event, false otherwise.
 */
function isSlotOverlappingWithBusyEvents(
  slotStart: Date, 
  slotEnd: Date, 
  busyEvents: BusyEvent[], 
  selectedDate: Date
): boolean {
  const dateStr = selectedDate.toISOString().split('T')[0];
  const dayBusyEvents = busyEvents.filter(event => event.date === dateStr);
  
  for (const event of dayBusyEvents) {
    const eventStart = parseTimeWithDate(event.startTime, selectedDate);
    const eventEnd = parseTimeWithDate(event.endTime, selectedDate);

    // Standard overlap condition: (SlotStart < EventEnd) and (SlotEnd > EventStart)
    if (slotStart < eventEnd && slotEnd > eventStart) {
      return true; // Overlap found
    }
  }
  return false; // No overlap
}

/**
 * Checks if a given time slot overlaps with any of the provided ICS events.
 * @param slotStart The start Date object of the time slot.
 * @param slotEnd The end Date object of the time slot.
 * @param icsEvents An array of ICAL.Event objects representing busy periods.
 * @returns True if the slot overlaps with any event, false otherwise.
 */
function isSlotOverlappingWithEvents(slotStart: Date, slotEnd: Date, icsEvents: ICAL.Event[]): boolean {
  for (const event of icsEvents) {
    const eventStart = event.startDate.toJSDate();
    const eventEnd = event.endDate.toJSDate();

    // Standard overlap condition: (SlotStart < EventEnd) and (SlotEnd > EventStart)
    if (slotStart < eventEnd && slotEnd > eventStart) {
      return true; // Overlap found
    }
  }
  return false; // No overlap
}

/**
 * Generate available time slots for a specific date considering business hours,
 * busy events, and buffer times
 */
export function getAvailableTimeSlots(
  selectedDate: Date, 
  busyEvents: BusyEvent[] = [], 
  slotDurationMinutes: number = 15
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  // Add buffer to busy events
  const bufferedBusyEvents = addBufferToBusyEvents(busyEvents, 60);
  
  // Generate time slots from business start to end
  const startTime = new Date(selectedDate);
  startTime.setHours(BUSINESS_HOURS.startHour, BUSINESS_HOURS.startMinute, 0, 0);
  
  const endTime = new Date(selectedDate);
  endTime.setHours(BUSINESS_HOURS.endHour, BUSINESS_HOURS.endMinute, 0, 0);
  
  const currentSlot = new Date(startTime);
  
  while (currentSlot < endTime) {
    const slotEnd = new Date(currentSlot.getTime() + slotDurationMinutes * 60000);
    
    // Check if this slot conflicts with any busy event
    const isAvailable = !isSlotOverlappingWithBusyEvents(
      currentSlot, 
      slotEnd, 
      bufferedBusyEvents, 
      selectedDate
    );
    
    slots.push({
      time: formatTime(currentSlot),
      available: isAvailable && isWithinBusinessHours(currentSlot),
      duration: slotDurationMinutes
    });
    
    // Move to next slot
    currentSlot.setTime(currentSlot.getTime() + slotDurationMinutes * 60000);
  }
  
  return slots;
}

/**
 * Legacy function for ICS compatibility - updated to use new business hours
 */
export function getAvailableTimeSlotsFromICS(selectedDate: Date, icsEvents: ICAL.Event[]): TimeSlot[] {
  const availableSlots: TimeSlot[] = [];
  const day = selectedDate.getDate();
  const month = selectedDate.getMonth();
  const year = selectedDate.getFullYear();

  // Use new business hours
  const startTime = new Date(year, month, day, BUSINESS_HOURS.startHour, BUSINESS_HOURS.startMinute, 0);
  const endTime = new Date(year, month, day, BUSINESS_HOURS.endHour, BUSINESS_HOURS.endMinute, 0);
  
  const currentSlot = new Date(startTime);
  
  // Generate 15-minute slots
  while (currentSlot < endTime) {
    const slotEnd = new Date(currentSlot.getTime() + 15 * 60000); // 15 minutes
    const isBooked = isSlotOverlappingWithEvents(currentSlot, slotEnd, icsEvents);
    
    availableSlots.push({
      time: formatTime(currentSlot),
      available: !isBooked && isWithinBusinessHours(currentSlot),
    });
    
    // Move to next 15-minute slot
    currentSlot.setTime(currentSlot.getTime() + 15 * 60000);
  }
  
  return availableSlots;
}

