# HomeMAXX GHL Custom Fields Setup Guide

## New Survey Fields - Motivation & Price Expectations

### Motivation Section Fields

**Field Name**: `motivations`
- **Type**: Multi-Select Checkbox
- **Options**:
  - `life-change` → "Going through a life change or situation"
  - `inherited-property` → "Recently inherited the property and considering options"
  - `relocating` → "Relocating for work, family, or lifestyle"
  - `downsizing` → "Looking to downsize"
  - `need-more-space` → "Needing more space"
  - `too-many-repairs` → "Property needs more repairs than I want to handle"
  - `dont-want-to-manage` → "Don't want to manage this property anymore"
  - `vacant-property` → "The property is vacant and I'd rather not maintain it"
  - `tired-of-tenants` → "Tired of dealing with renters/tenants"
  - `avoid-upkeep` → "Want to avoid ongoing upkeep or city issues"
  - `sell-sooner` → "Want to sell sooner rather than later"
  - `access-cash` → "Interested in accessing cash tied up in the property"
  - `exploring-market` → "Exploring what I could get in today's market"
  - `unique-situation` → "Unique situation"

**Field Name**: `unique_situation_details`
- **Type**: Long Text
- **Description**: "Details about unique selling situation"
- **Conditional**: Only populated when "unique-situation" is selected

### Price Expectations Fields

**Field Name**: `price_expectation_type`
- **Type**: Radio Button
- **Options**:
  - `has-number` → "Yes, I have a number in mind"
  - `no-number` → "No, not really sure yet"

**Field Name**: `price_expectation`
- **Type**: Text
- **Description**: "Seller's price expectation (free text or range selection)"

**Field Name**: `price_expectation_range`
- **Type**: Radio Button
- **Options**:
  - `under-100k` → "Less than $100,000"
  - `100k-150k` → "$100,000 – $150,000"
  - `150k-200k` → "$150,000 – $200,000"
  - `200k-300k` → "$200,000 – $300,000"
  - `300k-350k` → "$300,000 – $350,000"
  - `350k-400k` → "$350,000 – $400,000"
  - `400k-450k` → "$400,000 – $450,000"
  - `450k-plus` → "$450,000+"
  - `dont-know` → "I really don't know yet"

### Property Issues Fields

**Field Name**: `property_issues`
- **Type**: Multi-Select Checkbox
- **Options**:
  - `solar-panels` → "Solar panels"
  - `foundation-issues` → "Foundation issues"
  - `fire-damage` → "Fire damage"
  - `well-water` → "Well water"
  - `septic-system` → "Septic system"
  - `asbestos-siding` → "Asbestos siding"
  - `horse-property` → "Horse property"
  - `mobile-home` → "Mobile home"
  - `none` → "None"

### Photo Upload Fields

**Field Name**: `property_photos`
- **Type**: File Upload
- **Description**: "Property photos uploaded by homeowner"
- **Settings**: Multiple files allowed, Image files only (JPG, PNG, HEIC)

**Field Name**: `photos_uploaded`
- **Type**: Number
- **Description**: "Number of photos uploaded by homeowner"

**Field Name**: `photo_metadata`
- **Type**: Long Text
- **Description**: "JSON metadata of uploaded photos (names, sizes, types, timestamps)"

## Workflow Triggers for New Fields

### High-Priority Motivations Workflow
**Trigger**: Contact Updated → Custom Field "motivations" contains "sell-sooner" OR "access-cash" OR "too-many-repairs"

**Actions**:
1. **Add Tags**: `urgent-motivation`, `high-priority-seller`
2. **Send Internal Alert**:
   ```
   🚨 HIGH PRIORITY MOTIVATION: {{contact.first_name}} {{contact.last_name}}
   Motivations: {{contact.custom_fields.motivations}}
   Property: {{contact.custom_fields.property_address}}
   Expedite contact - motivated seller!
   ```
