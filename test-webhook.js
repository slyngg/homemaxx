// Test webhook payload for HomeMAXX GHL integration
// Run with: node test-webhook.js

const testWebhookPayload = {
  contact: {
    // Basic contact information
    firstName: "John",
    lastName: "Smith", 
    email: "john.smith@example.com",
    phone: "+1-555-123-4567",
    
    // Property information
    address: "123 Main Street, Las Vegas, NV 89101",
    property_address: "123 Main Street, Las Vegas, NV 89101",
    
    // Survey responses - existing fields
    seller_timeline: "asap",
    property_condition: "good-condition",
    kitchen_countertops: "granite",
    kitchen_quality: "high-end",
    bathroom_quality: "standard", 
    living_room_quality: "high-end",
    hoa_status: "yes",
    hoa_monthly_fees: "150",
    property_issues: "solar-panels, foundation-issues",
    owner_type: "owner",
    user_type: "homeowner",
    
    // NEW: Motivation fields
    motivations: "downsizing, financial-hardship, job-relocation",
    unique_situation_details: "Need to relocate for new job opportunity in another state within 60 days",
    
    // NEW: Price expectations fields
    price_expectation_type: "has-number",
    price_expectation: "$450,000",
    price_expectation_range: "",
    
    // NEW: Photo upload data - Testing both approaches
    photos_uploaded: 3,
    photo_metadata: JSON.stringify([
      {
        name: "front-exterior.jpg",
        size: 2048576,
        type: "image/jpeg", 
        timestamp: Date.now(),
        data: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      },
      {
        name: "kitchen-interior.jpg",
        size: 1536789,
        type: "image/jpeg",
        timestamp: Date.now() + 1000,
        data: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      },
      {
        name: "backyard-view.jpg", 
        size: 1789234,
        type: "image/jpeg",
        timestamp: Date.now() + 2000,
        data: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      }
    ]),
    
    // GHL File Upload Field - use URLs or file objects
    property_photos: [
      "https://example.com/photos/front-exterior.jpg",
      "https://example.com/photos/kitchen-interior.jpg", 
      "https://example.com/photos/backyard-view.jpg"
    ],
    
    // Consent and tracking
    sms_consent: "yes",
    sms_consent_timestamp: new Date().toISOString(),
    sms_consent_ip: "192.168.1.100",
    lead_priority: "Standard - Funnel Completion",
    contact_method: "Email and Phone Provided",
    calculation_status: "Pending Qualification",
    funnel_completion_date: new Date().toISOString(),
    
    // Additional data
    cash_offer_claimed: false,
    funnel_version: "2.0",
    data_collection_complete: true,
    leadSource: "HomeMAXX Funnel",
    funnelStep: "Completed",
    submissionDate: new Date().toISOString(),
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    
    // Debug data
    raw_form_data: JSON.stringify({
      address: "123 Main Street, Las Vegas, NV 89101",
      timeline: "asap",
      motivations: ["downsizing", "financial-hardship", "job-relocation"],
      "unique-situation-details": "Need to relocate for new job opportunity in another state within 60 days",
      "price-expectation-type": "has-number",
      "price-expectation": "$450,000",
      "property-issues": ["solar-panels", "foundation-issues"],
      photos: [
        { name: "front-exterior.jpg", size: 2048576 },
        { name: "kitchen-interior.jpg", size: 1536789 },
        { name: "backyard-view.jpg", size: 1789234 }
      ]
    })
  }
};

async function sendTestWebhook() {
  const webhookUrl = 'https://services.leadconnectorhq.com/hooks/MyNhX7NAs8SVM9vQMbqZ/webhook-trigger/54168c84-2392-4dd4-b6ce-a4eb171801f9';
  
  try {
    console.log('🚀 Sending test webhook to GHL...');
    console.log('📋 Payload includes:');
    console.log('   ✅ Basic contact info');
    console.log('   ✅ Property survey responses');
    console.log('   ✅ NEW: Motivation fields');
    console.log('   ✅ NEW: Price expectation fields');
    console.log('   ✅ NEW: Property issues');
    console.log('   ✅ NEW: Photo upload data (3 sample photos)');
    console.log('   ✅ SMS consent tracking');
    console.log('');
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testWebhookPayload)
    });
    
    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.text();
      console.log('✅ SUCCESS: Webhook sent successfully!');
      console.log('📄 Response:', result || 'Empty response');
      console.log('');
      console.log('🎯 Next Steps:');
      console.log('   1. Check GHL for new contact record');
      console.log('   2. Verify all custom fields are populated');
      console.log('   3. Confirm photo files are uploaded');
      console.log('   4. Test workflow triggers for high-priority motivations');
    } else {
      const errorText = await response.text();
      console.error('❌ ERROR: Webhook failed');
      console.error('📄 Error Response:', errorText);
    }
    
  } catch (error) {
    console.error('💥 NETWORK ERROR:', error.message);
  }
}

// Run the test
sendTestWebhook();
