/**
 * Language Toggle System for HomeMAXX
 * Supports English Spanish switching
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
        
        // Funnel Step Titles and Subtitles
        'step-address-title': 'Enter your home address',
        'step-property-details-title': "Let's confirm your property details",
        'step-property-details-subtitle': 'We found this information about your home. Please review and edit if needed.',
        'step-owner-type-title': 'Are you the owner of this home?',
        'step-owner-type-subtitle': 'We have additional questions if you\'re an agent.',
        'step-agent-options-title': 'Great! There are two ways agents can work with us.',
        'step-agent-options-subtitle': 'You can decide what makes the most sense for you and the homeowner after you receive an estimated offer from HomeMAXX.',
        'step-timeline-title': 'When do you need to sell your home?',
        'step-timeline-subtitle': 'This won\'t affect your offer. We\'re here to help with any timeline.',
        'step-kitchen-countertops-title': 'What are your kitchen countertops made of?',
        'step-kitchen-countertops-subtitle': 'This tells us a bit about when the kitchen was last updated.',
        'step-kitchen-quality-title': 'How would you describe your kitchen?',
        'step-kitchen-quality-subtitle': 'For these questions, just select the closest match.',
        'step-bathroom-quality-title': 'How would you describe your bathroom?',
        'step-bathroom-quality-subtitle': 'For these questions, just select the closest match.',
        'step-living-room-quality-title': 'How would you describe your living room?',
        'step-living-room-quality-subtitle': 'For these questions, just select the closest match.',
        'step-hoa-question-title': 'Is your home part of a homeowners association?',
        'step-hoa-question-subtitle': 'This is often called an HOA. It\'s a group that helps maintain your community for a fee.',
        'step-hoa-fees-title': 'What are your monthly HOA fees?',
        'step-hoa-fees-subtitle': '(Optional) This helps us better understand your property\'s monthly expenses.',
        'step-property-issues-title': 'Do any of these apply to your home?',
        'step-property-issues-subtitle': 'Select all that apply. We keep an eye out for these things when we\'re making an offer.',
        'step-contact-info-title': 'Sign in to get your offer',
        'step-contact-info-subtitle': 'It\'s totally free and there\'s no commitment.',
        
        // Owner Type Options
        'owner-type-owner': 'Yes, I own this home',
        'owner-type-agent': 'No, I\'m an agent',
        'owner-type-agent-owner': 'I\'m an agent, and I own this home',
        'owner-type-other': 'Other',
        
        // Timeline Options
        'timeline-asap': 'ASAP',
        'timeline-2-4-weeks': '2-4 weeks',
        'timeline-4-6-weeks': '4-6 weeks',
        'timeline-6-weeks-plus': '6+ weeks',
        'timeline-just-browsing': 'Just browsing',
        
        // Kitchen Quality Options
        'kitchen-quality-fixer-upper': 'Fixer Upper',
        'kitchen-quality-dated': 'Dated',
        'kitchen-quality-standard': 'Standard',
        'kitchen-quality-high-end': 'High end',
        'kitchen-quality-luxury': 'Luxury',
        
        // Bathroom Quality Options
        'bathroom-quality-fixer-upper': 'Fixer Upper',
        'bathroom-quality-dated': 'Dated',
        'bathroom-quality-standard': 'Standard',
        'bathroom-quality-high-end': 'High end',
        'bathroom-quality-luxury': 'Luxury',
        
        // Living Room Quality Options
        'living-room-quality-fixer-upper': 'Fixer Upper',
        'living-room-quality-dated': 'Dated',
        'living-room-quality-standard': 'Standard',
        'living-room-quality-high-end': 'High end',
        'living-room-quality-luxury': 'Luxury',
        
        // HOA Options
        'hoa-yes': 'Yes',
        'hoa-no': 'No',
        
        // Contact Form
        'contact-first-name': 'First Name *',
        'contact-last-name': 'Last Name *',
        'contact-email': 'Email *',
        'contact-phone': 'Mobile Number *',
        'contact-submit': 'Get My Cash Offer',
        'contact-terms': 'By clicking "Get My Cash Offer", you agree to HomeMAXX\'s terms of service and Privacy policy.',
        
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
        'footer.email': 'support@homemaxx.com',
        'footer.hours': 'Support Hours: 8am-8pm PST',
        'footer.privacy': 'Privacy Policy',
        'footer.terms': 'Terms of Service',
        'footer.copyright': ' 2024 HomeMAXX LLC. All rights reserved.',
        
        // Offer Results
        'offer.title': 'Your Instant Cash Offer',
        'offer.amount': 'Offer Amount',
        'offer.cash-advance': 'Cash Advance',
        'offer.closing-costs': 'Estimated Closing Costs',
        'offer.net-proceeds': 'Your Net Proceeds',
        'offer.priority': 'Lead Priority',
        'offer.next-steps': 'Next Steps',
        'offer.accept': 'Accept Offer',
        'offer.schedule-visit': 'Schedule Property Visit',
        
        // Address Entry Page
        'address-entry.title': 'Let\'s start your offer',
        'address-entry.subtitle': 'Enter your address to get started. This helps us find sales data for your home and other homes nearby.',
        'address-entry.label': 'Enter your home address',
        'btn.continue': 'Continue',
        
        // Navigation additions
        'nav.skip-to-main': 'Skip to main content',
        'nav.browse-homes': 'Browse homes',
        'nav.agents': 'Agents',
        'nav.properties': 'Properties',
        
        // Investment Opportunities
        'investment.hero.title': 'Investment Opportunities',
        'investment.hero.subtitle': 'Exclusive real estate investment platform coming soon. Be the first to access premium investment opportunities.',
        'investment.wip.title': 'Platform Under Development',
        'investment.wip.subtitle': 'We\'re building something amazing for real estate investors. Our comprehensive investment platform will launch soon.',
        'investment.features.title': 'Coming Soon Features',
        'investment.features.exclusive': 'Exclusive off-market property listings',
        'investment.features.analysis': 'Advanced investment analysis tools',
        'investment.features.tours': 'Virtual property tours and 3D walkthroughs',
        'investment.features.direct': 'Direct investment opportunities',
        'investment.features.reports': 'Comprehensive market trend reports',
        'investment.features.portfolio': 'Portfolio management dashboard',
        'investment.features.financing': 'Financing and partnership options',
        'investment.contact.text': 'Ready to explore investment opportunities? Contact our team to learn about current deals and get early access to our platform.',
        'investment.cta.sell': 'Sell Your Property',
        'investment.cta.invest': 'Investment Inquiries',
        'investment.cta.home': 'Back to Home',
        
        // Footer additions
        'footer.description': 'Revolutionizing real estate transactions with fast cash offers and exclusive investment opportunities.',
        'footer.quick-links': 'Quick Links',
        'footer.legal': 'Legal',
        'footer.newsletter': 'Stay Updated',
        'footer.newsletter-desc': 'Subscribe to receive exclusive investment opportunities and market updates.',
        'footer.email-placeholder': 'Your email address',
        'footer.subscribe': 'Subscribe',
        'footer.get-offer': 'Get a Cash Offer',
        'footer.disclaimer': 'Investment Disclaimer',
        
        // Legal Disclaimer
        'legal.disclaimer.title': 'Investment Disclaimer',
        'legal.disclaimer.subtitle': 'Important legal information regarding investment opportunities',
        'legal.last-updated': 'Last Updated: January 22, 2025',
        'legal.warning.title': 'Important Notice',
        'legal.warning.text': 'Real estate investments carry substantial risks and may not be suitable for all investors. Please read this disclaimer carefully before proceeding.',
        'legal.section1.title': 'No Investment Advice',
        'legal.section1.content': 'The information provided on the HomeMAXX website and through our services is for informational purposes only and should not be construed as investment advice, financial advice, or an offer or solicitation to buy or sell any securities or investment products. HomeMAXX LLC is not a registered investment advisor, broker-dealer, or financial planner under applicable securities laws.',
        'legal.section1.content2': 'Any information, opinions, or recommendations expressed are subject to change without notice and are not intended to be a complete analysis of every material fact concerning any company, industry, or security.',
        'legal.section2.title': 'Risk Disclosure',
        'legal.section2.content': 'Real estate investing involves substantial risk of loss and is not suitable for all investors. Investment risks include but are not limited to:',
        'legal.section2.content2': 'Past performance is not indicative of future results. Potential investors should consider their investment objectives and risks carefully before investing.',
        'legal.risks.market': 'Market volatility and property value fluctuations',
        'legal.risks.liquidity': 'Lack of liquidity and difficulty in selling properties',
        'legal.risks.economic': 'Economic downturns affecting real estate markets',
        'legal.risks.regulatory': 'Changes in laws, regulations, and tax policies',
        'legal.risks.maintenance': 'Property maintenance and management costs',
        'legal.risks.financing': 'Interest rate changes and financing availability',
        'legal.section3.title': 'No Guarantees or Warranties',
        'legal.section3.content': 'HomeMAXX makes no guarantees, representations, or warranties regarding the performance of any investment opportunity presented through our platform or services. All projected returns, estimates, and forward-looking statements are based on current expectations and assumptions that are subject to significant risks and uncertainties.',
        'legal.section3.content2': 'Actual results may differ materially from those projected. No assurance can be given that any investment will be profitable or that investors will not incur losses.',
        'legal.section4.title': 'Due Diligence Requirement',
        'legal.section4.content': 'Prospective investors are strongly encouraged to conduct their own independent investigation and analysis of any investment opportunity. This includes but is not limited to:',
        'legal.section4.content2': 'HomeMAXX recommends consulting with qualified professionals including financial advisors, attorneys, accountants, and real estate professionals before making any investment decisions.',
        'legal.diligence.research': 'Researching market conditions and property values',
        'legal.diligence.inspection': 'Conducting property inspections and appraisals',
        'legal.diligence.financial': 'Reviewing all financial documents and projections',
        'legal.diligence.legal': 'Understanding legal and regulatory requirements',
        'legal.section5.title': 'Professional Advice Disclaimer',
        'legal.section5.content': 'The information provided through HomeMAXX does not constitute tax, legal, or accounting advice. Tax and legal consequences of real estate investments can be complex and vary based on individual circumstances and applicable laws.',
        'legal.section5.content2': 'Investors should consult with their own qualified tax advisors, attorneys, and accountants regarding the specific tax and legal implications of any investment opportunity.',
        'legal.section6.title': 'Investment Suitability',
        'legal.section6.content': 'Real estate investments, particularly in private placements and alternative investments, involve substantial risks and are suitable only for sophisticated investors who:',
        'legal.section6.content2': 'These investments are typically illiquid, and there may be no secondary market available for resale.',
        'legal.suitability.experience': 'Have adequate knowledge and experience in real estate investing',
        'legal.suitability.financial': 'Can afford to lose their entire investment',
        'legal.suitability.liquidity': 'Do not require liquidity from their investment',
        'legal.suitability.income': 'Meet applicable income and net worth requirements',
        'legal.section7.title': 'Regulatory Compliance',
        'legal.section7.content': 'HomeMAXX operates in compliance with applicable federal and state securities laws. Any investment opportunities presented are subject to regulatory requirements and may only be available to qualified investors as defined by applicable securities regulations.',
        'legal.section7.content2': 'This disclaimer does not constitute an offer to sell or solicitation of an offer to buy any securities. Such offers can only be made through official offering documents that contain complete information about risks, fees, and expenses.',
        'legal.section8.title': 'Limitation of Liability',
        'legal.section8.content': 'To the fullest extent permitted by law, HomeMAXX LLC and its affiliates, officers, directors, employees, and agents shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from the use of information provided or investment decisions made based on such information.',
        'legal.contact.title': 'Questions or Concerns?',
        'legal.contact.text': 'If you have any questions about this Investment Disclaimer or need clarification on any investment-related matters, please contact us:',
        'legal.contact.company': 'HomeMAXX LLC',
        'legal.contact.address': '6628 Sky Pointe Dr. Ste.129-1378, Las Vegas, NV 89131',
        'legal.contact.phone': 'Phone: (725) 772-9847',
        'legal.contact.email': 'Email: legal@homemaxx.llc',
        'legal.contact.hours': 'Business Hours: Monday - Friday, 8:00 AM - 8:00 PM PST',
        
        // Additional form fields
        'property.sqft-placeholder': 'Enter square footage',
        'property.year-placeholder': 'Enter year built',
        'property.details-subtitle': 'Tell us about your property',
        'condition.condition-subtitle': 'Help us understand your property\'s condition',
        'seller.info-subtitle': 'Tell us about your situation',
        'timeline.timeline-subtitle': 'When do you need to sell?',
        'contact.contact-subtitle': 'How can we reach you?',
        'offer.offer-subtitle': 'We\'re calculating your personalized cash offer',
        'btn.save': 'Save & Exit'
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
        
        // Funnel Step Titles and Subtitles
        'step-address-title': 'Ingrese la dirección de su casa',
        'step-property-details-title': "Confirmemos los detalles de su propiedad",
        'step-property-details-subtitle': 'Encontramos esta información sobre su casa. Por favor revise y edite si es necesario.',
        'step-owner-type-title': '¿Es usted el propietario de esta casa?',
        'step-owner-type-subtitle': 'Tenemos preguntas adicionales si es un agente.',
        'step-agent-options-title': '¡Genial! Hay dos formas en que los agentes pueden trabajar con nosotros.',
        'step-agent-options-subtitle': 'Puede decidir qué es lo que más sentido tiene para usted y el propietario después de recibir una oferta estimada de HomeMAXX.',
        'step-timeline-title': '¿Cuándo necesita vender su casa?',
        'step-timeline-subtitle': 'Esto no afectará su oferta. Estamos aquí para ayudar con cualquier cronograma.',
        'step-kitchen-countertops-title': '¿De qué están hechas las encimeras de su cocina?',
        'step-kitchen-countertops-subtitle': 'Esto nos dice un poco sobre cuándo se actualizó la cocina por última vez.',
        'step-kitchen-quality-title': '¿Cómo describiría su cocina?',
        'step-kitchen-quality-subtitle': 'Para estas preguntas, simplemente seleccione la opción más cercana.',
        'step-bathroom-quality-title': '¿Cómo describiría su baño?',
        'step-bathroom-quality-subtitle': 'Para estas preguntas, simplemente seleccione la opción más cercana.',
        'step-living-room-quality-title': '¿Cómo describiría su sala de estar?',
        'step-living-room-quality-subtitle': 'Para estas preguntas, simplemente seleccione la opción más cercana.',
        'step-hoa-question-title': '¿Su casa es parte de una asociación de propietarios?',
        'step-hoa-question-subtitle': 'Esto se llama comúnmente HOA. Es un grupo que ayuda a mantener su comunidad por una tarifa.',
        'step-hoa-fees-title': '¿Cuáles son sus tarifas mensuales de HOA?',
        'step-hoa-fees-subtitle': '(Opcional) Esto nos ayuda a entender mejor los gastos mensuales de su propiedad.',
        'step-property-issues-title': '¿Alguna de estas opciones se aplica a su casa?',
        'step-property-issues-subtitle': 'Seleccione todas las opciones que apliquen. Mantenemos un ojo en estas cosas cuando estamos haciendo una oferta.',
        'step-contact-info-title': 'Inicie sesión para obtener su oferta',
        'step-contact-info-subtitle': 'Es completamente gratuito y no hay compromiso.',
        
        // Owner Type Options
        'owner-type-owner': 'Sí, soy dueño de esta casa',
        'owner-type-agent': 'No, soy un agente',
        'owner-type-agent-owner': 'Soy un agente y soy dueño de esta casa',
        'owner-type-other': 'Otro',
        
        // Timeline Options
        'timeline-asap': 'Lo antes posible',
        'timeline-2-4-weeks': '2-4 semanas',
        'timeline-4-6-weeks': '4-6 semanas',
        'timeline-6-weeks-plus': '6+ semanas',
        'timeline-just-browsing': 'Solo estoy explorando',
        
        // Kitchen Quality Options
        'kitchen-quality-fixer-upper': 'Para arreglar',
        'kitchen-quality-dated': 'Anticuada',
        'kitchen-quality-standard': 'Estándar',
        'kitchen-quality-high-end': 'Alta gama',
        'kitchen-quality-luxury': 'Lujo',
        
        // Bathroom Quality Options
        'bathroom-quality-fixer-upper': 'Para arreglar',
        'bathroom-quality-dated': 'Anticuada',
        'bathroom-quality-standard': 'Estándar',
        'bathroom-quality-high-end': 'Alta gama',
        'bathroom-quality-luxury': 'Lujo',
        
        // Living Room Quality Options
        'living-room-quality-fixer-upper': 'Para arreglar',
        'living-room-quality-dated': 'Anticuada',
        'living-room-quality-standard': 'Estándar',
        'living-room-quality-high-end': 'Alta gama',
        'living-room-quality-luxury': 'Lujo',
        
        // HOA Options
        'hoa-yes': 'Sí',
        'hoa-no': 'No',
        
        // Contact Form
        'contact-first-name': 'Nombre',
        'contact-last-name': 'Apellido',
        'contact-email': 'Correo Electrónico',
        'contact-phone': 'Número de Teléfono',
        'contact-submit': 'Obtener Mi Oferta en Efectivo',
        'contact-terms': 'Al hacer clic en "Obtener Mi Oferta en Efectivo", usted acepta los términos de servicio y la política de privacidad de HomeMAXX.',
        
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
        'footer.email': 'support@homemaxx.com',
        'footer.hours': 'Horario de Soporte: 8am-8pm PST',
        'footer.privacy': 'Política de Privacidad',
        'footer.terms': 'Términos de Servicio',
        'footer.copyright': ' 2024 HomeMAXX LLC. Todos los derechos reservados.',
        
        // Offer Results
        'offer.title': 'Su Oferta Instantánea en Efectivo',
        'offer.amount': 'Monto de la Oferta',
        'offer.cash-advance': 'Adelanto en Efectivo',
        'offer.closing-costs': 'Costos de Cierre Estimados',
        'offer.net-proceeds': 'Sus Ganancias Netas',
        'offer.priority': 'Prioridad del Cliente',
        'offer.next-steps': 'Próximos Pasos',
        'offer.accept': 'Aceptar Oferta',
        'offer.schedule-visit': 'Programar Visita a la Propiedad',
        
        // Address Entry Page
        'address-entry.title': 'Comencemos con su oferta',
        'address-entry.subtitle': 'Ingrese su dirección para comenzar. Esto nos ayuda a encontrar datos de ventas de su casa y otras casas cercanas.',
        'address-entry.label': 'Ingrese la dirección de su casa',
        'btn.continue': 'Continuar',
        
        // Navigation additions
        'nav.skip-to-main': 'Saltar al contenido principal',
        'nav.browse-homes': 'Explorar casas',
        'nav.agents': 'Agentes',
        'nav.properties': 'Propiedades',
        
        // Investment Opportunities
        'investment.hero.title': 'Oportunidades de Inversión',
        'investment.hero.subtitle': 'Plataforma exclusiva de inversión inmobiliaria próximamente. Sea el primero en acceder a oportunidades de inversión premium.',
        'investment.wip.title': 'Plataforma en Desarrollo',
        'investment.wip.subtitle': 'Estamos construyendo algo increíble para inversionistas inmobiliarios. Nuestra plataforma integral de inversión se lanzará pronto.',
        'investment.features.title': 'Características Próximamente',
        'investment.features.exclusive': 'Listados exclusivos de propiedades fuera del mercado',
        'investment.features.analysis': 'Herramientas avanzadas de análisis de inversión',
        'investment.features.tours': 'Tours virtuales de propiedades y recorridos 3D',
        'investment.features.direct': 'Oportunidades de inversión directa',
        'investment.features.reports': 'Informes completos de tendencias del mercado',
        'investment.features.portfolio': 'Panel de gestión de cartera',
        'investment.features.financing': 'Opciones de financiamiento y asociación',
        'investment.contact.text': '¿Listo para explorar oportunidades de inversión? Contacte a nuestro equipo para conocer ofertas actuales y obtener acceso temprano a nuestra plataforma.',
        'investment.cta.sell': 'Vender Su Propiedad',
        'investment.cta.invest': 'Consultas de Inversión',
        'investment.cta.home': 'Volver al Inicio',
        
        // Footer additions
        'footer.description': 'Revolucionando las transacciones inmobiliarias con ofertas rápidas en efectivo y oportunidades exclusivas de inversión.',
        'footer.quick-links': 'Enlaces Rápidos',
        'footer.legal': 'Legal',
        'footer.newsletter': 'Manténgase Actualizado',
        'footer.newsletter-desc': 'Suscríbase para recibir oportunidades exclusivas de inversión y actualizaciones del mercado.',
        'footer.email-placeholder': 'Su dirección de correo electrónico',
        'footer.subscribe': 'Suscribirse',
        'footer.get-offer': 'Obtener Oferta en Efectivo',
        'footer.disclaimer': 'Descargo de Responsabilidad de Inversión',
        
        // Legal Disclaimer
        'legal.disclaimer.title': 'Descargo de Responsabilidad de Inversión',
        'legal.disclaimer.subtitle': 'Información legal importante sobre oportunidades de inversión',
        'legal.last-updated': 'Última Actualización: 22 de Enero, 2025',
        'legal.warning.title': 'Aviso Importante',
        'legal.warning.text': 'Las inversiones inmobiliarias conllevan riesgos sustanciales y pueden no ser adecuadas para todos los inversionistas. Por favor lea este descargo cuidadosamente antes de proceder.',
        'legal.section1.title': 'Sin Asesoramiento de Inversión',
        'legal.section1.content': 'La información proporcionada en el sitio web de HomeMAXX y a través de nuestros servicios es solo para fines informativos y no debe interpretarse como asesoramiento de inversión, asesoramiento financiero, o una oferta o solicitud para comprar o vender valores o productos de inversión. HomeMAXX LLC no es un asesor de inversiones registrado, corredor de bolsa, o planificador financiero bajo las leyes de valores aplicables.',
        'legal.section1.content2': 'Cualquier información, opinión o recomendación expresada está sujeta a cambios sin previo aviso y no pretende ser un análisis completo de cada hecho material concerniente a cualquier empresa, industria o valor.',
        'legal.section2.title': 'Divulgación de Riesgos',
        'legal.section2.content': 'Invertir en bienes raíces involucra un riesgo sustancial de pérdida y no es adecuado para todos los inversionistas. Los riesgos de inversión incluyen pero no se limitan a:',
        'legal.section2.content2': 'El rendimiento pasado no es indicativo de resultados futuros. Los inversionistas potenciales deben considerar cuidadosamente sus objetivos de inversión y riesgos antes de invertir.',
        'legal.risks.market': 'Volatilidad del mercado y fluctuaciones del valor de la propiedad',
        'legal.risks.liquidity': 'Falta de liquidez y dificultad para vender propiedades',
        'legal.risks.economic': 'Recesiones económicas que afectan los mercados inmobiliarios',
        'legal.risks.regulatory': 'Cambios en leyes, regulaciones y políticas fiscales',
        'legal.risks.maintenance': 'Costos de mantenimiento y gestión de propiedades',
        'legal.risks.financing': 'Cambios en tasas de interés y disponibilidad de financiamiento',
        'legal.section3.title': 'Sin Garantías o Warranties',
        'legal.section3.content': 'HomeMAXX no hace garantías, representaciones o warranties sobre el rendimiento de cualquier oportunidad de inversión presentada a través de nuestra plataforma o servicios. Todos los rendimientos proyectados, estimaciones y declaraciones prospectivas se basan en expectativas y suposiciones actuales que están sujetas a riesgos e incertidumbres significativas.',
        'legal.section3.content2': 'Los resultados reales pueden diferir materialmente de los proyectados. No se puede dar garantía de que cualquier inversión será rentable o que los inversionistas no incurrirán en pérdidas.',
        'legal.section4.title': 'Requisito de Diligencia Debida',
        'legal.section4.content': 'Se alienta fuertemente a los inversionistas prospectivos a realizar su propia investigación y análisis independiente de cualquier oportunidad de inversión. Esto incluye pero no se limita a:',
        'legal.section4.content2': 'HomeMAXX recomienda consultar con profesionales calificados incluyendo asesores financieros, abogados, contadores y profesionales inmobiliarios antes de tomar cualquier decisión de inversión.',
        'legal.diligence.research': 'Investigar condiciones del mercado y valores de propiedades',
        'legal.diligence.inspection': 'Realizar inspecciones y tasaciones de propiedades',
        'legal.diligence.financial': 'Revisar todos los documentos financieros y proyecciones',
        'legal.diligence.legal': 'Entender requisitos legales y regulatorios',
        'legal.section5.title': 'Descargo de Asesoramiento Profesional',
        'legal.section5.content': 'La información proporcionada a través de HomeMAXX no constituye asesoramiento fiscal, legal o contable. Las consecuencias fiscales y legales de las inversiones inmobiliarias pueden ser complejas y variar según las circunstancias individuales y las leyes aplicables.',
        'legal.section5.content2': 'Los inversionistas deben consultar con sus propios asesores fiscales, abogados y contadores calificados sobre las implicaciones fiscales y legales específicas de cualquier oportunidad de inversión.',
        'legal.section6.title': 'Idoneidad de Inversión',
        'legal.section6.content': 'Las inversiones inmobiliarias, particularmente en colocaciones privadas e inversiones alternativas, involucran riesgos sustanciales y son adecuadas solo para inversionistas sofisticados que:',
        'legal.section6.content2': 'Estas inversiones son típicamente ilíquidas, y puede no haber mercado secundario disponible para reventa.',
        'legal.suitability.experience': 'Tienen conocimiento y experiencia adecuados en inversión inmobiliaria',
        'legal.suitability.financial': 'Pueden permitirse perder toda su inversión',
        'legal.suitability.liquidity': 'No requieren liquidez de su inversión',
        'legal.suitability.income': 'Cumplen con los requisitos aplicables de ingresos y patrimonio neto',
        'legal.section7.title': 'Cumplimiento Regulatorio',
        'legal.section7.content': 'HomeMAXX opera en cumplimiento con las leyes federales y estatales de valores aplicables. Cualquier oportunidad de inversión presentada está sujeta a requisitos regulatorios y puede estar disponible solo para inversionistas calificados según se define en las regulaciones de valores aplicables.',
        'legal.section7.content2': 'Este descargo no constituye una oferta de venta o solicitud de una oferta de compra de valores. Tales ofertas solo pueden hacerse a través de documentos oficiales de oferta que contienen información completa sobre riesgos, tarifas y gastos.',
        'legal.section8.title': 'Limitación de Responsabilidad',
        'legal.section8.content': 'En la medida máxima permitida por la ley, HomeMAXX LLC y sus afiliados, funcionarios, directores, empleados y agentes no serán responsables por daños directos, indirectos, incidentales, especiales o consecuenciales que surjan del uso de información proporcionada o decisiones de inversión basadas en dicha información.',
        'legal.contact.title': '¿Preguntas o Inquietudes?',
        'legal.contact.text': 'Si tiene preguntas sobre este Descargo de Responsabilidad de Inversión o necesita aclaración sobre cualquier asunto relacionado con inversiones, por favor contáctenos:',
        'legal.contact.company': 'HomeMAXX LLC',
        'legal.contact.address': '6628 Sky Pointe Dr. Ste.129-1378, Las Vegas, NV 89131',
        'legal.contact.phone': 'Teléfono: (725) 772-9847',
        'legal.contact.email': 'Email: legal@homemaxx.llc',
        'legal.contact.hours': 'Horario Comercial: Lunes - Viernes, 8:00 AM - 8:00 PM PST',
        
        // Additional form fields
        'property.sqft-placeholder': 'Ingrese pies cuadrados',
        'property.year-placeholder': 'Ingrese año de construcción',
        'property.details-subtitle': 'Cuéntenos sobre su propiedad',
        'condition.condition-subtitle': 'Ayúdenos a entender la condición de su propiedad',
        'seller.info-subtitle': 'Cuéntenos sobre su situación',
        'timeline.timeline-subtitle': '¿Cuándo necesita vender?',
        'contact.contact-subtitle': '¿Cómo podemos contactarlo?',
        'offer.offer-subtitle': 'Estamos calculando su oferta personalizada en efectivo',
        'btn.save': 'Guardar y Salir'
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
