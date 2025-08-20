// Modern Google Places API Implementation
class ModernPlacesAPI {
  constructor() {
    this.isLoaded = false;
    this.callbacks = [];
    this.init();
  }

  init() {
    // Wait for Google Maps to load
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
      this.isLoaded = true;
      this.executeCallbacks();
    } else {
      // Wait for the API to load
      window.initGooglePlaces = () => {
        this.isLoaded = true;
        this.executeCallbacks();
      };
    }
  }

  onReady(callback) {
    if (this.isLoaded) {
      callback();
    } else {
      this.callbacks.push(callback);
    }
  }

  executeCallbacks() {
    this.callbacks.forEach(callback => callback());
    this.callbacks = [];
  }

  // Modern implementation using PlaceAutocompleteElement (when available)
  createModernAutocomplete(input, options = {}) {
    if (typeof google !== 'undefined' && google.maps.places.PlaceAutocompleteElement) {
      // Use the new PlaceAutocompleteElement
      const autocomplete = new google.maps.places.PlaceAutocompleteElement({
        ...options,
        componentRestrictions: { country: 'us' },
        fields: ['address_components', 'formatted_address', 'geometry', 'name']
      });
      
      // Replace the input with the new element
      input.parentNode.replaceChild(autocomplete, input);
      
      autocomplete.addEventListener('gmp-placeselect', (event) => {
        const place = event.place;
        if (options.onPlaceChanged) {
          options.onPlaceChanged(place);
        }
      });
      
      return autocomplete;
    } else {
      // Fallback to legacy Autocomplete
      return this.createLegacyAutocomplete(input, options);
    }
  }

  // Legacy implementation for backward compatibility
  createLegacyAutocomplete(input, options = {}) {
    const autocomplete = new google.maps.places.Autocomplete(input, {
      types: ['address'],
      componentRestrictions: { country: 'us' },
      fields: ['address_components', 'formatted_address', 'geometry', 'name']
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (options.onPlaceChanged) {
        options.onPlaceChanged(place);
      }
    });

    return autocomplete;
  }

  // Enhanced property lookup with better data handling
  async lookupProperty(address) {
    try {
      // This would typically call your property data API
      // For now, we'll simulate with enhanced mock data
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Enhanced property data simulation
      const mockData = {
        address: address,
        beds: Math.floor(Math.random() * 4) + 2,
        baths: (Math.floor(Math.random() * 3) + 1) + 0.5,
        sqft: (Math.floor(Math.random() * 1500) + 1200).toLocaleString(),
        yearBuilt: Math.floor(Math.random() * 30) + 1990,
        lotSize: (Math.random() * 0.5 + 0.1).toFixed(2) + ' acres',
        floors: Math.floor(Math.random() * 2) + 1,
        basement: Math.random() > 0.7 ? 'Yes' : 'No',
        pool: Math.random() > 0.8 ? 'Yes' : 'No pool',
        parking: Math.random() > 0.5 ? 'Garage' : 'Driveway',
        garageSpaces: Math.floor(Math.random() * 3) + 1,
        estimatedValue: '$' + (Math.floor(Math.random() * 200000) + 300000).toLocaleString(),
        neighborhood: this.extractNeighborhood(address),
        propertyType: 'Single Family Home'
      };

      return mockData;
    } catch (error) {
      console.error('Property lookup failed:', error);
      return {
        address: address,
        beds: 'Unknown',
        baths: 'Unknown',
        sqft: 'Unknown',
        yearBuilt: 'Unknown',
        lotSize: 'Unknown'
      };
    }
  }

  extractNeighborhood(address) {
    // Simple neighborhood extraction from address
    const parts = address.split(',');
    return parts.length > 1 ? parts[1].trim() : 'Unknown';
  }

  // Setup autocomplete for any input
  setupAutocomplete(inputSelector, onPlaceSelected) {
    this.onReady(() => {
      const input = document.querySelector(inputSelector);
      if (!input) return;

      const autocomplete = this.createModernAutocomplete(input, {
        onPlaceChanged: async (place) => {
          if (place && place.formatted_address) {
            // Show loading state
            if (input.nextElementSibling && input.nextElementSibling.classList.contains('loading-indicator')) {
              input.nextElementSibling.style.display = 'block';
            }

            try {
              const propertyData = await this.lookupProperty(place.formatted_address);
              if (onPlaceSelected) {
                onPlaceSelected(place, propertyData);
              }
            } catch (error) {
              console.error('Error processing place selection:', error);
            } finally {
              // Hide loading state
              if (input.nextElementSibling && input.nextElementSibling.classList.contains('loading-indicator')) {
                input.nextElementSibling.style.display = 'none';
              }
            }
          }
        }
      });

      // Add loading indicator
      if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('loading-indicator')) {
        const loader = document.createElement('div');
        loader.className = 'loading-indicator';
        loader.style.display = 'none';
        loader.innerHTML = '<div class="spinner"></div> Looking up property details...';
        input.parentNode.insertBefore(loader, input.nextSibling);
      }

      return autocomplete;
    });
  }
}

// Add loading spinner styles
const style = document.createElement('style');
style.textContent = `
  .loading-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
    background: var(--surface);
    border-radius: 4px;
    margin-top: 0.5rem;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid var(--border-light);
    border-top: 2px solid var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// Initialize global instance
window.modernPlacesAPI = new ModernPlacesAPI();

// Export for module usage
window.ModernPlacesAPI = ModernPlacesAPI;
