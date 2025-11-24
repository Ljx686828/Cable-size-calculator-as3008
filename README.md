# Cable Size Calculator AS/NZS 3008

A comprehensive web-based cable sizing calculator that implements the Australian/New Zealand Standard AS/NZS 3008 for electrical cable selection. This application provides accurate cable sizing calculations following the deterministic rules engine approach used by professional electrical engineering tools.

![Cable Calculator](https://img.shields.io/badge/Status-Production%20Ready-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![Standards](https://img.shields.io/badge/Standards-AS%2FNZS%203008-orange)

## 🌟 Features

### Core Functionality
- **Deterministic Rules Engine**: Implements AS/NZS 3008 + AS/NZS 3000 standards
- **Current Rating Lookup**: Automatic lookup from AS/NZS 3008 Tables 4-21
- **Derating Calculations**: Applies standard derating factors for grouping, temperature, soil conditions
- **Voltage Drop Calculations**: Supports both worst-case and specified power factor modes
- **Loop Impedance Checks**: Three source-impedance methods (estimated, calculated, measured)
- **Short Circuit Protection**: Thermal withstand checks using I²t ≤ K²S² formula
- **Auto-sizing Algorithm**: Finds smallest cable that meets all criteria
- **Earth Conductor Sizing**: Per AS/NZS 3000 Table 5.1 with fault rating checks

### User Interface
- **Modern Responsive Design**: Clean, professional interface similar to JCalc.net
- **Real-time Calculations**: Instant results with loading indicators
- **Interactive Cable Selection**: Click-to-select cable sizes with comparison table
- **Conduit Sizing**: Automatic conduit size recommendations
- **PDF Export**: Professional calculation reports for documentation

### Supported Standards
- AS/NZS 3008.1.1:2017 Electrical installations—Selection of cables
- AS/NZS 3000:2018 Electrical installations (Wiring Rules)
- Australian conditions and installation methods

## 🚀 Quick Start

### Prerequisites
- A modern web browser (Chrome 70+, Firefox 65+, Safari 12+, Edge 79+)
- A local web server (Python, Node.js, or PHP)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cable-size-calculator-as3008.git
   cd cable-size-calculator-as3008
   ```

2. **Start a local web server**
   
   **Option 1: Python (Recommended)**
   ```bash
   python -m http.server 8000
   ```
   
   **Option 2: Node.js**
   ```bash
   npm install
   npm start
   ```
   
   **Option 3: PHP**
   ```bash
   php -S localhost:8000
   ```

3. **Open your browser**
   Navigate to `http://localhost:8000`

## 📖 Usage

### Input Parameters

1. **Standard**: Australian conditions (default)
2. **Insulation**: Select from PVC, XLPE, Elastomeric, or MIMS options
3. **Installation**: Choose installation method (unenclosed, enclosed, buried, etc.)
4. **Load Parameters**:
   - Phase system (1-phase, 3-phase, DC)
   - Voltage (380V, 400V, 415V, 690V, 1000V)
   - Load current rating
5. **Cable Type**: Single core or multi-core configurations
6. **Conductor**: Copper or Aluminium
7. **Voltage Drop**: Maximum allowable voltage drop percentage
8. **Distance**: Cable run length in meters

### Calculation Process

The calculator follows a systematic 11-step process:

1. **Inputs → Design State**: Validates and processes all input parameters
2. **Base Current Rating**: Looks up Iz from AS/NZS 3008 tables
3. **Derating**: Applies grouping, temperature, and soil derating factors
4. **Cable Impedance**: Calculates R, X, Z at operating temperature
5. **Voltage Drop Check**: Verifies voltage drop within limits
6. **Loop Impedance**: Calculates Zs and maximum distance
7. **Short Circuit Check**: Validates thermal withstand capability
8. **Protection Device**: Auto-selects appropriate MCB/MCCB ratings
9. **Earth Conductor**: Sizes earth conductor per AS/NZS 3000
10. **Auto-sizing**: Finds optimal cable size meeting all criteria
11. **Results**: Displays comprehensive calculation results

### Results Display

The results section provides:

- **Load Information**: Current rating and operating conditions
- **Cable Specifications**: Selected conductor sizes and materials
- **Current Rating**: Derated current capacity with operating temperature
- **Impedance Data**: Resistance, reactance, and impedance values
- **Voltage Drop**: Actual voltage drop and maximum distance
- **Cable Selection Table**: Interactive comparison of available sizes
- **Conduit Sizing**: Recommended conduit sizes and fill ratios

### PDF Export

Click "List PDF Reports" to generate a professional calculation report including:
- Input parameters summary
- Selected cable specifications
- Detailed calculation results
- Standards compliance information

## 🏗️ Technical Implementation

### Architecture
- **Frontend**: Pure HTML5, CSS3, and JavaScript (ES6+)
- **Database**: JSON-based AS/NZS 3008 table data
- **Calculation Engine**: Object-oriented JavaScript class structure
- **Responsive Design**: CSS Grid and Flexbox layouts

### Key Classes and Methods

```javascript
class CableCalculator {
    // Core calculation methods
    createDesignState()           // Process input parameters
    lookupBaseCurrentRating()     // AS/NZS 3008 table lookup
    applyDeratingFactors()        // Derating calculations
    calculateCableImpedance()     // R, X, Z calculations
    calculateVoltageDrop()        // Voltage drop formulas
    calculateLoopImpedance()      // Zs calculations
    checkShortCircuitRating()      // Thermal withstand
    calculateProtectionDevice()    // MCB/MCCB selection
    calculateEarthConductor()     // Earth sizing
    performAutoSizeSearch()        // Optimization algorithm
}
```

### Database Structure

The JSON database contains:
- **Enums**: Standard values for all parameters
- **Current Rating Tables**: AS/NZS 3008 Tables 4-21
- **Resistance Tables**: Conductor resistance data
- **Reactance Tables**: Cable reactance values
- **Derating Factors**: Grouping, temperature, soil factors

## 📋 Standards Compliance

This calculator implements the following AS/NZS standards:

### AS/NZS 3008.1.1:2017
- Current-carrying capacity tables
- Derating factors for installation conditions
- Voltage drop calculation methods
- Short circuit thermal withstand

### AS/NZS 3000:2018
- Earth conductor sizing (Table 5.1)
- Protection device coordination
- Loop impedance requirements
- Installation method classifications

## 🌐 Browser Compatibility

- **Chrome**: 70+ (recommended)
- **Firefox**: 65+
- **Safari**: 12+
- **Edge**: 79+

## 📁 Project Structure

```
cable-size-calculator-as3008/
├── index.html                    # Main application interface
├── styles.css                    # Styling and responsive design
├── script.js                     # Calculation engine and logic
├── as_nzs_3008_scaffold_v2.json # AS/NZS 3008 database
├── package.json                  # Node.js dependencies
├── .gitignore                    # Git ignore rules
├── README.md                     # This file
└── LICENSE                       # MIT License
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Areas for Contribution

- Expanding derating factor calculations
- Adding more installation methods
- Implementing additional protection device types
- Adding harmonic current considerations
- Including cost optimization features
- Improving mobile responsiveness
- Adding unit tests

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This calculator is for educational and demonstration purposes. Always consult qualified electrical engineers and relevant standards for actual electrical installations. Ensure compliance with local electrical codes and standards for actual engineering applications.

## 📞 Support

For technical issues or questions about the calculation methods, refer to:
- AS/NZS 3008.1.1:2017 standard
- AS/NZS 3000:2018 standard
- Professional electrical engineering resources

## 🙏 Acknowledgments

- AS/NZS 3008.1.1:2017 standard for cable selection tables
- AS/NZS 3000:2018 standard for electrical installation requirements
- JCalc.net for inspiration on user interface design
- Electrical engineering community for standards implementation guidance

---

**Made with ❤️ for the electrical engineering community**