# SuiteKeep Support Website

A beautiful, interactive support website for the SuiteKeep concert suite management app.

## Features

- 🎨 **Modern Design**: Beautiful gradient backgrounds, smooth animations, and responsive layout
- 📱 **Interactive Guide**: Comprehensive user guide with tabbed sections and step-by-step instructions
- ❓ **FAQ Section**: Expandable accordion with common questions and answers
- 🎫 **Support Tickets**: Professional ticket submission system with email integration
- 🚀 **Performance**: Optimized loading, lazy loading images, and smooth scrolling
- 📧 **Email Integration**: Automated email notifications for both customer and support team

## Setup Instructions

### Requirements
- Web server with PHP support (Apache, Nginx, etc.)
- PHP 7.4 or higher
- Mail server configuration (for email sending)

### Installation

1. **Upload Files**
   ```bash
   # Upload the entire /support directory to your web server
   # Example directory structure:
   /var/www/html/suitekeeper.com/support/
   ├── index.html
   ├── form-handler.php
   ├── assets/
   │   ├── css/styles.css
   │   ├── js/main.js
   │   └── images/ (add your screenshots here)
   └── README.md
   ```

2. **Configure Email Settings**
   
   Edit `form-handler.php` and update these settings:
   ```php
   $to_email = 'MikeMyersCo@Gmail.com';           // Your support email
   $from_email = 'noreply@yourdomain.com';       // From email (should be from your domain)
   ```

3. **Set File Permissions**
   ```bash
   chmod 755 support/
   chmod 644 support/*.html support/*.php
   chmod 644 support/assets/css/* support/assets/js/*
   chmod 755 support/assets/images/
   ```

4. **Configure PHP Mail**
   
   For basic PHP mail to work, your server needs:
   - Sendmail or similar mail transfer agent
   - Proper DNS/SPF records for your domain
   - PHP mail() function enabled

   **Alternative Email Solutions:**
   - **SMTP**: Use PHPMailer with SMTP (Gmail, SendGrid, etc.)
   - **Email Services**: Integrate with SendGrid, Mailgun, or similar
   - **Contact Forms**: Use services like Formspree, Netlify Forms

5. **Add Screenshots**
   
   Add your app screenshots to `/assets/images/`:
   - `app-preview.png` - Main app preview for hero section
   - `settings-screen.png` - Settings screen screenshot
   - `add-concert.png` - Add concert dialog
   - `seat-selection.png` - Seat selection interface

### Email Service Integration

#### Option 1: Using PHPMailer with SMTP
```bash
composer require phpmailer/phpmailer
```

Then update `form-handler.php` to use SMTP instead of PHP mail().

#### Option 2: Using Formspree (Easiest)
1. Sign up at [Formspree.io](https://formspree.io)
2. Create a new form and get your endpoint URL
3. Update `index.html` form action to your Formspree endpoint
4. Remove or rename `form-handler.php`

#### Option 3: Using SendGrid API
```bash
composer require sendgrid/sendgrid
```

Update `form-handler.php` to use SendGrid API for reliable email delivery.

### Testing

1. **Local Testing**
   ```bash
   # Start a local PHP server for testing
   cd support/
   php -S localhost:8000
   ```

2. **Form Testing**
   - Fill out and submit the support form
   - Check server logs for any PHP errors
   - Verify emails are being sent/received

3. **Mobile Testing**
   - Test on various screen sizes
   - Check touch interactions
   - Verify form usability on mobile

### Customization

#### Colors and Branding
Edit `assets/css/styles.css` and update CSS variables:
```css
:root {
    --primary-color: #5B3FFF;      /* Your brand primary color */
    --secondary-color: #FF3F8E;     /* Your brand secondary color */
    --accent-color: #00D4FF;        /* Your brand accent color */
}
```

#### Content Updates
- Update company information in `index.html`
- Modify FAQ questions and answers
- Update user guide content for your specific app features
- Replace placeholder text with your actual content

#### Adding Screenshots
1. Take screenshots of your app (preferably 2x resolution for retina displays)
2. Optimize images using tools like TinyPNG or ImageOptim
3. Add them to `assets/images/` directory
4. Update image paths in HTML if needed

### Security Considerations

1. **Form Protection**
   - Add CSRF protection
   - Implement rate limiting
   - Add spam protection (reCAPTCHA)
   - Sanitize all inputs (already implemented)

2. **Server Security**
   - Keep PHP updated
   - Use HTTPS
   - Implement proper error handling
   - Hide PHP version information

3. **Email Security**
   - Use SPF/DKIM records
   - Validate email headers
   - Prevent email injection attacks (implemented)

### SEO Optimization

The website includes:
- Semantic HTML structure
- Meta tags for social sharing
- Proper heading hierarchy
- Alt text for images (add to your screenshots)
- Fast loading times
- Mobile-friendly design

### Analytics

Consider adding:
- Google Analytics
- Hotjar for user behavior analysis
- Form conversion tracking
- Support ticket metrics

### Maintenance

- Monitor support ticket logs
- Update content as app features change
- Check for broken links and form functionality
- Update FAQ based on common support requests
- Keep dependencies updated

## File Structure

```
support/
├── index.html              # Main website
├── form-handler.php        # Server-side form processing
├── support_tickets.log     # Log file (auto-created)
├── README.md              # This file
└── assets/
    ├── css/
    │   └── styles.css     # Main stylesheet
    ├── js/
    │   └── main.js        # JavaScript functionality
    └── images/            # Screenshots and graphics
        ├── app-preview.png
        ├── settings-screen.png
        ├── add-concert.png
        └── seat-selection.png
```

## Support

For questions about this support website setup, contact the development team.

## License

This support website is part of the SuiteKeep project. All rights reserved.