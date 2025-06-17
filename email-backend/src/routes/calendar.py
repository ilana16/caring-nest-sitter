from flask import Blueprint, request, jsonify, current_app
import requests
from datetime import datetime
import os

calendar_bp = Blueprint('calendar', __name__)

@calendar_bp.route('/get-calendar-events', methods=['GET'])
def get_calendar_events():
    """Proxy endpoint to fetch Google Calendar ICS data and avoid CORS issues"""
    try:
        # The ICS URL for Ilana's calendar
        ics_url = 'https://calendar.google.com/calendar/ical/ilana.cunningham16%40gmail.com/public/basic.ics'
        
        # Fetch the ICS data from Google Calendar
        response = requests.get(ics_url, timeout=30)
        response.raise_for_status()
        
        # Return the ICS data as plain text
        return response.text, 200, {'Content-Type': 'text/calendar'}
        
    except requests.exceptions.RequestException as e:
        current_app.logger.error(f"Error fetching calendar data: {str(e)}")
        return jsonify({
            'error': 'Failed to fetch calendar data',
            'details': str(e)
        }), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({
            'error': 'Unexpected error occurred',
            'details': str(e)
        }), 500

@calendar_bp.route('/test-calendar', methods=['GET'])
def test_calendar():
    """Test endpoint to verify calendar access"""
    try:
        ics_url = 'https://calendar.google.com/calendar/ical/ilana.cunningham16%40gmail.com/public/basic.ics'
        response = requests.get(ics_url, timeout=10)
        
        if response.status_code == 200:
            # Count the number of events in the response
            event_count = response.text.count('BEGIN:VEVENT')
            return jsonify({
                'success': True,
                'message': f'Calendar access successful. Found {event_count} events.',
                'status_code': response.status_code
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': f'Calendar access failed with status {response.status_code}',
                'status_code': response.status_code
            }), response.status_code
            
    except Exception as e:
        current_app.logger.error(f"Error testing calendar: {str(e)}")
        return jsonify({
            'error': 'Failed to test calendar access',
            'details': str(e)
        }), 500

