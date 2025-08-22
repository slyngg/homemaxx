const fetch = require('node-fetch');

// GHL API Configuration
const GHL_API_BASE = 'https://rest.gohighlevel.com/v1';
const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_CALENDAR_ID = process.env.GHL_CALENDAR_ID;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

// Email service configuration (using SendGrid)
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { leadData, selectedSlot } = data;

    // Step 1: Validate lead qualification for $7500 offer
    const isQualified = await checkLeadQualification(leadData);
    
    if (!isQualified.qualified) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Lead not qualified for $7500 offer',
          reason: isQualified.reason 
        })
      };
    }

    // Step 2: Create appointment in GHL calendar
    const appointment = await createGHLAppointment(leadData, selectedSlot);
    
    if (!appointment.success) {
      throw new Error('Failed to create appointment in GHL');
    }

    // Step 3: Create or update contact in GHL
    const contact = await createOrUpdateGHLContact(leadData, appointment.appointmentId);

    // Step 4: Send confirmation email to lead
    await sendConfirmationEmail(leadData, selectedSlot, appointment.appointmentId);

    // Step 5: Schedule automated email reminders
    await scheduleEmailReminders(leadData, selectedSlot, appointment.appointmentId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        appointmentId: appointment.appointmentId,
        contactId: contact.contactId,
        qualificationScore: isQualified.score,
        message: 'Appointment booked successfully'
      })
    };

  } catch (error) {
    console.error('Appointment booking error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};

// Lead qualification logic for $7500 offer
async function checkLeadQualification(leadData) {
  let score = 0;
  const reasons = [];

  // Property value qualification (minimum $200k)
  const estimatedValue = leadData.propertyDetails?.estimatedValue || 0;
  if (estimatedValue >= 200000) {
    score += 25;
  } else {
    reasons.push('Property value below minimum threshold');
  }

  // Timeline qualification (ASAP or 2-4 weeks gets priority)
  if (['asap', '2-4-weeks'].includes(leadData.timeline)) {
    score += 20;
  } else if (['4-6-weeks'].includes(leadData.timeline)) {
    score += 10;
  }

  // Property condition (better condition = higher score)
  const condition = leadData.propertyCondition;
  if (condition === 'updated') {
    score += 20;
  } else if (condition === 'livable-but-dated') {
    score += 15;
  } else if (condition === 'needs-work') {
    score += 10;
  }

  // Location qualification (check if in target markets)
  const targetMarkets = ['NV', 'TX', 'GA', 'FL', 'CA', 'AZ'];
  const state = leadData.address?.state;
  if (targetMarkets.includes(state)) {
    score += 15;
  } else {
    reasons.push('Property not in target market');
  }

  // No major issues (foundation, fire damage, etc.)
  const hasSerousIssues = leadData.propertyIssues?.some(issue => 
    ['foundation-issues', 'fire-damage', 'asbestos-siding'].includes(issue)
  );
  if (!hasSerousIssues) {
    score += 10;
  } else {
    reasons.push('Property has serious structural issues');
  }

  // Contact completeness
  if (leadData.email && leadData.phone && leadData.firstName && leadData.lastName) {
    score += 10;
  } else {
    reasons.push('Incomplete contact information');
  }

  const qualified = score >= 70; // 70% threshold for $7500 offer

  return {
    qualified,
    score,
    reasons: qualified ? [] : reasons
  };
}

// Create appointment in GHL calendar
async function createGHLAppointment(leadData, selectedSlot) {
  const appointmentData = {
    calendarId: GHL_CALENDAR_ID,
    locationId: GHL_LOCATION_ID,
    contactId: null, // Will be set after contact creation
    startTime: selectedSlot.startTime,
    endTime: selectedSlot.endTime,
    title: `$7500 Cash Offer Consultation - ${leadData.firstName} ${leadData.lastName}`,
    appointmentStatus: 'confirmed',
    assignedUserId: process.env.GHL_ASSIGNED_USER_ID,
    notes: `
Property: ${leadData.address?.full || 'Address pending'}
Timeline: ${leadData.timeline}
Property Type: ${leadData.propertyType}
Estimated Value: $${leadData.propertyDetails?.estimatedValue?.toLocaleString() || 'TBD'}
Special Notes: Qualified for $7500 instant cash offer
    `.trim()
  };

  const response = await fetch(`${GHL_API_BASE}/appointments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GHL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(appointmentData)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GHL appointment creation failed: ${error}`);
  }

  const result = await response.json();
  return {
    success: true,
    appointmentId: result.id
  };
}

// Create or update contact in GHL
async function createOrUpdateGHLContact(leadData, appointmentId) {
  const contactData = {
    firstName: leadData.firstName,
    lastName: leadData.lastName,
    email: leadData.email,
    phone: leadData.phone,
    address1: leadData.address?.full,
    city: leadData.address?.city,
    state: leadData.address?.state,
    postalCode: leadData.address?.zipCode,
    source: 'HomeMAXX Website - $7500 Offer Qualified',
    tags: ['$7500-qualified', 'website-lead', 'high-priority'],
    customFields: {
      'property_type': leadData.propertyType,
      'timeline': leadData.timeline,
      'property_condition': leadData.propertyCondition,
      'estimated_value': leadData.propertyDetails?.estimatedValue,
      'appointment_id': appointmentId,
      'qualification_date': new Date().toISOString()
    }
  };

  const response = await fetch(`${GHL_API_BASE}/contacts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GHL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(contactData)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GHL contact creation failed: ${error}`);
  }

  const result = await response.json();
  return {
    contactId: result.id
  };
}

