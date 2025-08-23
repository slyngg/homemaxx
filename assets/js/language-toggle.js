/**
 * Language Toggle System for HomeMAXX
 * Supports English ↔ Spanish switching
 */

class LanguageToggle {
  constructor() {
    this.currentLanguage = localStorage.getItem('homemaxx_language') || 'en';
    this.translations = {};
    this.init();
  }

  init() {
    this.loadTranslations();
    this.createToggleButton();
    this.applyLanguage(this.currentLanguage);
    this.bindEvents();
  }

  loadTranslations() {
    this.translations = {
      en: {
        // Navigation & Headers
        'nav.home': 'Home',
        'nav.how-it-works': 'How It Works',
        'nav.about': 'About',
        'nav.contact': 'Contact',
        'nav.get-offer': 'Get Offer',
        
        // Homepage Hero
        'hero.title': 'Get Your Cash Offer in 24 Hours',
        'hero.subtitle': 'Skip the hassle. Skip the fees. Get cash for your home fast.',
        'hero.cta': 'Get My Cash Offer',
        'hero.address-placeholder': 'Enter your home address',
        
        // Cash Offer Program
        'cash-offer.title': 'BEST OFFER IN ALL REAL ESTATE',
        'cash-offer.amount': '$7,500',
        'cash-offer.subtitle': 'Instant Cash BEFORE Closing',
        'cash-offer.description': 'Get up to $7,500 cash within 48 hours - before you even close on your home!',
        'cash-offer.spots': 'spots remaining',
        'cash-offer.claim': 'Claim Your Cash Now',
        'cash-offer.bonus': 'Some properties qualify for up to $15,000',
        
        // Benefits
        'benefits.no-fees': 'No Hidden Fees',
        'benefits.no-fees-desc': 'Zero commissions, zero closing costs',
        'benefits.fast-close': 'Close in 7 Days',
        'benefits.fast-close-desc': 'We can close as fast as you need',
        'benefits.cash-offer': 'All Cash Offers',
        'benefits.cash-offer-desc': 'No financing contingencies',
        'benefits.as-is': 'Sell As-Is',
        'benefits.as-is-desc': 'No repairs or cleaning needed',
        
        // Funnel Steps
        'funnel.step1': 'Property Details',
        'funnel.step2': 'Property Condition',
        'funnel.step3': 'Timeline',
        'funnel.step4': 'Contact Info',
        'funnel.step5': 'Get Offer',
        
        // Property Questions
        'property.owner-type': 'Are you the property owner?',
        'property.owner-yes': 'Yes, I own this property',
        'property.owner-agent': 'No, I\'m a real estate agent',
        'property.owner-hoa': 'No, I represent an HOA',
        
        'property.kitchen-quality': 'How would you describe your kitchen?',
        'property.kitchen-high-end': 'High-end / Recently renovated',
        'property.kitchen-standard': 'Standard / Move-in ready',
        'property.kitchen-dated': 'Dated / Needs updating',
        'property.kitchen-fixer': 'Fixer-upper / Major work needed',
        
        'property.timeline': 'When do you need to sell?',
        'property.timeline-asap': 'ASAP (within 2 weeks)',
        'property.timeline-month': 'Within 30 days',
        'property.timeline-flexible': 'I\'m flexible on timing',
        'property.timeline-browsing': 'Just browsing for now',
        
        // Contact Form
        'contact.first-name': 'First Name',
        'contact.last-name': 'Last Name',
        'contact.email': 'Email Address',
        'contact.phone': 'Phone Number',
        'contact.submit': 'Get My Cash Offer',
        
        // Buttons & Actions
        'btn.next': 'Next',
        'btn.back': 'Back',
        'btn.save': 'Save',
        'btn.try-again': 'Try Again',
        'btn.contact-support': 'Contact Support',
        'btn.send-anyway': 'Send Offer Anyway',
        'btn.continue': 'Continue',
        'btn.book-appointment': 'Book Appointment',
        
        // Status Messages
        'status.loading': 'Loading...',
        'status.calculating': 'Calculating your offer...',
        'status.success': 'Success!',
        'status.error': 'Error',
        'status.submitted': 'Information submitted successfully!',
        
        // Error Messages
        'error.calculation-failed': 'Unable to calculate offer',
        'error.technical-difficulties': 'We\'re experiencing technical difficulties. Please try again or contact our team directly.',
        'error.submission-failed': 'Submission Failed',
        'error.contact-direct': 'We\'re unable to submit your information at this time. Please contact us directly.',
        
        // Success Messages
        'success.high-priority': 'High-priority lead detected! Expect a call within 1 hour.',
        'success.good-opportunity': 'Great opportunity! We\'ll contact you within 4 hours.',
        'success.submitted': 'Thank you! We\'ve received your property information and will contact you within 24 hours with a personalized cash offer.',
        'success.manual-review': 'Our team will manually review your property details to provide the most accurate offer possible.',
        
        // Footer
        'footer.company': 'HomeMAXX LLC',
        'footer.address': '6628 Sky Pointe Dr. Ste.129-1378, Las Vegas, NV 89131',
        'footer.phone': '(725) 772-9847',
        'footer.email': 'ru@homemaxx.llc',
        'footer.hours': 'Support Hours: 8am-8pm PST',
        'footer.privacy': 'Privacy Policy',
        'footer.terms': 'Terms of Service'
      },
      
      es: {
        // Navigation & Headers
        'nav.home': 'Inicio',
        'nav.how-it-works': 'Cómo Funciona',
        'nav.about': 'Acerca de',
        'nav.contact': 'Contacto',
        'nav.get-offer': 'Obtener Oferta',
        
        // Homepage Hero
        'hero.title': 'Obtenga Su Oferta en Efectivo en 24 Horas',
        'hero.subtitle': 'Evite las molestias. Evite las tarifas. Obtenga efectivo por su casa rápidamente.',
        'hero.cta': 'Obtener Mi Oferta en Efectivo',
        'hero.address-placeholder': 'Ingrese la dirección de su casa',
        
        // Cash Offer Program
        'cash-offer.title': 'LA MEJOR OFERTA EN BIENES RAÍCES',
        'cash-offer.amount': '$7,500',
        'cash-offer.subtitle': 'Efectivo Instantáneo ANTES del Cierre',
        'cash-offer.description': '¡Obtenga hasta $7,500 en efectivo en 48 horas - antes de cerrar su casa!',
        'cash-offer.spots': 'lugares disponibles',
        'cash-offer.claim': 'Reclame Su Efectivo Ahora',
        'cash-offer.bonus': 'Algunas propiedades califican para hasta $15,000',
        
        // Benefits
        'benefits.no-fees': 'Sin Tarifas Ocultas',
        'benefits.no-fees-desc': 'Cero comisiones, cero costos de cierre',
        'benefits.fast-close': 'Cierre en 7 Días',
        'benefits.fast-close-desc': 'Podemos cerrar tan rápido como necesite',
        'benefits.cash-offer': 'Todas Ofertas en Efectivo',
        'benefits.cash-offer-desc': 'Sin contingencias de financiamiento',
        'benefits.as-is': 'Venda Como Está',
        'benefits.as-is-desc': 'No se necesitan reparaciones o limpieza',
        
        // Funnel Steps
        'funnel.step1': 'Detalles de la Propiedad',
        'funnel.step2': 'Condición de la Propiedad',
        'funnel.step3': 'Cronograma',
        'funnel.step4': 'Información de Contacto',
        'funnel.step5': 'Obtener Oferta',
        
        // Property Questions
        'property.owner-type': '¿Es usted el propietario de la propiedad?',
        'property.owner-yes': 'Sí, soy dueño de esta propiedad',
        'property.owner-agent': 'No, soy un agente de bienes raíces',
        'property.owner-hoa': 'No, represento una HOA',
        
        'property.kitchen-quality': '¿Cómo describiría su cocina?',
        'property.kitchen-high-end': 'Alta gama / Recientemente renovada',
        'property.kitchen-standard': 'Estándar / Lista para mudarse',
        'property.kitchen-dated': 'Anticuada / Necesita actualización',
        'property.kitchen-fixer': 'Para arreglar / Necesita trabajo mayor',
        
        'property.timeline': '¿Cuándo necesita vender?',
        'property.timeline-asap': 'Lo antes posible (en 2 semanas)',
        'property.timeline-month': 'Dentro de 30 días',
        'property.timeline-flexible': 'Soy flexible con el tiempo',
        'property.timeline-browsing': 'Solo estoy explorando por ahora',
        
        // Contact Form
        'contact.first-name': 'Nombre',
        'contact.last-name': 'Apellido',
        'contact.email': 'Correo Electrónico',
        'contact.phone': 'Número de Teléfono',
        'contact.submit': 'Obtener Mi Oferta en Efectivo',
        
        // Buttons & Actions
        'btn.next': 'Siguiente',
        'btn.back': 'Atrás',
        'btn.save': 'Guardar',
        'btn.try-again': 'Intentar de Nuevo',
        'btn.contact-support': 'Contactar Soporte',
        'btn.send-anyway': 'Enviar Oferta de Todos Modos',
        'btn.continue': 'Continuar',
        'btn.book-appointment': 'Reservar Cita',
        
        // Status Messages
        'status.loading': 'Cargando...',
        'status.calculating': 'Calculando su oferta...',
        'status.success': '¡Éxito!',
        'status.error': 'Error',
        'status.submitted': '¡Información enviada exitosamente!',
        
        // Error Messages
        'error.calculation-failed': 'No se pudo calcular la oferta',
        'error.technical-difficulties': 'Estamos experimentando dificultades técnicas. Por favor intente de nuevo o contacte a nuestro equipo directamente.',
        'error.submission-failed': 'Envío Fallido',
        'error.contact-direct': 'No podemos enviar su información en este momento. Por favor contáctenos directamente.',
        
        // Success Messages
        'success.high-priority': '¡Cliente de alta prioridad detectado! Espere una llamada en 1 hora.',
        'success.good-opportunity': '¡Gran oportunidad! Lo contactaremos en 4 horas.',
        'success.submitted': '¡Gracias! Hemos recibido la información de su propiedad y lo contactaremos en 24 horas con una oferta personalizada en efectivo.',
        'success.manual-review': 'Nuestro equipo revisará manualmente los detalles de su propiedad para proporcionar la oferta más precisa posible.',
        
        // Footer
        'footer.company': 'HomeMAXX LLC',
        'footer.address': '6628 Sky Pointe Dr. Ste.129-1378, Las Vegas, NV 89131',
        'footer.phone': '(725) 772-9847',
        'footer.email': 'ru@homemaxx.llc',
        'footer.hours': 'Horario de Soporte: 8am-8pm PST',
        'footer.privacy': 'Política de Privacidad',
        'footer.terms': 'Términos de Servicio'
      }
    };
  }

