# HomeMAXX Zapier → GHL Integration Guide for Faith

## Overview
The HomeMAXX website needs Zapier as a translator between website forms and GoHighLevel because GHL native webhooks can't handle custom fields. This guide provides exact specifications for setting up the integration.

## Required Setup: 2 Zapier Zaps

### ZAP 1: Lead Capture & Scoring
**Purpose**: Handle main funnel submissions with lead scoring and custom field mapping

**Trigger**: Webhook - Catch Hook
- **Name**: "HomeMAXX Lead Capture"
- **Description**: Captures comprehensive lead data from property funnel

**Actions Sequence**:
1. **Code by Zapier** - Calculate Lead Priority Score
2. **LeadConnector** - Create/Update Contact with Custom Fields  
3. **LeadConnector** - Add to Workflow (based on priority tier)

---

### ZAP 2: Contact Form
**Purpose**: Handle simple contact form submissions

**Trigger**: Webhook - Catch Hook
- **Name**: "HomeMAXX Contact Form"
- **Description**: Basic contact form submissions

**Actions Sequence**:
1. **LeadConnector** - Create/Update Contact
2. **LeadConnector** - Add to Nurture Workflow

---

## Data Fields We Send (VERIFIED FROM CODE)

### Standard Contact Fields
```json
{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john@example.com",
  "phone": "+15551234567"
}
```

### Property Information Fields (from opendoor-funnel.js)
```json
{
  "address": "123 Main St, Las Vegas, NV 89101",
  "property_address": "123 Main St, Las Vegas, NV 89101",
  "seller_timeline": "immediate",
  "property_condition": "good",
  "kitchen_countertops": "granite",
  "kitchen_quality": "updated",
  "bathroom_quality": "good",
  "living_room_quality": "excellent",
  "hoa_status": "yes",
  "hoa_monthly_fees": "150",
  "property_issues": "none",
  "owner_type": "owner",
  "user_type": "homeowner"
}
```

### Lead Intelligence Fields (from ghl-integration.js)
```json
{
  "status": "New Lead",
  "leadSource": "Website Funnel",
  "website": "https://homemaxx.llc",
  "submittedAt": "2025-01-15T10:30:00Z",
  "priority_score": 75,
  "priority_level": "URGENT",
  "priority_color": "#dc2626",
  "wholesale_margin": "$45000",
  "margin_percentage": "15.2%",
  "priority_recommendations": "High priority | Call within 10 minutes",
  "margin_score": 25,
  "deal_size_score": 20,
  "timeline_score": 15,
  "cash_offer_score": 10,
  "condition_score": 5,
  "location_score": 0
}
```

### Cash Offer Qualification Fields (from qualification-logic.js)
```json
{
  "motivation": "foreclosure",
  "timeframe": "asap",
  "behind_payments": "yes_foreclosure",
  "cash_needs": "mortgage",
  "qualification_status": "qualified",
  "cash_offer_amount": 7500,
  "qualification_tier": "standard",
  "risk_level": "low",
  "wholesale_margin_potential": 0.18
}
```

---

## Required Custom Fields in GHL

**Create these EXACT custom field names in GoHighLevel first:**

### Property Fields
- `Property Address` (Text)
- `Seller Timeline` (Radio: immediate, 30-days, 60-days, 90-days, flexible)
- `Property Condition` (Radio: excellent, good, fair, needs-work)
- `Kitchen Countertops` (Text)
- `Kitchen Quality` (Radio: updated, good, fair, needs-work)
- `Bathroom Quality` (Radio: excellent, good, fair, needs-work)
- `Living Room Quality` (Radio: excellent, good, fair, needs-work)
- `HOA Status` (Radio: yes, no, not_specified)
- `HOA Monthly Fees` (Number)
- `Property Issues` (Text)
- `Owner Type` (Radio: owner, agent, investor)

### Lead Intelligence Fields
- `User Type` (Radio: homeowner, agent, hoa)
- `Priority Score` (Number)
- `Priority Level` (Radio: URGENT, IMPORTANT, STANDARD)
- `Priority Color` (Text)
- `Wholesale Margin` (Text)
- `Margin Percentage` (Text)
- `Priority Recommendations` (Text)
- `Lead Source` (Text)
- `Website` (Text)
- `Submitted At` (Date/Time)

### Cash Offer Fields
- `Motivation` (Radio: foreclosure, behind_payments, divorce, inheritance, relocation, financial)
- `Timeframe` (Radio: asap, 30_days, 60_days, flexible)
- `Behind Payments` (Radio: yes_current, yes_foreclosure, no, no_mortgage)
- `Cash Needs` (Radio: mortgage, moving, bills, other)
- `Qualification Status` (Radio: qualified, disqualified, pending)
- `Cash Offer Amount` (Number)
- `Qualification Tier` (Radio: standard, bonus)
- `Risk Level` (Radio: low, medium, high)

