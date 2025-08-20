# HomeMAXX Website Deployment Checklist

## Pre-Deployment Tasks

### Code Review
- [ ] Verify all links are working correctly
- [ ] Test form validation and submission
- [ ] Check mobile responsiveness on various devices
- [ ] Verify all images have appropriate alt text
- [ ] Test keyboard navigation and screen reader compatibility

### GoHighLevel Setup
- [ ] Create webhook in GoHighLevel (follow DEPLOYMENT.md)
- [ ] Update form action URL with your webhook ID
- [ ] Set up form field mappings in GoHighLevel
- [ ] Configure auto-responder emails
- [ ] Set up SMS notifications for new leads

### Performance
- [ ] Optimize images (WebP format with fallbacks)
- [ ] Minify CSS and JavaScript files
- [ ] Enable GZIP compression on the server
- [ ] Set up browser caching
- [ ] Test page load speed (aim for < 3s)

## Deployment Steps

1. **Backup Current Site**
   - [ ] Backup all existing files and database
   - [ ] Document current configuration

2. **Upload Files**
   - [ ] Upload all files to your web server
   - [ ] Verify file permissions (folders: 755, files: 644)
   - [ ] Test the website on staging if available

3. **GoHighLevel Integration**
   - [ ] Update form action URL in `index.html`
   - [ ] Test form submission
   - [ ] Verify lead data in GoHighLevel
   - [ ] Test auto-responder emails

4. **SSL/TLS Setup**
   - [ ] Install SSL certificate
   - [ ] Force HTTPS redirects
   - [ ] Update all internal links to use HTTPS

5. **Analytics & Tracking**
   - [ ] Add Google Analytics/GTM code
   - [ ] Set up conversion tracking
   - [ ] Test all tracking codes

## Post-Deployment Testing

### Functional Testing
- [ ] Test all navigation links
- [ ] Verify form submissions
- [ ] Test on different browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices (iOS, Android)
- [ ] Verify all images and assets load correctly

### Performance Testing
- [ ] Run Lighthouse audit
- [ ] Test page load speed
- [ ] Check for render-blocking resources
- [ ] Verify caching is working

### Security Testing
- [ ] Run security scan
- [ ] Test for XSS vulnerabilities
- [ ] Verify form input sanitization
- [ ] Check for mixed content issues

## Go-Live Tasks

1. **DNS Updates**
   - [ ] Update DNS records if changing domains
   - [ ] Set up domain forwarding if needed
   - [ ] Verify SSL certificate installation

2. **Final Verification**
   - [ ] Test website on production URL
   - [ ] Verify all forms are working
   - [ ] Check for 404 errors
   - [ ] Test on multiple devices and browsers

3. **Monitoring**
   - [ ] Set up uptime monitoring
   - [ ] Configure error tracking
   - [ ] Set up backup schedule

## Post-Launch Tasks

1. **SEO**
   - [ ] Submit sitemap to search engines
   - [ ] Set up Google Search Console
   - [ ] Verify meta tags and structured data

2. **Documentation**
   - [ ] Update any internal documentation
   - [ ] Document any custom configurations
   - [ ] Create a rollback plan

3. **Team Training**
   - [ ] Train team on content updates
   - [ ] Document workflow processes
   - [ ] Set up user accounts and permissions

## Emergency Contacts

- Web Host Support: [Contact Info]
- Domain Registrar: [Contact Info]
- Development Team: [Contact Info]
- GoHighLevel Support: support@gohighlevel.com
