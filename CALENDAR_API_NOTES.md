# Google Calendar API Integration

## Calendar URL Analysis

The provided Google Calendar embed URL:
```
https://calendar.google.com/calendar/embed?src=ilana.cunningham16%40gmail.com&ctz=Asia%2FJerusalem
```

Can be converted to ICS format:
```
https://calendar.google.com/calendar/ical/ilana.cunningham16%40gmail.com/public/basic.ics
```

## Implementation Strategy

1. Use the ICS feed URL to fetch calendar data
2. Parse ICS data using existing ICAL.js library
3. Convert events to our BusyEvent format
4. Apply business hours and buffer logic

## API Endpoints

- Public ICS feed: For fetching calendar events
- Backup scraping: For cases where ICS is not available