3. **Update Priority**: Set to URGENT if not already higher
4. **Create Task**: "Urgent: Motivated Seller - Contact ASAP"

### Price Expectation Analysis Workflow
**Trigger**: Contact Updated → Custom Field "price_expectation" is not empty

**Actions**:
1. **Add Tags**: `price-expectation-provided`
2. **Send Internal Note**:
   ```
   💰 PRICE EXPECTATION: {{contact.first_name}} {{contact.last_name}}
   Expected Price: {{contact.custom_fields.price_expectation}}
   Type: {{contact.custom_fields.price_expectation_type}}
   Compare with market analysis for negotiation strategy
   ```

### Inherited Property Workflow
**Trigger**: Contact Updated → Custom Field "motivations" contains "inherited-property"

**Actions**:
1. **Add Tags**: `inherited-property`, `probate-potential`
2. **Send Internal Alert**:
   ```
   🏠 INHERITED PROPERTY: {{contact.first_name}} {{contact.last_name}}
   Property: {{contact.custom_fields.property_address}}
   May need probate assistance - assign to probate specialist
   ```
3. **Create Task**: "Inherited Property - Check Probate Status"

### Property Issues Risk Assessment Workflow
**Trigger**: Contact Updated → Custom Field "property_issues" contains "foundation-issues" OR "fire-damage" OR "asbestos-siding"

**Actions**:
1. **Add Tags**: `high-risk-property`, `requires-inspection`
2. **Send Internal Alert**:
   ```
   ⚠️ HIGH RISK PROPERTY: {{contact.first_name}} {{contact.last_name}}
   Issues: {{contact.custom_fields.property_issues}}
   Property: {{contact.custom_fields.property_address}}
   Requires specialist evaluation before offer
   ```
3. **Create Task**: "High Risk Property - Specialist Evaluation Required"
4. **Update Priority**: Flag for senior review

### Solar Panel Workflow
**Trigger**: Contact Updated → Custom Field "property_issues" contains "solar-panels"

**Actions**:
1. **Add Tags**: `solar-panels`, `lease-buyout-required`
2. **Send Internal Note**:
   ```
   ☀️ SOLAR PANELS: {{contact.first_name}} {{contact.last_name}}
   Property: {{contact.custom_fields.property_address}}
   Check lease terms and buyout costs
   ```
3. **Create Task**: "Solar Panel Lease Investigation"

## Data Mapping for Webhooks

When submitting to GHL webhook, include these new fields:

```javascript
{
  // Existing fields...
  "motivations": ["sell-sooner", "access-cash"], // Array of selected motivations
  "unique_situation_details": "Moving out of state for job", // Text if provided
  "price_expectation_type": "has-number", // has-number or no-number
  "price_expectation": "$350,000", // User input or selected range
  "price_expectation_range": "300k-350k", // Only if no-number selected
  "property_issues": ["solar-panels", "foundation-issues"] // Array of selected property issues
}
```

## Testing Checklist

- [ ] Motivation checkboxes allow multiple selections
- [ ] Unique situation text area appears when selected
- [ ] Price expectation toggle switches between input types
- [ ] Free text input captures custom price expectations
- [ ] Range buttons work for predefined ranges
- [ ] All fields submit correctly to GHL webhook
- [ ] Workflow triggers activate for high-priority motivations
- [ ] Custom fields populate in GHL contact records
- [ ] Property issues checkboxes allow multiple selections
- [ ] Property issues workflow triggers activate for high-risk properties

## Implementation Notes

1. **Multi-Select Handling**: The `motivations` and `property_issues` fields should be stored as arrays in the webhook payload
2. **Conditional Logic**: Unique situation details only collected when checkbox selected
3. **Price Validation**: No validation on price input - accept any format
4. **Workflow Priority**: High-priority motivations should override standard priority scoring
5. **Data Analysis**: Use motivation data to improve lead scoring and follow-up strategies
