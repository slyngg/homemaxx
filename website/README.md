# HomeMAXX Real Estate Website

A modern, accessible, and responsive real estate website for HomeMAXX, built with HTML5, CSS3, and vanilla JavaScript.

## Features

- ✨ Modern, clean design with smooth animations
- 📱 Fully responsive layout for all device sizes
- ♿️ Accessible with ARIA attributes and keyboard navigation
- 🚀 Optimized for performance and SEO
- 📝 Contact form integrated with GoHighLevel CRM
- 🗺️ Google Maps integration for property locations
- 📱 Mobile-first approach with progressive enhancement

## Project Structure

```
website/
├── assets/
│   ├── css/
│   │   └── main.css           # Main stylesheet
│   ├── js/
│   │   ├── main.js            # Main JavaScript
│   │   ├── mobile-menu.js     # Mobile navigation
│   │   └── accessibility.js   # Accessibility enhancements
│   └── images/                # Image assets
├── pages/
│   ├── about.html             # About Us page
│   ├── properties.html        # Properties listing
│   └── contact.html           # Contact page
├── index.html                 # Homepage
└── README.md                  # This file
```

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Code editor (VS Code, Sublime Text, etc.)
- Node.js and npm (optional, for development tools)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/homemaxx-website.git
   cd homemaxx-website
   ```

2. Open `index.html` in your browser to view the website locally.

## Development

### Building

This project uses vanilla HTML, CSS, and JavaScript with no build step required. However, if you want to minify assets for production:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the build script:
   ```bash
   npm run build
   ```

### Code Style

- Follow [HTML5](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5) and [CSS3](https://developer.mozilla.org/en-US/docs/Web/CSS) best practices
- Use BEM methodology for CSS class naming
- Keep JavaScript modular and well-documented

## Accessibility

This website follows WCAG 2.1 AA accessibility standards, including:

- Semantic HTML5 elements
- ARIA attributes for screen readers
- Keyboard navigation
- Focus management
- Skip links
- Color contrast ratios
- Reduced motion support

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS 12+)
- Chrome for Android (latest)

## Deployment

### GoHighLevel Integration

The contact form is pre-configured to work with GoHighLevel CRM. To set up:

1. Create a form in your GoHighLevel account
2. Update the form action URL in `contact.html`
3. Configure your form fields to match the expected input names

### Hosting

1. Upload the contents of the `website` directory to your web server
2. Ensure all file paths are relative
3. Test all forms and interactive elements

## Testing

### Manual Testing

- [ ] Test all links and navigation
- [ ] Verify form submission and validation
- [ ] Check responsive behavior on different devices
- [ ] Test keyboard navigation
- [ ] Verify screen reader compatibility

### Automated Testing

Run the following commands:

```bash
# Run accessibility tests
npm test:accessibility

# Run cross-browser tests
npm test:browser
```

## Performance

- Images are optimized for web
- CSS and JavaScript are minified in production
- Lazy loading for below-the-fold content
- Critical CSS inlined in the head

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Font Awesome](https://fontawesome.com/) for icons
- [Google Fonts](https://fonts.google.com/) for typography
- [Normalize.css](https://necolas.github.io/normalize.css/) for consistent styling
- [A11y Project](https://www.a11yproject.com/) for accessibility guidance

## Contact

For support or questions, please contact [your-email@example.com](mailto:your-email@example.com).
