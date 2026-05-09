import logging
import re
from pathlib import Path

from flask import Flask, jsonify, render_template, request
from flask_mail import Mail, Message

app = Flask(__name__)
app.logger.setLevel(logging.INFO)

app.config['SECRET_KEY'] = 'change-this-secret-in-production'

# --- Mail (Gmail SMTP + App Password; spaces in password are ignored) ---
ADMIN_EMAIL = 'adamcatering26@gmail.com'
MAIL_USERNAME = ADMIN_EMAIL
MAIL_PASSWORD = 'usyt wpcm kynz axnm'.replace(' ', '')

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = MAIL_USERNAME
app.config['MAIL_PASSWORD'] = MAIL_PASSWORD
app.config['MAIL_DEFAULT_SENDER'] = ('Adam Group', MAIL_USERNAME)
app.config['ADMIN_EMAIL'] = ADMIN_EMAIL

mail = Mail(app)

_EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')


def _single_line(value, max_len=400):
    if value is None:
        return ''
    text = str(value).replace('\r', ' ').replace('\n', ' ')
    return ' '.join(text.split()).strip()[:max_len]


def _find_logo_bytes():
    static_dir = Path(app.root_path) / 'static'
    for name in ('images/Logo.png', 'images/image.png'):
        path = static_dir / name
        if path.is_file():
            return path.read_bytes(), path.name
    return None, None


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/contact', methods=['POST'])
def contact():
    data = request.get_json(silent=True) or request.form

    name = _single_line(data.get('name'), 200)
    phone = _single_line(data.get('phone'), 80)
    email = _single_line(data.get('email'), 254).lower()
    event_date = _single_line(data.get('event_date'), 40)
    message = (data.get('message') or '').strip()[:8000]
    service = _single_line(data.get('service'), 80)
    catering_type = _single_line(data.get('catering_type'), 120)

    if not name or not phone or not email or not service:
        return jsonify({'success': False, 'message': 'Please fill in all required fields.'}), 400

    if not _EMAIL_RE.match(email):
        return jsonify({'success': False, 'message': 'Please enter a valid email address.'}), 400

    service_label = {
        'adam-catering': 'Adam Catering',
        'adam-kitchen': 'Adam Kitchen',
    }.get(service, service)
    catering_type_label = catering_type.replace('-', ' ').title() if catering_type else 'Not specified'

    admin_subject = f"New Website Enquiry - {name} ({service_label})"
    admin_body = (
        'A new enquiry has been submitted from the website.\n\n'
        f'Name: {name}\n'
        f'Phone: {phone}\n'
        f'Email: {email}\n'
        f'Service: {service_label}\n'
        f'Catering Type: {catering_type_label}\n'
        f'Event Date: {event_date or "Not provided"}\n'
        f'Message:\n{message or "No additional message"}\n'
    )

    user_subject = 'Thank you for contacting Adam Group'
    user_plain = (
        f'Dear {name},\n\n'
        'Thank you for reaching out to Adam Group of Catering & Kitchen.\n'
        'We have received your enquiry and will contact you shortly.\n\n'
        f'Service: {service_label}\n'
        f'Catering Type: {catering_type_label}\n'
        f'Event Date: {event_date or "Not provided"}\n\n'
        'Questions? Reply to this email or call us at 99404 12067.\n\n'
        'Warm regards,\nThe Adam Group Team\n'
    )

    logo_data, logo_filename = _find_logo_bytes()
    header_inner = (
        '<img src="cid:logo_image" alt="Adam Catering Logo" '
        'style="width:80px;height:80px;object-fit:contain;margin-bottom:10px;">'
        if logo_data
        else ''
    )

    user_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                background-color: #f4f4f4;
                color: #333333;
                margin: 0;
                padding: 0;
            }}
            .email-container {{
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                border-top: 4px solid #C9A84C;
            }}
            .email-header {{
                background-color: #111008;
                padding: 30px 20px;
                text-align: center;
            }}
            .email-header h1 {{
                color: #C9A84C;
                margin: 0;
                font-size: 24px;
                letter-spacing: 2px;
                text-transform: uppercase;
            }}
            .email-body {{
                padding: 40px 30px;
            }}
            .email-body h2 {{
                color: #111008;
                font-size: 20px;
                margin-top: 0;
            }}
            .email-body p {{
                font-size: 15px;
                line-height: 1.6;
                color: #555555;
            }}
            .details-box {{
                background-color: #f9f9f9;
                border-left: 4px solid #C9A84C;
                padding: 20px;
                margin: 30px 0;
                border-radius: 0 4px 4px 0;
            }}
            .details-box p {{
                margin: 8px 0;
                font-size: 14px;
                color: #444444;
            }}
            .details-box strong {{
                color: #222222;
                display: inline-block;
                width: 120px;
            }}
            .email-footer {{
                background-color: #fcfcfc;
                padding: 20px 30px;
                text-align: center;
                border-top: 1px solid #eeeeee;
            }}
            .email-footer p {{
                margin: 0;
                font-size: 12px;
                color: #999999;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                {header_inner}
                <h1>Adam Catering</h1>
            </div>
            <div class="email-body">
                <h2>Dear {name},</h2>
                <p>Thank you for reaching out to <strong>Adam Group of Catering & Kitchen</strong>.</p>
                <p>We have successfully received your enquiry. Our team is currently reviewing your
                requirements and will get back to you shortly.</p>
                <div class="details-box">
                    <p><strong>Service:</strong> {service_label}</p>
                    <p><strong>Catering Type:</strong> {catering_type_label}</p>
                    <p><strong>Event Date:</strong> {event_date or 'Not provided'}</p>
                </div>
                <p>If you have any immediate questions, feel free to reply to this email or call us at
                <strong>99404 12067</strong>.</p>
                <p>Warm regards,<br><strong>The Adam Group Team</strong></p>
            </div>
            <div class="email-footer">
                <p>Adam Group of Catering & Kitchen | Old No: 16, New No. 14, Bashyam Street,
                Thiru.Vi.Ka Nagar, Perambur, Chennai – 600 082</p>
                <p>&copy; 2026 Adam Group. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

    try:
        admin_msg = Message(
            subject=admin_subject,
            recipients=[app.config['ADMIN_EMAIL']],
            body=admin_body,
            reply_to=email,
        )
        user_msg = Message(
            subject=user_subject,
            recipients=[email],
            body=user_plain,
            html=user_html,
        )

        if logo_data:
            user_msg.attach(
                logo_filename or 'logo.png',
                'image/png',
                logo_data,
                disposition='inline',
                headers=[('Content-ID', '<logo_image>')],
            )

        with mail.connect() as conn:
            conn.send(admin_msg)
            conn.send(user_msg)
    except Exception:
        app.logger.exception('Failed to send contact form emails')
        return jsonify({
            'success': False,
            'message': 'We could not send your enquiry right now. Please try again shortly.',
        }), 500

    return jsonify({
        'success': True,
        'message': (
            'Thank you for your enquiry. A confirmation email has been sent, and our team '
            'will contact you soon.'
        ),
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
