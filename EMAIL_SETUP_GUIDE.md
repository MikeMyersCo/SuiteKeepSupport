# Email Setup Guide for SuiteKeep Support

Your support form now supports multiple email methods with automatic fallbacks. Here are your options:

## Option 1: Formspree (Recommended - Easiest)

**Cost:** Free for up to 50 submissions/month, then $8/month

**Setup Steps:**
1. Go to [formspree.io](https://formspree.io)
2. Sign up with your email
3. Create a new form
4. Copy your form endpoint (looks like: `https://formspree.io/f/xvgpkrby`)
5. Replace `YOUR_FORM_ID` in `index.html` line 455 with your form ID

**In index.html, change this line:**
```html
<form id="supportForm" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

**To this (with your actual form ID):**
```html
<form id="supportForm" action="https://formspree.io/f/xvgpkrby" method="POST">
```

That's it! No server configuration needed.

---

## Option 2: EmailJS (Client-side only)

**Cost:** Free for up to 200 emails/month, then $15/month

**Setup Steps:**
1. Go to [emailjs.com](https://www.emailjs.com)
2. Sign up and create a service (Gmail, Outlook, etc.)
3. Create an email template
4. Get your Public Key, Service ID, and Template ID
5. Update the JavaScript configuration

**In main.js, uncomment and update these lines:**
```javascript
// Initialize EmailJS (uncomment and configure when ready)
emailjs.init('YOUR_PUBLIC_KEY'); // Replace with your EmailJS public key
window.EMAILJS_CONFIGURED = true;
```

**And update the service/template IDs:**
```javascript
emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
```

---

## Option 3: Simple Mailto Fallback (Always Works)

If both above methods fail, the form automatically opens the user's email client with a pre-filled message to MikeMyersCo@Gmail.com.

---

## Current Status

- ✅ All three methods are implemented
- ✅ Automatic fallback system in place
- ✅ Form validation included
- ⏳ You need to configure either Formspree OR EmailJS

## Recommendation

**Start with Formspree** - it's the easiest to set up and most reliable. Just replace the form action URL and you're done!

## Testing

After setup, test the form to ensure emails are being received at MikeMyersCo@Gmail.com.