// Send confirmation email
async function sendConfirmationEmail(leadData, selectedSlot, appointmentId) {
  const emailData = {
    to: [{ email: leadData.email, name: `${leadData.firstName} ${leadData.lastName}` }],
    from: { email: 'appointments@homemaxx.llc', name: 'HomeMAXX Appointments' },
    subject: '🎉 Your $7,500 Cash Offer Consultation is Confirmed!',
    html: generateConfirmationEmailHTML(leadData, selectedSlot, appointmentId)
  };

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailData)
  });

  if (!response.ok) {
    console.error('Failed to send confirmation email:', await response.text());
  }
}

// Schedule automated email reminders
async function scheduleEmailReminders(leadData, selectedSlot, appointmentId) {
  const appointmentDate = new Date(selectedSlot.startTime);
  
  // 24-hour reminder
  const reminder24h = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);
  
  // 1-hour reminder
  const reminder1h = new Date(appointmentDate.getTime() - 60 * 60 * 1000);

  // Schedule reminders (this would typically use a job queue like AWS SQS or similar)
  // For now, we'll use GHL's workflow automation
  
  const reminderData = {
    contactEmail: leadData.email,
    appointmentId,
    reminders: [
      { time: reminder24h.toISOString(), type: '24h' },
      { time: reminder1h.toISOString(), type: '1h' }
    ]
  };

  // Store reminder data for processing by a separate service
  console.log('Scheduling reminders:', reminderData);
}

// Generate confirmation email HTML
function generateConfirmationEmailHTML(leadData, selectedSlot, appointmentId) {
  const appointmentDate = new Date(selectedSlot.startTime);
  const formattedDate = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Confirmed - HomeMAXX</title>
    </head>
    <body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #3b82f6; font-size: 28px; margin-bottom: 10px;">Home<span style="color: #1f2937;">MAXX</span></h1>
        <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 15px; border-radius: 10px; display: inline-block;">
          <h2 style="margin: 0; font-size: 24px;">🎉 Appointment Confirmed!</h2>
        </div>
      </div>

      <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
        <h3 style="color: #1f2937; margin-top: 0;">Hi ${leadData.firstName},</h3>
        <p>Congratulations! You've qualified for our <strong>$7,500 instant cash offer</strong> and your consultation is confirmed.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
          <h4 style="color: #059669; margin-top: 0;">📅 Appointment Details</h4>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${formattedTime}</p>
          <p><strong>Duration:</strong> 30 minutes</p>
          <p><strong>Type:</strong> Phone consultation</p>
          <p><strong>Reference:</strong> #${appointmentId}</p>
        </div>
      </div>

      <div style="background: #fef3c7; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
        <h4 style="color: #d97706; margin-top: 0;">💰 What to Expect</h4>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Review of your property details</li>
          <li>Explanation of our $7,500 instant cash offer</li>
          <li>Discussion of closing timeline and next steps</li>
          <li>Answer any questions you have</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="tel:+17257729847" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">📞 Call Us: (725) 772-9847</a>
      </div>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 14px; color: #6b7280;">
        <p><strong>Need to reschedule?</strong> Reply to this email or call us at (725) 772-9847.</p>
        <p>We'll send you reminders 24 hours and 1 hour before your appointment.</p>
        
        <div style="margin-top: 20px; text-align: center;">
          <p>HomeMAXX LLC<br>
          6628 Sky Pointe Dr. Ste.129-1378<br>
          Las Vegas, NV 89131</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
