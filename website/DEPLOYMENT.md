# HomeMaxx Website Deployment Guide

This guide provides step-by-step instructions for deploying the HomeMaxx website and setting up the GoHighLevel integration.

## Prerequisites

- GoHighLevel account with admin access
- Access to your web hosting or deployment platform
- Basic knowledge of HTML/CSS/JavaScript

## Step 1: Set Up GoHighLevel Webhook

1. Log in to your GoHighLevel account
2. Navigate to Settings > Workflows
3. Click "Create Workflow"
4. Select "Webhook" as the trigger
5. Name it "Website Lead Form" and click "Create"
6. In the workflow editor, click on the webhook trigger
7. Copy the webhook URL (it should look like: `https://services.leadconnectorhq.com/hooks/YOUR_WEBHOOK_ID/web_trigger`)

## Step 2: Update the Contact Form

1. Open `index.html` in your code editor
2. Locate the contact form (around line 166)
3. Update the form's `action` attribute with your GoHighLevel webhook URL:
   ```html
   <form id="contact-form" class="contact-form" action="YOUR_WEBHOOK_URL" method="POST">
   ```

## Step 3: Map Form Fields (Optional)

The form is already set up with common field names that GoHighLevel recognizes. If you need to map additional fields:

1. In GoHighLevel, go to Settings > Custom Fields
2. Create any custom fields that don't exist
3. Update the form field names in `index.html` to match your GoHighLevel field names

## Step 4: Test the Integration

1. Fill out the contact form on your website
2. Submit the form
3. Check your GoHighLevel account to verify the lead was created
4. Check for any validation or error messages

## Step 5: Set Up Auto-Responders (Recommended)

1. In GoHighLevel, go to Settings > Email Templates
2. Create a "Thank You" email template
3. Go back to your workflow
4. Add an "Email" action after the webhook
5. Select your template and configure when it should be sent

## Step 6: Deploy the Website

### Option 1: GoHighLevel Funnel Builder
1. In GoHighLevel, go to Marketing > Funnels
2. Create a new funnel or edit an existing one
3. Use the "Custom Page" option
4. Copy and paste the contents of `index.html` into the HTML editor
5. Update any asset paths to use absolute URLs
6. Publish the funnel

### Option 2: Self-Hosted
1. Upload all files to your web server
2. Ensure all file paths are correct
3. Test the website thoroughly
4. Set up SSL/TLS for secure form submission

## Step 7: Verify Form Submission

1. Test the form submission from the live website
2. Check your GoHighLevel dashboard for new leads
3. Verify that all form data is being captured correctly
4. Test the auto-responder emails

## Troubleshooting

### Form Not Submitting
- Check browser console for JavaScript errors
- Verify the webhook URL is correct
- Ensure all required fields are filled out
- Check for CORS issues (if hosting on a different domain)

### Data Not Appearing in GoHighLevel
- Verify field names match GoHighLevel's expected format
- Check the workflow for any errors
- Look for validation errors in the form submission

### Styling Issues
- Ensure all CSS and JavaScript files are loading correctly
- Check for any 404 errors in the browser console
- Verify that all asset paths are correct

## Next Steps

1. Set up additional workflows in GoHighLevel for lead nurturing
2. Create custom fields for any additional data you want to collect
3. Set up SMS notifications for new leads
4. Configure lead scoring and automation rules

## Support

For additional help, please contact your web developer or GoHighLevel support.
