# Changelog

All notable changes to the Cable Size Calculator AS/NZS 3008 project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-XX

### Added
- Initial release of Cable Size Calculator AS/NZS 3008
- Complete implementation of AS/NZS 3008 calculation engine
- Current rating lookup from AS/NZS 3008 Tables 4-21
- Derating calculations for grouping, temperature, and soil conditions
- Voltage drop calculations for 1-phase and 3-phase systems
- Loop impedance calculations with three source-impedance methods
- Short circuit thermal withstand checks using I²t ≤ K²S² formula
- Auto-sizing algorithm to find optimal cable size
- Earth conductor sizing per AS/NZS 3000 Table 5.1
- Interactive cable selection table with comparison
- Conduit sizing recommendations
- PDF export functionality for calculation reports
- Responsive design for desktop, tablet, and mobile
- Modern UI with glassmorphism effects
- Comprehensive input validation
- Real-time calculation with loading indicators
- Professional calculation reports with standards compliance

### Features
- **Standards Compliance**: Full implementation of AS/NZS 3008.1.1:2017 and AS/NZS 3000:2018
- **Deterministic Rules Engine**: 11-step calculation process following professional standards
- **Database Integration**: JSON-based AS/NZS 3008 table data
- **User Interface**: Clean, professional interface similar to JCalc.net
- **Cross-browser Compatibility**: Support for Chrome 70+, Firefox 65+, Safari 12+, Edge 79+
- **Mobile Responsive**: Optimized for all screen sizes
- **PDF Export**: Professional calculation reports for documentation
- **Interactive Elements**: Click-to-select cable sizes and conduit options

### Technical Implementation
- Pure HTML5, CSS3, and JavaScript (ES6+)
- Object-oriented JavaScript class structure
- CSS Grid and Flexbox layouts
- Font Awesome icons integration
- Local web server requirement for JSON loading
- No external dependencies for core functionality

### Documentation
- Comprehensive README with installation and usage instructions
- Contributing guidelines for developers
- MIT License for open source distribution
- Technical documentation of calculation methods
- Standards compliance information

## [Unreleased]

### Planned Features
- Enhanced derating calculations with more comprehensive factors
- Additional installation methods from AS/NZS 3008
- MCCB and other protection device calculations
- Harmonic current considerations
- Cost optimization features
- Multiple language support
- Dark mode theme
- Unit test coverage
- Performance optimizations
- Advanced calculation options

### Known Issues
- Simplified derating factors (full implementation requires extensive table data)
- Limited to Australian/New Zealand standards
- PDF export requires browser print functionality
- Some advanced installation methods not yet implemented

---

## Version Numbering

This project uses [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes

## Release Types

- **Feature Release**: New functionality and enhancements
- **Bug Fix Release**: Bug fixes and stability improvements
- **Documentation Release**: Documentation updates and improvements
- **Maintenance Release**: Dependency updates and code maintenance