  createToggleButton() {
    // Create toggle button HTML
    const toggleHTML = `
      <div class="language-toggle" id="language-toggle">
        <button class="lang-btn" data-lang="en" ${this.currentLanguage === 'en' ? 'class="active"' : ''}>
          <span class="flag">🇺🇸</span>
          <span class="lang-text">EN</span>
        </button>
        <div class="toggle-divider">|</div>
        <button class="lang-btn" data-lang="es" ${this.currentLanguage === 'es' ? 'class="active"' : ''}>
          <span class="flag">🇪🇸</span>
          <span class="lang-text">ES</span>
        </button>
      </div>
    `;

    // Add CSS styles
    const styles = `
      <style>
        .language-toggle {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          background: white;
          border-radius: 25px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .lang-btn {
          background: none;
          border: none;
          padding: 6px 8px;
          border-radius: 15px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s ease;
          font-size: 14px;
          font-weight: 600;
          color: #6b7280;
        }

        .lang-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .lang-btn.active {
          background: #3b82f6;
          color: white;
        }

        .lang-btn.active:hover {
          background: #2563eb;
        }

        .toggle-divider {
          color: #d1d5db;
          font-weight: 300;
        }

        .flag {
          font-size: 16px;
        }

        .lang-text {
          font-size: 12px;
          letter-spacing: 0.5px;
        }

        @media (max-width: 768px) {
          .language-toggle {
            top: 15px;
            right: 15px;
            padding: 6px 10px;
          }
          
          .lang-btn {
            padding: 4px 6px;
          }
          
          .flag {
            font-size: 14px;
          }
          
          .lang-text {
            font-size: 11px;
          }
        }
      </style>
    `;

    // Add styles to head
    document.head.insertAdjacentHTML('beforeend', styles);

    // Add toggle to body
    document.body.insertAdjacentHTML('afterbegin', toggleHTML);
  }

