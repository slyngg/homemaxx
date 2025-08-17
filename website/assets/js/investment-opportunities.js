/**
 * HomeMaxx Investment Opportunities
 * Handles the display and interaction with investment properties
 */

document.addEventListener('DOMContentLoaded', function() {
    const propertiesContainer = document.getElementById('investment-properties');
    if (!propertiesContainer) return;
    
    // Sample data - In a real implementation, this would come from a backend API
    const sampleProperties = [
        {
            id: 1,
            title: 'Modern Downtown Condo',
            address: '123 Main St, Anytown, USA',
            price: '$250,000',
            roi: '8.5%',
            type: 'Condo',
            beds: 2,
            baths: 2,
            sqft: '1,200',
            image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            description: 'Modern downtown condo with great amenities and high rental demand. This property features an open floor plan, stainless steel appliances, and a private balcony with city views. Located in a vibrant neighborhood with easy access to restaurants, shopping, and public transportation.',
            features: ['Modern kitchen with quartz countertops', 'In-unit washer/dryer', 'Fitness center', 'Rooftop deck', '24/7 security'],
            capRate: '6.8%',
            cashFlow: '$1,450/mo',
            yearBuilt: 2020,
            status: 'Available',
            gallery: [
                'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            id: 2,
            title: 'Suburban Family Home',
            address: '456 Oak Ave, Suburbia, USA',
            price: '$350,000',
            roi: '7.2%',
            type: 'Single Family',
            beds: 4,
            baths: 2.5,
            sqft: '2,400',
            image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            description: 'Spacious family home in a quiet neighborhood with great schools. This property features a large backyard, updated kitchen, and a two-car garage. Perfect for families looking for a comfortable living space in a safe community.',
            features: ['Updated kitchen with stainless steel appliances', 'Hardwood floors throughout', 'Large backyard with deck', 'Two-car garage', 'Finished basement'],
            capRate: '7.2%',
            cashFlow: '$1,850/mo',
            yearBuilt: 2015,
            status: 'Under Contract',
            gallery: [
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1600585154526-990dced4cf0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            id: 3,
            title: 'Duplex Investment',
            address: '789 Elm St, Cityville, USA',
            price: '$420,000',
            roi: '9.1%',
            type: 'Multi-Family',
            beds: '4 (2 per unit)',
            baths: '4 (2 per unit)',
            sqft: '2,800',
            image: 'https://images.unsplash.com/photo-1583608205776-bb35b2b78689?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            description: 'Income-generating duplex with long-term tenants in place. This property features two identical units, each with 2 bedrooms and 2 bathrooms. Tenants are responsible for all utilities. Great cash flow opportunity with minimal landlord responsibilities.',
            features: ['Two identical units', 'Separate utilities', 'Off-street parking', 'Laundry hookups in each unit', 'Low maintenance yard'],
            capRate: '9.1%',
            cashFlow: '$3,200/mo',
            yearBuilt: 2010,
            status: 'Available',
            gallery: [
                'https://images.unsplash.com/photo-1583608205776-bb35b2b78689?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1600585154173-1e6d20d60b1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1600585154166-a8e7f21d3b3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ]
        }
    ];

    // Function to create property card HTML
    function createPropertyCard(property) {
        const statusClass = property.status.toLowerCase().replace(/\s+/g, '-');
        const isAvailable = property.status === 'Available';
        
        return `
            <div class="property-card" data-id="${property.id}">
                <div class="property-image">
                    <img src="${property.image}" alt="${property.title}" loading="lazy">
                    <div class="property-badge ${statusClass}">${property.status}</div>
                    ${!isAvailable ? `<div class="property-overlay"><span>${property.status}</span></div>` : ''}
                </div>
                <div class="property-details">
                    <div class="property-header">
                        <h3>${property.title}</h3>
                        <p class="property-address">
                            <i class="fas fa-map-marker-alt"></i> ${property.address}
                        </p>
                    </div>
                    
                    <div class="property-features">
                        <span><i class="fas fa-bed"></i> ${property.beds} Beds</span>
                        <span><i class="fas fa-bath"></i> ${property.baths} Baths</span>
                        <span><i class="fas fa-ruler-combined"></i> ${property.sqft} sqft</span>
                    </div>
                    
                    <div class="property-meta">
                        <div class="meta-item">
                            <span class="meta-label">Price</span>
                            <span class="meta-value">${property.price}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Projected ROI</span>
                            <span class="meta-value highlight">${property.roi}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Cap Rate</span>
                            <span class="meta-value">${property.capRate}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Monthly Cash Flow</span>
                            <span class="meta-value highlight">${property.cashFlow}</span>
                        </div>
                    </div>
                    
                    <div class="property-description">
                        <p>${property.description.substring(0, 150)}...</p>
                    </div>
                    
                    <div class="property-actions">
                        <button class="btn btn-outline view-details" data-id="${property.id}">
                            <i class="fas fa-search-plus"></i> View Details
                        </button>
                        <a href="contact.html?property=${encodeURIComponent(property.title)}&type=investment" 
                           class="btn btn-primary"
                           ${!isAvailable ? 'disabled' : ''}>
                            <i class="fas fa-chart-line"></i> ${isAvailable ? 'Invest Now' : 'Contact for Similar'}
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    // Function to render properties
    function renderProperties(properties) {
        if (!propertiesContainer) return;
        
        // Clear existing content
        propertiesContainer.innerHTML = '';
        
        // Add loading state
        propertiesContainer.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        
        // Simulate API delay
        setTimeout(() => {
            if (properties.length === 0) {
                propertiesContainer.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">No investment properties available at the moment. Please check back later.</p></div>';
                return;
            }
            
            // Render properties
            propertiesContainer.innerHTML = '';
            properties.forEach(property => {
                const propertyCard = createPropertyCard(property);
                propertiesContainer.insertAdjacentHTML('beforeend', propertyCard);
            });
            
            // Add event listeners to view details buttons
            document.querySelectorAll('.view-details').forEach(button => {
                button.addEventListener('click', function() {
                    const propertyId = parseInt(this.getAttribute('data-id'));
                    const property = properties.find(p => p.id === propertyId);
                    if (property) {
                        showPropertyModal(property);
                    }
                });
            });
            
            // Initialize tooltips
            if (window.bootstrap && window.bootstrap.Tooltip) {
                const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
                tooltipTriggerList.map(function (tooltipTriggerEl) {
                    return new window.bootstrap.Tooltip(tooltipTriggerEl);
                });
            }
        }, 500);
    }

    // Function to show property details in a modal
    function showPropertyModal(property) {
        // Format features list
        const featuresList = property.features.map(feature => `<li><i class="fas fa-check text-primary"></i> ${feature}</li>`).join('');
        
        // Format gallery images
        const galleryImages = property.gallery.map((img, index) => `
            <div class="gallery-item ${index === 0 ? 'active' : ''}">
                <img src="${img}" alt="${property.title} - Image ${index + 1}" class="img-fluid rounded">
            </div>
        `).join('');
        
        // Format gallery navigation
        const galleryNavHtml = property.gallery.map((_, index) => `
            <button class="gallery-nav-item ${index === 0 ? 'active' : ''}" data-index="${index}">
                <img src="${property.gallery[index]}" alt="Thumbnail ${index + 1}">
            </button>
        `).join('');
        
        // Create modal HTML
        const modalHTML = `
            <div class="modal" id="propertyModal" tabindex="-1" role="dialog" aria-labelledby="propertyModalLabel" aria-hidden="true">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title" id="propertyModalLabel">${property.title}</h2>
                        <button type="button" class="btn-close" aria-label="Close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="property-gallery-container">
                            <div class="property-gallery">
                                ${galleryImages}
                            </div>
                            ${property.gallery.length > 1 ? `
                            <div class="gallery-nav">
                                ${galleryNavHtml}
                            </div>
                            ` : ''}
                        </div>
                        
                        <div class="property-details-grid">
                            <div class="property-info">
                                <div class="property-header">
                                    <h3>${property.title}</h3>
                                    <p class="property-address">
                                        <i class="fas fa-map-marker-alt"></i> ${property.address}
                                    </p>
                                    <div class="property-status ${property.status.toLowerCase().replace(/\s+/g, '-')}">
                                        ${property.status}
                                    </div>
                                </div>
                                
                                <div class="property-highlights">
                                    <div class="highlight-item">
                                        <div class="highlight-value">${property.price}</div>
                                        <div class="highlight-label">Price</div>
                                    </div>
                                    <div class="highlight-item">
                                        <div class="highlight-value">${property.roi}</div>
                                        <div class="highlight-label">Projected ROI</div>
                                    </div>
                                    <div class="highlight-item">
                                        <div class="highlight-value">${property.capRate}</div>
                                        <div class="highlight-label">Cap Rate</div>
                                    </div>
                                    <div class="highlight-item">
                                        <div class="highlight-value">${property.cashFlow}</div>
                                        <div class="highlight-label">Monthly Cash Flow</div>
                                    </div>
                                </div>
                                
                                <div class="property-description">
                                    <h4>Property Description</h4>
                                    <p>${property.description}</p>
                                </div>
                                
                                <div class="property-features-list">
                                    <h4>Features</h4>
                                    <ul class="features-grid">
                                        ${featuresList}
                                    </ul>
                                </div>
                                
                                <div class="property-actions">
                                    <a href="contact.html?property=${encodeURIComponent(property.title)}&type=investment" class="btn btn-primary">
                                        <i class="fas fa-chart-line"></i> Invest Now
                                    </a>
                                    <button class="btn btn-outline schedule-tour" data-property-id="${property.id}">
                                        <i class="fas fa-calendar-alt"></i> Schedule Tour
                                    </button>
                                    <button class="btn btn-icon print-property">
                                        <i class="fas fa-print"></i>
                                    </button>
                                    <button class="btn btn-icon share-property">
                                        <i class="fas fa-share-alt"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="property-sidebar">
                                <div class="investment-calculator">
                                    <h4>Investment Calculator</h4>
                                    <div class="form-group">
                                        <label>Investment Amount ($)</label>
                                        <input type="number" class="form-control" value="50000" min="10000" step="5000">
                                    </div>
                                    <div class="form-group">
                                        <label>Investment Term (years)</label>
                                        <select class="form-control">
                                            <option>5 years</option>
                                            <option>10 years</option>
                                            <option>15 years</option>
                                            <option>20 years</option>
                                        </select>
                                    </div>
                                    <div class="calculator-results">
                                        <div class="result-item">
                                            <span class="result-label">Projected Return</span>
                                            <span class="result-value">$87,500</span>
                                        </div>
                                        <div class="result-item highlight">
                                            <span class="result-label">Annualized Return</span>
                                            <span class="result-value">${property.roi}</span>
                                        </div>
                                    </div>
                                    <button class="btn btn-outline btn-block">
                                        <i class="fas fa-download"></i> Download Full Report
                                    </button>
                                </div>
                                
                                <div class="property-agent">
                                    <h4>Investment Specialist</h4>
                                    <div class="agent-card">
                                        <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Investment Specialist" class="agent-photo">
                                        <div class="agent-info">
                                            <h5>Michael Chen</h5>
                                            <p class="agent-title">Senior Investment Advisor</p>
                                            <p class="agent-contact">
                                                <i class="fas fa-phone-alt"></i> (555) 123-4567<br>
                                                <i class="fas fa-envelope"></i> michael@homemaxx.llc
                                            </p>
                                        </div>
                                    </div>
                                    <button class="btn btn-primary btn-block contact-agent" data-agent="Michael Chen">
                                        <i class="fas fa-comment-alt"></i> Contact Advisor
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-backdrop"></div>
        `;
        
        // Add modal to the page
        const modalContainer = document.createElement('div');
        modalContainer.id = 'propertyModalContainer';
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        document.body.style.overflow = 'hidden';
        
        // Cache DOM elements
        const modal = document.getElementById('propertyModal');
        const closeButton = modal?.querySelector('.btn-close');
        const backdrop = modal?.querySelector('.modal-backdrop');
        const gallery = modal?.querySelector('.property-gallery');
        const galleryNav = modal?.querySelector('.gallery-nav');
        const printBtn = modal?.querySelector('.print-property');
        const shareBtn = modal?.querySelector('.share-property');
        const scheduleTourBtn = modal?.querySelector('.schedule-tour');
        const contactAgentBtn = modal?.querySelector('.contact-agent');
        const calculatorInput = modal?.querySelector('.investment-calculator input');
        
        // Close modal function
        function closeModal() {
            modal.classList.add('fade-out');
            if (backdrop) backdrop.classList.add('fade-out');
            
            setTimeout(() => {
                modal.remove();
                if (backdrop) backdrop.remove();
                document.body.style.overflow = '';
                document.removeEventListener('keydown', handleEscKey);
            }, 300);
        }
        
        // Handle gallery navigation
        if (galleryNav) {
            const navItems = galleryNav.querySelectorAll('.gallery-nav-item');
            const galleryItems = gallery.querySelectorAll('.gallery-item');
            
            navItems.forEach((item, index) => {
                item.addEventListener('click', () => {
                    // Update active state
                    navItems.forEach(i => i.classList.remove('active'));
                    galleryItems.forEach(i => i.classList.remove('active'));
                    
                    item.classList.add('active');
                    galleryItems[index].classList.add('active');
                    
                    // Smooth scroll to selected image
                    gallery.scrollTo({
                        left: galleryItems[index].offsetLeft - gallery.offsetWidth / 2 + galleryItems[index].offsetWidth / 2,
                        behavior: 'smooth'
                    });
                });
            });
            
            // Auto-advance gallery
            let galleryInterval = setInterval(() => {
                if (!document.body.contains(modal)) {
                    clearInterval(galleryInterval);
                    return;
                }
                
                const activeIndex = Array.from(navItems).findIndex(item => 
                    item.classList.contains('active')
                );
                const nextIndex = (activeIndex + 1) % navItems.length;
                navItems[nextIndex].click();
            }, 5000);
        }
        
        // Handle print functionality
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                window.print();
            });
        }
        
        // Handle share functionality
        if (shareBtn) {
            shareBtn.addEventListener('click', async () => {
                try {
                    await navigator.share({
                        title: property.title,
                        text: `Check out this investment opportunity: ${property.title} - ${property.price}`,
                        url: window.location.href
                    });
                } catch (err) {
                    // Fallback for browsers that don't support Web Share API
                    const shareUrl = `${window.location.origin}${window.location.pathname}?property=${encodeURIComponent(property.title)}`;
                    await navigator.clipboard.writeText(shareUrl);
                    alert('Link copied to clipboard!');
                }
            });
        }
        
        // Handle schedule tour
        if (scheduleTourBtn) {
            scheduleTourBtn.addEventListener('click', () => {
                closeModal();
                window.location.href = `contact.html?property=${encodeURIComponent(property.title)}&type=tour`;
            });
        }
        
        // Handle contact agent
        if (contactAgentBtn) {
            contactAgentBtn.addEventListener('click', () => {
                closeModal();
                window.location.href = `contact.html?agent=${encodeURIComponent(contactAgentBtn.dataset.agent)}&type=investment`;
            });
        }
        
        // Handle investment calculator
        if (calculatorInput) {
            const updateCalculator = () => {
                const amount = parseFloat(calculatorInput.value) || 0;
                const term = parseFloat(modal.querySelector('.investment-calculator select').value) || 5;
                const roi = parseFloat(property.roi) / 100;
                
                const totalReturn = amount * Math.pow(1 + roi, term);
                const formattedReturn = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(totalReturn);
                
                const resultElement = modal.querySelector('.calculator-results .result-value');
                if (resultElement) {
                    resultElement.textContent = formattedReturn;
                }
            };
            
            calculatorInput.addEventListener('input', updateCalculator);
            modal.querySelector('.investment-calculator select').addEventListener('change', updateCalculator);
            updateCalculator(); // Initial calculation
        }
        
        // Close modal on close button click
        if (closeButton) {
            closeButton.addEventListener('click', closeModal);
        }
        
        // Close modal on backdrop click
        if (backdrop) {
            backdrop.addEventListener('click', closeModal);
        }
        
        // Close modal on Escape key
        function handleEscKey(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        }
        document.addEventListener('keydown', handleEscKey);
        
        // Prevent modal from closing when clicking inside
        modal.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    // Initialize the page
    if (propertiesContainer) {
        // In a real implementation, you would fetch this from an API
        // For now, we'll use the sample data with a small delay to simulate loading
        setTimeout(() => {
            loadProperties(sampleProperties);
        }, 500);
    }
});
