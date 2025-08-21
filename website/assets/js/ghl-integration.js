/**
 * GoHighLevel CRM Integration
 * Handles form submissions and integrates with GoHighLevel's webhook
 */

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    // Update the form action with your actual GHL webhook URL
    const GHL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/MyNhX7NAs8SVM9vQMbqZ/webhook-trigger/cad6f75b-e78a-4fb9-8e72-bc9eaf37fe8d';
    
    // Update the form action URL
    contactForm.action = GHL_WEBHOOK_URL;

    // Add hidden fields for GHL
    const hiddenFields = [
        { name: 'status', value: 'New Lead' },
        { name: 'leadSource', value: 'Website Form' },
        { name: 'website', value: window.location.href }
    ];

    // Add hidden fields to the form
    hiddenFields.forEach(field => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = field.name;
        input.value = field.value;
        contactForm.appendChild(input);
    });

    // Form submission handler
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = this.querySelector('button[type="submit"]');
        const buttonText = submitButton.querySelector('.button-text');
        const spinner = submitButton.querySelector('.spinner-border');
        
        // Show loading state
        submitButton.disabled = true;
        buttonText.textContent = 'Processing...';
        spinner.classList.remove('d-none');

        try {
            // Submit the form data to GHL
            const formData = new FormData(this);
            const response = await fetch(GHL_WEBHOOK_URL, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            // Handle the response
            if (response.ok) {
                showAlert('success', 'Thank you! Your information has been submitted successfully. We\'ll be in touch soon!');
                contactForm.reset();
                // Emit success event for funnel controller
                try {
                    document.dispatchEvent(new CustomEvent('ghl:submit:success', { detail: { status: 'ok' } }));
                } catch (_) {}
            } else {
                throw new Error('Failed to submit form');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            showAlert('danger', 'There was an error submitting your form. Please try again or contact us directly at info@homemaxx.llc');
            // Emit error event
            try {
                document.dispatchEvent(new CustomEvent('ghl:submit:error', { detail: { error: String(error) } }));
            } catch (_) {}
        } finally {
            // Reset button state
            submitButton.disabled = false;
            buttonText.textContent = 'Get My Cash Offer';
            spinner.classList.add('d-none');
        }
    });
    
    // Show alert message
    function showAlert(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `form-alert alert alert-${type} alert-dismissible fade show`;
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Add styles if not already present
        if (!document.getElementById('alert-styles')) {
            const style = document.createElement('style');
            style.id = 'alert-styles';
            style.textContent = `
                .form-alert {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 1100;
                    max-width: 400px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    opacity: 1;
                    transition: opacity 0.3s ease;
                }
                .form-alert.fade-out {
                    opacity: 0;
                }
                .form-alert .btn-close {
                    margin-left: 1rem;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add to page
        document.body.appendChild(alertDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            alertDiv.classList.add('fade-out');
            setTimeout(() => alertDiv.remove(), 300);
        }, 5000);
        
        // Close button functionality
        const closeBtn = alertDiv.querySelector('.btn-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                alertDiv.classList.add('fade-out');
                setTimeout(() => alertDiv.remove(), 300);
            });
        }
    }
});
