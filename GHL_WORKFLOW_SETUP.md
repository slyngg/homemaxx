## Required Custom Fields in GHL

Create these exact custom field names:

### Lead Qualification Fields
- `qualificationStatus` (Radio: AUTO_APPROVED, MANUAL_REVIEW, NOT_ELIGIBLE)
- `assignment_fee` (Number)
- `priority_level` (Radio: URGENT, IMPORTANT, STANDARD)
- `priority_color` (Text)
- `contact_timing` (Text)

### Property Details Fields
- `property_address` (Text)
- `property_type` (Radio: single-family, condo, townhouse, multi-family)
- `property_condition` (Radio: excellent, good, fair, needs-work, fixer-upper)
- `timeline` (Radio: asap, 2-4-weeks, 4-6-weeks, 6-weeks-plus, just-browsing)
- `estimated_value` (Number)

### NEW: Motivation Fields
- `motivations` (Multi-Select Checkbox: life-change, inherited-property, relocating, downsizing, need-more-space, too-many-repairs, dont-want-to-manage, vacant-property, tired-of-tenants, avoid-upkeep, sell-sooner, access-cash, exploring-market, unique-situation)
- `unique_situation_details` (Long Text)

### NEW: Price Expectations Fields
- `price_expectation_type` (Radio: has-number, no-number)
- `price_expectation` (Text)
- `price_expectation_range` (Radio: under-100k, 100k-150k, 150k-200k, 200k-300k, 300k-350k, 350k-400k, 400k-450k, 450k-plus, dont-know)

### Appointment Fields
- `appointment_id` (Text)
- `qualification_date` (Date/Time)
- `sms_consent` (Checkbox)
- `email_consent` (Checkbox)

### Survey Response Fields
- `kitchen_quality` (Radio: luxury, high-end, standard, dated, fixer-upper)
- `bathroom_quality` (Radio: luxury, high-end, standard, dated, fixer-upper)
- `living_room_quality` (Radio: luxury, high-end, standard, dated, fixer-upper)
- `hoa_status` (Radio: yes, no, not_specified)
- `hoa_monthly_fees` (Number)
