/**
 * HomeMAXX Form Handler
 * Handles form submission for the contact form with loading states and success/error messages
 */

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    const submitButton = document.getElementById('submit-button');
    const buttonText = submitButton ? submitButton.querySelector('.button-text') : null;
    const spinner = submitButton ? submitButton.querySelector('.spinner-border') : null;
    
    if (!contactForm) return;

    // Initialize form validation
    contactForm.addEventListener('submit', handleFormSubmit);
    
    // Format phone number as user types
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhoneNumber);
    }

    // Handle form submission
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        // Validate form
        if (!contactForm.checkValidity()) {
            // Show validation errors
            contactForm.classList.add('was-validated');
            return;
        }

        // Show loading state
        if (submitButton && buttonText && spinner) {
            submitButton.disabled = true;
            buttonText.textContent = 'Submitting...';
            spinner.classList.remove('d-none');
        }

        try {
            const formData = new FormData(contactForm);
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Show success message
                showAlert('Thank you! Your information has been submitted successfully. We\'ll be in touch soon!', 'success');
                contactForm.reset();
                contactForm.classList.remove('was-validated');
                
                // Track form submission in analytics if available
                if (window.gtag) {
                    gtag('event', 'conversion', {
                        'send_to': 'AW-YOUR-CONVERSION-ID',
                        'event_callback': function() {}
                    });
                }
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            showAlert('There was an error submitting your form. Please try again or contact us directly.', 'error');
        } finally {
            // Reset button state
            if (submitButton && buttonText && spinner) {
                submitButton.disabled = false;
                buttonText.textContent = 'Get My Cash Offer';
                spinner.classList.add('d-none');
            }
        }
    }

    // Helper function to format phone numbers
    function formatPhoneNumber(e) {
        // Remove all non-digit characters
        let phoneNumber = e.target.value.replace(/\D/g, '');
        
        // Format as (XXX) XXX-XXXX
        if (phoneNumber.length > 3 && phoneNumber.length <= 6) {
            phoneNumber = `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
        } else if (phoneNumber.length > 6) {
            phoneNumber = `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
        }
        
        e.target.value = phoneNumber;
    }

    // Helper function to show alerts
    function showAlert(message, type = 'info') {
        // Remove any existing alerts
        const existingAlert = document.querySelector('.form-alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        // Create alert element
        const alert = document.createElement('div');
        alert.className = `form-alert alert alert-${type} mt-3`;
        alert.role = 'alert';
        alert.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2"></i>
                <span>${message}</span>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        // Insert after the form
        contactForm.parentNode.insertBefore(alert, contactForm.nextSibling);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            alert.classList.add('fade-out');
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    }
});
