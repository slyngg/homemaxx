/**
 * GoHighLevel CRM Integration
 * Handles form submissions and integrates with GoHighLevel's webhook
 * Now includes lead priority scoring data
 */

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    // Update the form action with your actual GHL webhook URL
    const GHL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/MyNhX7NAs8SVM9vQMbqZ/webhook-trigger/cad6f75b-e78a-4fb9-8e72-bc9eaf37fe8d';
    
    // Update the form action URL
    contactForm.action = GHL_WEBHOOK_URL;

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
            // Get form data
            const formData = new FormData(this);
            const jsonData = {};
            for (let [key, value] of formData.entries()) {
                jsonData[key] = value;
            }

            // Calculate priority score before sending to GHL
            const priorityData = await calculateLeadPriority(jsonData);
            
            // Add priority scoring data as custom fields for GHL
            const ghlData = {
                ...jsonData,
                // Standard fields
                status: 'New Lead',
                leadSource: 'Website Funnel',
                website: window.location.href,
                submittedAt: new Date().toISOString(),
                
                // Priority scoring custom fields
                priority_score: priorityData.score,
                priority_level: priorityData.level,
                priority_color: priorityData.color,
                wholesale_margin: priorityData.wholesaleMargin,
                margin_percentage: priorityData.marginPercentage,
                priority_recommendations: priorityData.recommendations.join(' | '),
                
                // Breakdown for detailed analysis
                margin_score: priorityData.breakdown?.marginScore || 0,
                deal_size_score: priorityData.breakdown?.dealSizeScore || 0,
                timeline_score: priorityData.breakdown?.timelineScore || 0,
                cash_offer_score: priorityData.breakdown?.cashOfferScore || 0,
                condition_score: priorityData.breakdown?.conditionScore || 0,
                location_score: priorityData.breakdown?.locationScore || 0
            };
            
            console.log('Submitting to GHL with priority data:', ghlData);
            
            const response = await fetch(GHL_WEBHOOK_URL, {
                method: 'POST',
                body: JSON.stringify(ghlData),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            // Handle the response
            if (response.ok) {
                showAlert('success', 'Thank you! Your information has been submitted successfully. We\'ll be in touch soon!');
                contactForm.reset();
                
                // Show priority-based message to user
                if (priorityData.score >= 80) {
                    showAlert('info', ' High-priority lead detected! Expect a call within 1 hour.');
                } else if (priorityData.score >= 65) {
                    showAlert('info', ' Great opportunity! We\'ll contact you within 4 hours.');
                }
                
                // Emit success event for funnel controller
                document.dispatchEvent(new CustomEvent('ghl:submit:success', { 
                    detail: { status: 'ok', priorityData } 
                }));
            } else {
                throw new Error('Failed to submit form');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            showAlert('danger', 'There was an error submitting your form. Please try again or contact us directly at info@homemaxx.llc');
            document.dispatchEvent(new CustomEvent('ghl:submit:error', { 
                detail: { error: String(error) } 
            }));
        } finally {
            // Reset button state
            submitButton.disabled = false;
            buttonText.textContent = 'Get My Cash Offer';
            spinner.classList.add('d-none');
        }
    });
    
    // Calculate lead priority using the same logic as the backend
    async function calculateLeadPriority(formData) {
        try {
            // Call the calculate-offer function to get priority data
            const response = await fetch('/.netlify/functions/calculate-offer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                const offerData = await response.json();
                return offerData.leadPriorityScore || getDefaultPriority();
            } else {
                return getDefaultPriority();
            }
        } catch (error) {
            console.error('Priority calculation error:', error);
            return getDefaultPriority();
        }
    }
    
    // Fallback priority data
    function getDefaultPriority() {
        return {
            score: 50,
            level: 'STANDARD',
            color: '#6c757d',
            wholesaleMargin: '$0',
            marginPercentage: '0.0%',
            recommendations: ['Manual review required'],
            breakdown: {
                marginScore: 0,
                dealSizeScore: 0,
                timelineScore: 0,
                cashOfferScore: 0,
                conditionScore: 0,
                locationScore: 0
            }
        };
    }
    
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
