# Contributing to Cable Size Calculator AS/NZS 3008

Thank you for your interest in contributing to the Cable Size Calculator! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- A modern web browser
- Basic knowledge of HTML, CSS, and JavaScript
- Understanding of electrical engineering principles (helpful but not required)
- Git installed on your system

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/cable-size-calculator-as3008.git
   cd cable-size-calculator-as3008
   ```

2. **Start a local development server**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npm install
   npm run dev
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open your browser**
   Navigate to `http://localhost:8000`

## 🎯 Areas for Contribution

### High Priority
- **Enhanced Derating Calculations**: Implement more comprehensive derating factors
- **Additional Installation Methods**: Add support for more AS/NZS 3008 installation methods
- **Protection Device Types**: Implement MCCB and other protection device calculations
- **Mobile Responsiveness**: Improve mobile and tablet experience
- **Unit Tests**: Add comprehensive test coverage

### Medium Priority
- **Harmonic Current Considerations**: Add harmonic derating calculations
- **Cost Optimization**: Include cable cost analysis
- **Multiple Language Support**: Add internationalization
- **Advanced Options**: Implement more advanced calculation options
- **Performance Optimization**: Improve calculation speed and memory usage

### Low Priority
- **Dark Mode**: Add dark theme support
- **Accessibility**: Improve accessibility features
- **Documentation**: Enhance user documentation and help system
- **Export Formats**: Add more export formats (Excel, CSV)

## 📝 Code Style Guidelines

### JavaScript
- Use ES6+ features
- Follow camelCase naming convention
- Add JSDoc comments for functions
- Use meaningful variable names
- Keep functions focused and small

```javascript
/**
 * Calculates voltage drop for a given cable configuration
 * @param {Object} designState - The design parameters
 * @param {Object} cableImpedance - Cable impedance values
 * @returns {Object} Voltage drop calculation results
 */
calculateVoltageDrop(designState, cableImpedance) {
    const current = designState.rating;
    const distance = designState.distance;
    // ... implementation
}
```

### CSS
- Use meaningful class names
- Follow BEM methodology where appropriate
- Use CSS Grid and Flexbox for layouts
- Keep styles organized and commented

```css
/* Results section styling */
.results-section {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 15px;
    padding: 30px;
}

/* Result card component */
.result-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
}
```

### HTML
- Use semantic HTML elements
- Include proper ARIA labels
- Keep structure clean and organized
- Use meaningful IDs and classes

## 🧪 Testing

### Manual Testing
1. Test all form inputs and validations
2. Verify calculations with known values
3. Test responsive design on different screen sizes
4. Check PDF export functionality
5. Validate accessibility features

### Automated Testing (Future)
- Unit tests for calculation functions
- Integration tests for user workflows
- Visual regression tests
- Performance tests

## 📋 Pull Request Process

### Before Submitting
1. **Test your changes** thoroughly
2. **Update documentation** if needed
3. **Check code style** consistency
4. **Verify calculations** with known test cases

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Manual testing completed
- [ ] Calculations verified
- [ ] Responsive design tested
- [ ] Cross-browser compatibility checked

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
```

### Review Process
1. **Automated checks** will run
2. **Code review** by maintainers
3. **Testing verification**
4. **Approval and merge**

## 🐛 Bug Reports

### Before Reporting
1. Check existing issues
2. Test with latest version
3. Clear browser cache
4. Try different browsers

### Bug Report Template
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- Browser: [e.g., Chrome 90]
- OS: [e.g., Windows 10]
- Screen size: [e.g., 1920x1080]

## Additional Context
Any other relevant information
```

## 💡 Feature Requests

### Before Requesting
1. Check existing feature requests
2. Consider if it aligns with project goals
3. Think about implementation complexity

### Feature Request Template
```markdown
## Feature Description
Clear description of the feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should this be implemented?

## Alternatives Considered
Other approaches you've considered

## Additional Context
Any other relevant information
```

## 📚 Standards Reference

When contributing, please refer to:
- **AS/NZS 3008.1.1:2017**: Electrical installations—Selection of cables
- **AS/NZS 3000:2018**: Electrical installations (Wiring Rules)
- **Web Standards**: HTML5, CSS3, ES6+ JavaScript
- **Accessibility**: WCAG 2.1 guidelines

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow professional standards

### Communication
- Use clear, professional language
- Provide context for suggestions
- Ask questions when unsure
- Share knowledge and experience

## 📞 Getting Help

### Resources
- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For general questions and ideas
- **Documentation**: README and code comments
- **Standards**: AS/NZS 3008 and 3000 references

### Contact
- Create an issue for technical questions
- Use discussions for general inquiries
- Reference relevant standards for calculations

## 🎉 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation
- Community acknowledgments

Thank you for contributing to the Cable Size Calculator! Your efforts help make electrical engineering more accessible and accurate for everyone.
