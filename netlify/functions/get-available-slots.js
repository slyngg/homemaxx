const fetch = require('node-fetch');

// GHL API Configuration
const GHL_API_BASE = 'https://rest.gohighlevel.com/v1';
const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_CALENDAR_ID = process.env.GHL_CALENDAR_ID;

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { timezone = 'America/Los_Angeles' } = event.queryStringParameters || {};
    
    // Get available slots for the next 14 days
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 14);

    const availableSlots = await getAvailableSlots(startDate, endDate, timezone);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        slots: availableSlots,
        timezone
      })
    };

  } catch (error) {
    console.error('Get slots error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch available slots',
        details: error.message 
      })
    };
  }
};

async function getAvailableSlots(startDate, endDate, timezone) {
  try {
    // Fetch existing appointments from GHL
    const response = await fetch(
      `${GHL_API_BASE}/appointments?calendarId=${GHL_CALENDAR_ID}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
      {
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch appointments from GHL');
    }

    const existingAppointments = await response.json();
    
    // Generate available slots
    const slots = generateAvailableSlots(startDate, endDate, existingAppointments.appointments || [], timezone);
    
    return slots;
  } catch (error) {
    console.error('Error fetching GHL appointments:', error);
    // Fallback to generating slots without existing appointments
    return generateAvailableSlots(startDate, endDate, [], timezone);
  }
}

function generateAvailableSlots(startDate, endDate, existingAppointments, timezone) {
  const slots = [];
  const current = new Date(startDate);
  
  // Business hours: 9 AM to 6 PM, Monday to Friday
  const businessHours = {
    start: 9, // 9 AM
    end: 18,  // 6 PM
    days: [1, 2, 3, 4, 5] // Monday to Friday
  };
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    
    // Skip weekends
    if (businessHours.days.includes(dayOfWeek)) {
      // Generate slots for this day
      for (let hour = businessHours.start; hour < businessHours.end; hour++) {
        // Generate slots every 30 minutes
        for (let minute of [0, 30]) {
          const slotStart = new Date(current);
          slotStart.setHours(hour, minute, 0, 0);
          
          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotEnd.getMinutes() + 30);
          
          // Skip past slots
          if (slotStart <= new Date()) {
            continue;
          }
          
          // Check if slot conflicts with existing appointments
          const hasConflict = existingAppointments.some(appointment => {
            const appointmentStart = new Date(appointment.startTime);
            const appointmentEnd = new Date(appointment.endTime);
            
            return (slotStart < appointmentEnd && slotEnd > appointmentStart);
          });
          
          if (!hasConflict) {
            slots.push({
              startTime: slotStart.toISOString(),
              endTime: slotEnd.toISOString(),
              displayTime: slotStart.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                timeZone: timezone
              }),
              displayDate: slotStart.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                timeZone: timezone
              })
            });
          }
        }
      }
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  // Group slots by date
  const groupedSlots = {};
  slots.forEach(slot => {
    const date = new Date(slot.startTime).toDateString();
    if (!groupedSlots[date]) {
      groupedSlots[date] = {
        date: slot.displayDate,
        slots: []
      };
    }
    groupedSlots[date].slots.push(slot);
  });
  
  return Object.values(groupedSlots);
}