---

## Lead Scoring Logic (Code by Zapier)

**Use this exact JavaScript code in the Code by Zapier step:**

```javascript
// HomeMAXX Lead Priority Scoring Algorithm (matches ghl-integration.js)
let score = 0;
const timeline = inputData.seller_timeline || inputData.timeframe;
const motivation = inputData.motivation;
const userType = inputData.user_type;
const propertyCondition = inputData.property_condition;

// Timeline urgency (25 points max)
if (timeline === 'immediate' || timeline === 'asap') score += 25;
else if (timeline === '30-days' || timeline === '30_days') score += 20;
else if (timeline === '60-days' || timeline === '60_days') score += 15;
else if (timeline === '90-days') score += 10;

// Motivation factors (30 points max)
if (motivation === 'foreclosure') score += 30;
else if (motivation === 'behind_payments') score += 25;
else if (motivation === 'divorce') score += 25;
else if (motivation === 'financial') score += 25;
else if (motivation === 'inheritance') score += 20;
else if (motivation === 'relocation') score += 15;

// Property condition (20 points max)
if (propertyCondition === 'excellent') score += 20;
else if (propertyCondition === 'good') score += 15;
else if (propertyCondition === 'fair') score += 10;
else if (propertyCondition === 'needs-work') score += 5;

// User type bonus (15 points max)
if (userType === 'agent') score += 15;
else if (userType === 'hoa') score += 10;

// Cash offer qualification check
const isCashQualified = (score >= 75 || motivation === 'foreclosure' || motivation === 'behind_payments');

// Determine priority tier and contact timing
let priority_level = 'STANDARD';
let priority_color = '#6b7280';
let contact_timing = '24-48 hours';

if (score >= 75) {
  priority_level = 'URGENT';
  priority_color = '#dc2626';
  contact_timing = '10 minutes';
} else if (score >= 50) {
  priority_level = 'IMPORTANT';
  priority_color = '#ea580c';
  contact_timing = '24 hours';
}

// Output for next step
output = {
  priority_score: score,
  priority_level: priority_level,
  priority_color: priority_color,
  contact_timing: contact_timing,
  is_cash_offer_qualified: isCashQualified ? 'yes' : 'no',
  cash_offer_amount: isCashQualified ? 7500 : 0,
  qualification_tier: isCashQualified ? 'standard' : 'none'
};
```

---

## Field Mapping in LeadConnector Actions

### ZAP 1 - Lead Capture Mapping (Main Funnel)
**Standard Fields**:
- First Name: `{{inputData.firstName}}`
- Last Name: `{{inputData.lastName}}`
- Email: `{{inputData.email}}`
- Phone: `{{inputData.phone}}`

**Custom Fields (Property)**:
- Property Address: `{{inputData.property_address}}`
- Seller Timeline: `{{inputData.seller_timeline}}`
- Property Condition: `{{inputData.property_condition}}`
- Kitchen Countertops: `{{inputData.kitchen_countertops}}`
- Kitchen Quality: `{{inputData.kitchen_quality}}`
- Bathroom Quality: `{{inputData.bathroom_quality}}`
- Living Room Quality: `{{inputData.living_room_quality}}`
- HOA Status: `{{inputData.hoa_status}}`
- HOA Monthly Fees: `{{inputData.hoa_monthly_fees}}`
- Property Issues: `{{inputData.property_issues}}`
- Owner Type: `{{inputData.owner_type}}`
- User Type: `{{inputData.user_type}}`

**Custom Fields (Lead Intelligence from Code step)**:
- Priority Score: `{{output.priority_score}}`
- Priority Level: `{{output.priority_level}}`
- Priority Color: `{{output.priority_color}}`
- Contact Timing: `{{output.contact_timing}}`
- Cash Offer Qualified: `{{output.is_cash_offer_qualified}}`
- Cash Offer Amount: `{{output.cash_offer_amount}}`
- Qualification Tier: `{{output.qualification_tier}}`

**Custom Fields (Tracking)**:
- Lead Source: `{{inputData.leadSource}}`
- Website: `{{inputData.website}}`
- Submitted At: `{{inputData.submittedAt}}`

### ZAP 2 - Contact Form Mapping (Simple Form)
**Standard Fields Only**:
- First Name: `{{inputData.firstName}}` or `{{inputData.first_name}}`
- Last Name: `{{inputData.lastName}}` or `{{inputData.last_name}}`
- Email: `{{inputData.email}}`
- Phone: `{{inputData.phone}}`

