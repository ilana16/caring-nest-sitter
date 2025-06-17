from flask import Blueprint, request, jsonify, current_app
from flask_mail import Message, Mail
from datetime import datetime
import os

booking_bp = Blueprint('booking', __name__)

@booking_bp.route('/submit-booking', methods=['POST'])
def submit_booking():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'phone', 'duration', 'date', 'startTime', 'children']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Get mail instance
        mail = Mail(current_app)
        
        # Format booking details
        booking_details = f"""
New Booking Request

Client Information:
- Name: {data['name']}
- Email: {data['email']}
- Phone: {data['phone']}
- Number of Children: {data['children']}

Booking Details:
- Date: {data['date']}
- Start Time: {data['startTime']}
- Duration: {data['duration']} hours
- End Time: {calculate_end_time(data['startTime'], data['duration'])}

Additional Information:
{data.get('comments', 'No additional comments')}

Submitted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
        
        # Send email to Ilana
        ilana_msg = Message(
            subject=f"New Booking Request from {data['name']}",
            recipients=['Ilana.cunningham16@gmail.com'],
            body=booking_details,
            sender='noreply@ilanacares.com'
        )
        
        # Send confirmation email to user
        user_confirmation = f"""
Dear {data['name']},

Thank you for your booking request! We have received the following details:

Booking Information:
- Date: {data['date']}
- Time: {data['startTime']} - {calculate_end_time(data['startTime'], data['duration'])}
- Duration: {data['duration']} hours
- Number of Children: {data['children']}

Ilana will contact you shortly at {data['phone']} or {data['email']} to confirm the booking details.

Best regards,
Ilana Cares Babysitting Service
"""
        
        user_msg = Message(
            subject="Booking Request Confirmation - Ilana Cares",
            recipients=[data['email']],
            body=user_confirmation,
            sender='noreply@ilanacares.com'
        )
        
        # Send both emails
        mail.send(ilana_msg)
        mail.send(user_msg)
        
        return jsonify({
            'success': True,
            'message': 'Booking request submitted successfully. Confirmation emails sent.'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error submitting booking: {str(e)}")
        return jsonify({
            'error': 'Failed to submit booking request. Please try again.',
            'details': str(e)
        }), 500

def calculate_end_time(start_time, duration):
    """Calculate end time based on start time and duration"""
    try:
        # Parse start time (format: "HH:MM")
        start_hour, start_minute = map(int, start_time.split(':'))
        
        # Convert duration to hours and minutes
        duration_float = float(duration)
        duration_hours = int(duration_float)
        duration_minutes = int((duration_float - duration_hours) * 60)
        
        # Calculate end time
        end_minute = start_minute + duration_minutes
        end_hour = start_hour + duration_hours
        
        # Handle minute overflow
        if end_minute >= 60:
            end_hour += 1
            end_minute -= 60
            
        # Handle hour overflow (24-hour format)
        if end_hour >= 24:
            end_hour -= 24
            
        return f"{end_hour:02d}:{end_minute:02d}"
    except:
        return "Unknown"

@booking_bp.route('/test-email', methods=['GET'])
def test_email():
    """Test endpoint to verify email configuration"""
    try:
        mail = Mail(current_app)
        
        test_msg = Message(
            subject="Test Email from Booking System",
            recipients=['Ilana.cunningham16@gmail.com'],
            body="This is a test email to verify the email configuration is working correctly.",
            sender='noreply@ilanacares.com'
        )
        
        mail.send(test_msg)
        
        return jsonify({
            'success': True,
            'message': 'Test email sent successfully'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error sending test email: {str(e)}")
        return jsonify({
            'error': 'Failed to send test email',
            'details': str(e)
        }), 500

