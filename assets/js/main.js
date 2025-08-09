// Main JavaScript file for SuiteKeep Support

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initScrollEffects();
    initTabSystem();
    initFAQ();
    initSupportForm();
    initAnimations();
});

// Navigation functionality
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerOffset = 80;
                const elementPosition = targetSection.offsetTop;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
            
            // Close mobile menu if open
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Update active nav link based on scroll position
    window.addEventListener('scroll', function() {
        let current = '';
        const sections = document.querySelectorAll('section[id]');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Scroll effects
function initScrollEffects() {
    const backToTopBtn = document.getElementById('backToTop');
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Back to top button
        if (scrollTop > 500) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }

        // Navbar background opacity
        if (scrollTop > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });

    // Back to top click handler
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Tab system for user guide
function initTabSystem() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button and corresponding pane
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Scroll to tabs section
            const tabsSection = document.querySelector('.guide-tabs');
            const headerOffset = 100;
            const elementPosition = tabsSection.offsetTop;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        });
    });
}

// FAQ accordion functionality
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items
            faqItems.forEach(faq => {
                faq.classList.remove('active');
            });
            
            // If this item wasn't active, open it
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// Support form functionality
function initSupportForm() {
    const form = document.getElementById('supportForm');
    const formMessage = document.getElementById('formMessage');

    console.log('Initializing support form...', form); // Debug log

    if (form) {
        console.log('Form found, adding event listener'); // Debug log
        
        form.addEventListener('submit', function(e) {
            console.log('Form submitted!'); // Debug log
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            console.log('Form data:', data); // Debug log
            
            // Validate form data
            const errors = validateForm(data);
            console.log('Validation errors:', errors); // Debug log
            
            if (errors.length > 0) {
                showFormMessage(errors.join(', '), 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            console.log('Calling submitToFormspree...'); // Debug log
            
            // For now, bypass Formspree and go straight to mailto fallback for testing
            console.log('Bypassing Formspree, using mailto fallback');
            resetButton(submitBtn, originalText);
            showFormMessage('Opening your email client with the support request...', 'success');
            setTimeout(() => {
                sendEmailFallback(data);
            }, 1000);
        });
    } else {
        console.error('Support form not found!'); // Debug log
    }
    
    // Check for success parameter in URL
    checkForSuccessMessage();
}

// Submit form to Formspree
function submitToFormspree(form, data, submitBtn, originalText) {
    console.log('submitToFormspree called with:', form.action); // Debug log
    
    // Create FormData with all the form fields
    const formData = new FormData(form);
    
    // Add dynamic subject line with category and subject
    formData.set('_subject', `SuiteKeep Support - ${data.category || 'General'}: ${data.subject}`);
    
    console.log('Making fetch request to:', form.action); // Debug log
    
    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        console.log('Fetch response:', response); // Debug log
        resetButton(submitBtn, originalText);
        
        if (response.ok) {
            console.log('Response OK, showing success message'); // Debug log
            showFormMessage('Thank you! Your support request has been sent successfully. We\'ll respond within 48 hours.', 'success');
            form.reset();
        } else {
            console.log('Response not OK:', response.status); // Debug log
            response.json().then(responseData => {
                console.log('Error response data:', responseData); // Debug log
                if (responseData.errors) {
                    showFormMessage('Form submission error: ' + responseData.errors.map(error => error.message).join(', '), 'error');
                } else {
                    sendEmailFallback(data);
                }
            });
        }
    })
    .catch(error => {
        console.error('Formspree submission error:', error);
        resetButton(submitBtn, originalText);
        
        // Fallback to mailto
        showFormMessage('There was a problem submitting your request. Opening your email client as a backup...', 'error');
        setTimeout(() => {
            sendEmailFallback(data);
        }, 2000);
    });
}

// Check for success message in URL parameters
function checkForSuccessMessage() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === '1') {
        showFormMessage('Thank you! Your support request has been sent successfully. We\'ll respond within 48 hours.', 'success');
        
        // Clean up URL
        const url = new URL(window.location);
        url.searchParams.delete('success');
        window.history.replaceState({}, document.title, url);
        
        // Scroll to form
        document.getElementById('support').scrollIntoView({ behavior: 'smooth' });
    }
}


// Helper function to reset button state
function resetButton(submitBtn, originalText) {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
}

// Email fallback function
function sendEmailFallback(data) {
    const subject = encodeURIComponent(`SuiteKeep Support: ${data.subject || 'Support Request'}`);
    const body = encodeURIComponent(`
Name: ${data.name || 'Not provided'}
Email: ${data.email || 'Not provided'}
Category: ${data.category || 'Not provided'}
Device: ${data.device || 'Not provided'}
Subject: ${data.subject || 'Not provided'}

Message:
${data.message || 'No message provided'}

---
This email was sent from the SuiteKeep Support website.
    `);
    
    const mailtoLink = `mailto:suitekeep25@gmail.com?subject=${subject}&body=${body}`;
    
    // Open default email client
    const a = document.createElement('a');
    a.href = mailtoLink;
    a.click();
}

// Show form message
function showFormMessage(message, type) {
    const formMessage = document.getElementById('formMessage');
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    
    setTimeout(() => {
        formMessage.style.display = 'none';
    }, 5000);
}

// Animation initialization
function initAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Floating animation for hero shapes
    const floatingShapes = document.querySelectorAll('.floating-shape');
    floatingShapes.forEach((shape, index) => {
        shape.style.animationDelay = `${index * 2}s`;
    });

    // Parallax effect for hero background
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.floating-shape');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });

    // Typewriter effect for hero title
    typewriterEffect();
}

// Typewriter effect
function typewriterEffect() {
    const text = 'SuiteKeep';
    const element = document.querySelector('.gradient-text');
    
    if (element) {
        element.textContent = '';
        let index = 0;
        
        function typeCharacter() {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(typeCharacter, 150);
            }
        }
        
        setTimeout(typeCharacter, 1000);
    }
}

// Form validation
function validateForm(formData) {
    const errors = [];
    
    if (!formData.name || formData.name.trim().length < 2) {
        errors.push('Please enter your name');
    }
    
    if (!formData.email || !isValidEmail(formData.email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (!formData.subject || formData.subject.trim().length < 5) {
        errors.push('Please enter a subject (minimum 5 characters)');
    }
    
    if (!formData.message || formData.message.trim().length < 10) {
        errors.push('Please provide more details in your message (minimum 10 characters)');
    }
    
    return errors;
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Smooth reveal animation for sections
function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');
    
    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('active');
        }
    });
}

window.addEventListener('scroll', revealOnScroll);

// Search functionality for FAQ
function initFAQSearch() {
    const searchInput = document.getElementById('faqSearch');
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question h4').textContent.toLowerCase();
                const answer = item.querySelector('.faq-answer p').textContent.toLowerCase();
                
                if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
}

// Initialize tooltips
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltipText = this.getAttribute('data-tooltip');
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = tooltipText;
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
        });
        
        element.addEventListener('mouseleave', function() {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
}

// Performance optimization - lazy loading
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Dark mode toggle (future feature)
function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            
            // Save preference
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode);
        });
        
        // Load saved preference
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode === 'true') {
            document.body.classList.add('dark-mode');
        }
    }
}

// Error handling
window.addEventListener('error', function(e) {
    console.log('Error caught:', e.error);
    // Could send error reports to analytics here
});

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateForm,
        isValidEmail,
        showFormMessage
    };
}