  bindEvents() {
    const toggleButtons = document.querySelectorAll('.lang-btn');
    toggleButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selectedLang = e.currentTarget.dataset.lang;
        this.switchLanguage(selectedLang);
      });
    });
  }

  switchLanguage(lang) {
    if (lang === this.currentLanguage) return;

    this.currentLanguage = lang;
    localStorage.setItem('homemaxx_language', lang);
    
    // Update button states
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Apply translations
    this.applyLanguage(lang);

    // Update HTML lang attribute
    document.documentElement.lang = lang;

    // Dispatch language change event
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language: lang } 
    }));
  }

  applyLanguage(lang) {
    const translations = this.translations[lang];
    if (!translations) return;

    // Update all elements with data-translate attribute
    document.querySelectorAll('[data-translate]').forEach(element => {
      const key = element.dataset.translate;
      if (translations[key]) {
        if (element.tagName === 'INPUT' && element.type !== 'submit') {
          element.placeholder = translations[key];
        } else {
          element.textContent = translations[key];
        }
      }
    });

    // Update form placeholders specifically
    this.updateFormPlaceholders(translations);
    
    // Update dynamic content
    this.updateDynamicContent(translations);
  }

  updateFormPlaceholders(translations) {
    // Address input
    const addressInput = document.getElementById('address-input');
    if (addressInput && translations['hero.address-placeholder']) {
      addressInput.placeholder = translations['hero.address-placeholder'];
    }

    // Contact form inputs
    const inputs = {
      'firstName': 'contact.first-name',
      'lastName': 'contact.last-name', 
      'email': 'contact.email',
      'phone': 'contact.phone'
    };

    Object.entries(inputs).forEach(([id, key]) => {
      const input = document.getElementById(id);
      if (input && translations[key]) {
        input.placeholder = translations[key];
      }
    });
  }

  updateDynamicContent(translations) {
    // Update cash offer counter if present
    const spotsText = document.querySelector('.spots-remaining');
    if (spotsText && translations['cash-offer.spots']) {
      const number = spotsText.textContent.match(/\d+/);
      if (number) {
        spotsText.textContent = `${number[0]} ${translations['cash-offer.spots']}`;
      }
    }

    // Update any other dynamic content as needed
    this.updateFunnelContent(translations);
  }

  updateFunnelContent(translations) {
    // Update funnel step content if funnel is active
    if (window.funnelInstance) {
      // Trigger funnel to re-render with new language
      window.dispatchEvent(new CustomEvent('funnelLanguageUpdate', {
        detail: { translations }
      }));
    }
  }

  // Helper method to get translation
  t(key) {
    return this.translations[this.currentLanguage]?.[key] || key;
  }

  // Method to add translations dynamically
  addTranslations(lang, newTranslations) {
    if (!this.translations[lang]) {
      this.translations[lang] = {};
    }
    Object.assign(this.translations[lang], newTranslations);
  }
}

// Initialize language toggle when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.languageToggle = new LanguageToggle();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LanguageToggle;
}
