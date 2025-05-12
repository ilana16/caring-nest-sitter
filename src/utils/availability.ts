import ICAL from 'ical.js';

// Define TimeSlot type, used by BookingForm and TimeSlotSelector
export interface TimeSlot {
  time: string; // e.g., "09:00"
  available: boolean;
}

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
    // It might be better to throw the error and let the caller handle it
    // For now, returning an empty array to avoid breaking the UI completely
    return []; 
  }
}

const BUSINESS_START_HOUR = 9;
const BUSINESS_END_HOUR = 17; // Defines the end of the last slot (e.g., 16:00-17:00)

// Helper to format a Date object to HH:MM string
function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
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
 * Generates a list of available time slots for a given date, considering business hours and ICS events.
 * @param selectedDate The Date for which to get available time slots.
 * @param icsEvents An array of ICAL.Event objects representing busy periods.
 * @returns An array of TimeSlot objects, indicating time and availability.
 */
export function getAvailableTimeSlots(selectedDate: Date, icsEvents: ICAL.Event[]): TimeSlot[] {
  const availableSlots: TimeSlot[] = [];
  const day = selectedDate.getDate();
  const month = selectedDate.getMonth();
  const year = selectedDate.getFullYear();

  // Iterate through business hours to create 1-hour slots
  for (let hour = BUSINESS_START_HOUR; hour < BUSINESS_END_HOUR; hour++) {
    const slotStartTime = new Date(year, month, day, hour, 0, 0);
    const slotEndTime = new Date(year, month, day, hour + 1, 0, 0); // Assuming 1-hour slots

    const isBooked = isSlotOverlappingWithEvents(slotStartTime, slotEndTime, icsEvents);
    
    availableSlots.push({
      time: formatTime(slotStartTime),
      available: !isBooked,
    });
  }
  return availableSlots;
}