**Basic Custom Fields**:
- Lead Source: `Website Contact Form`
- Priority Level: `STANDARD`
- Priority Score: `40`

---

## GHL Workflow Triggers to Create

### 1. URGENT Lead Response (75+ Score)
**Trigger**: Contact Updated → Priority Level = "URGENT"
**Actions**:
- Send SMS to acquisition team: "🚨 URGENT LEAD: {{contact.first_name}} {{contact.last_name}} - {{contact.custom_fields.property_address}} - Call within 10 minutes!"
- Create task for senior acquisition manager
- Send immediate response SMS to lead: "Hi {{contact.first_name}}, we received your property details and will call you within 10 minutes!"

### 2. IMPORTANT Lead Response (50-74 Score)  
**Trigger**: Contact Updated → Priority Level = "IMPORTANT"
**Actions**:
- Add to 24-hour follow-up sequence
- Create task for acquisition team
- Send response email within 4 hours

### 3. Cash Offer Qualification
**Trigger**: Contact Updated → Custom Field "Cash Offer Qualified" = "yes"
**Actions**:
- Send SMS: "Hi {{contact.first_name}}, you may qualify for our $7,500 instant cash program! Reply YES for qualification call."
- Add to cash offer workflow
- Notify cash offer specialist
- Create urgent task: "Cash offer qualified lead - {{contact.first_name}} {{contact.last_name}}"

### 4. Agent Lead Handling
**Trigger**: Contact Updated → User Type = "agent"
**Actions**:
- Assign to Agent Relations Manager
- Send agent-specific welcome sequence
- Add to agent partnership workflow

### 5. Foreclosure Priority
**Trigger**: Contact Updated → Motivation = "foreclosure"
**Actions**:
- Immediate SMS to team: "🏠 FORECLOSURE LEAD: {{contact.first_name}} - Priority handling required"
- Add to foreclosure assistance workflow
- Create high-priority task

---

## Webhook URLs Needed

**Please provide these 2 Zapier webhook URLs:**

1. **Lead Capture Webhook**: `https://hooks.zapier.com/hooks/catch/[YOUR_ID]/lead-capture/`
   - For main funnel submissions (opendoor-funnel.js)
   - Handles comprehensive property data and lead scoring

2. **Contact Form Webhook**: `https://hooks.zapier.com/hooks/catch/[YOUR_ID]/contact-form/`  
   - For simple contact forms (ghl-integration.js)
   - Handles basic contact information only

---

## Testing Instructions

### Test Data for Lead Capture Webhook:
```json
{
  "firstName": "Test",
  "lastName": "User", 
  "email": "test@example.com",
  "phone": "+15551234567",
  "property_address": "123 Test St, Las Vegas, NV 89101",
  "seller_timeline": "immediate",
  "property_condition": "good",
  "kitchen_quality": "updated",
  "bathroom_quality": "good",
  "user_type": "homeowner",
  "motivation": "foreclosure",
  "timeframe": "asap",
  "leadSource": "HomeMAXX Funnel",
  "submittedAt": "2025-01-15T10:30:00Z"
}
```

**Expected Result**: 
- Priority Score: 80+ (URGENT tier)
- Cash Offer Qualified: yes
- Contact created with all custom fields populated
- URGENT workflow triggered
- Cash offer workflow triggered

### Test Data for Contact Form:
```json
{
  "firstName": "Contact",
  "lastName": "Test",
  "email": "contact@example.com", 
  "phone": "+15559876543"
}
```

**Expected Result**:
- Basic contact created
- Priority Level: STANDARD
- Added to nurture workflow

---

## Code Files That Send Data

### Primary Data Sources:
1. **opendoor-funnel.js** (Lines 1244-1280)
   - Sends comprehensive property and lead data
   - Uses nested `contact` object structure
   - Includes all property assessment responses

2. **ghl-integration.js** (Lines 42-65)
   - Adds priority scoring data
   - Includes lead intelligence fields
   - Handles contact form submissions

3. **qualification-logic.js** (Lines 6-44)
   - Defines cash offer qualification criteria
   - Property value range: $50k-$500k
   - Motivation requirements and risk factors

---

## Deliverables Needed from Faith

1. **Zapier Webhook URLs** (2 URLs as specified above)
2. **Confirmation** that custom fields are created in GHL with exact names
3. **Confirmation** that workflows are set up and active
4. **Test results** showing data flows correctly from webhook to GHL
5. **Screenshots** of successful test submissions in GHL

Once you provide the webhook URLs, we will update the website code to integrate with your Zapier setup.
