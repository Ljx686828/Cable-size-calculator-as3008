// Cable Size Calculator AS/NZS 3008 - Rules Engine
class CableCalculator {
    constructor() {
        this.database = null;
        this.currentCalculation = null;
        this.initializeEventListeners();
        this.loadDatabase();
    }

    async loadDatabase() {
        try {
            const response = await fetch('as_nzs_3008_scaffold_v2.json');
            this.database = await response.json();
            console.log('Database loaded successfully');
        } catch (error) {
            console.error('Error loading database:', error);
            this.showError('Failed to load calculation database');
        }
    }

    initializeEventListeners() {
        // Calculate button
        document.getElementById('calculate').addEventListener('click', () => {
            this.performCalculation();
        });

        // Reset button
        document.getElementById('reset').addEventListener('click', () => {
            this.resetForm();
        });

        // Installation type change
        document.getElementById('installation').addEventListener('change', (e) => {
            this.updateInstallationIcon(e.target.value);
        });

        // Cable selection table rows
        document.addEventListener('click', (e) => {
            if (e.target.closest('.cable-selection-table tbody tr')) {
                this.selectCableSize(e.target.closest('tr'));
            }
        });

        // Conduit size radio buttons
        document.addEventListener('change', (e) => {
            if (e.target.name === 'conduit-size') {
                this.updateConduitSelection(e.target.value);
            }
        });

        // PDF Export button
        document.getElementById('list-pdf').addEventListener('click', () => {
            this.exportToPDF();
        });
    }

    updateInstallationIcon(installation) {
        const iconMap = {
            'Spaced from surface': 'fas fa-wind',
            'Touching surface': 'fas fa-wind',
            'Exposed to sun': 'fas fa-sun',
            'Wiring enclosure in air': 'fas fa-building',
            'Partially surrounded by thermal insulation, in wiring enclosure': 'fas fa-thermometer-half',
            'Partially surrounded by thermal insulation, unenclosed': 'fas fa-thermometer-half',
            'Completely surrounded by thermal insulation, in wiring enclosure': 'fas fa-thermometer-half',
            'Completely surrounded by thermal insulation, unenclosed': 'fas fa-thermometer-half',
            'Buried direct': 'fas fa-mountain',
            'Underground duct same': 'fas fa-road',
            'Underground duct separate': 'fas fa-road'
        };
        
        const icon = document.querySelector('#installation-icon i');
        icon.className = iconMap[installation] || 'fas fa-building';
    }

    async performCalculation() {
        if (!this.database) {
            this.showError('Database not loaded yet. Please wait...');
            return;
        }

        try {
            this.showLoading();
            
            // Step 1: Inputs → design state
            const designState = this.createDesignState();
            
            // Step 2: Base current rating lookup
            // Returns table, column, and all columnData (rows with I_z(S) values)
            const baseRating = this.lookupBaseCurrentRating(designState);
            
            // Step 3: Apply derating factors per row
            // Compute C_total and calculate I_z,adj(S) = I_z(S) · C_total for each row
            // Mark sizes where I_z,adj(S) >= I_b
            const deratedRating = this.applyDeratingFactors(baseRating.columnData, designState);
            
            // Step 4: Cable R, X, Z versus temperature
            const cableImpedance = this.calculateCableImpedance(designState);
            
            // Step 5: Voltage drop check
            const voltageDrop = this.calculateVoltageDrop(designState, cableImpedance);
            
            // Step 6: Loop impedance and max distance
            const loopImpedance = this.calculateLoopImpedance(designState, cableImpedance);
            
            // Step 7: Short circuit thermal withstand
            const shortCircuitCheck = this.checkShortCircuitRating(designState);
            
            // Step 8: Protection device logic
            const protectionDevice = this.calculateProtectionDevice(designState);
            
            // Step 9: Earth conductor sizing
            const earthConductor = this.calculateEarthConductor(designState);
            
            // Step 10: Auto size search
            const selectedSize = this.performAutoSizeSearch(designState);
            
            // Step 11: Generate outputs
            this.displayResults({
                designState,
                baseRating,
                deratedRating,
                cableImpedance,
                voltageDrop,
                loopImpedance,
                shortCircuitCheck,
                protectionDevice,
                earthConductor,
                selectedSize
            });

        } catch (error) {
            console.error('Calculation error:', error);
            this.showError('Calculation failed: ' + error.message);
        }
    }

    createDesignState() {
        return {
            standard: document.getElementById('standard').value,
            insulation: document.getElementById('insulation').value,
            installation: document.getElementById('installation').value,
            phase: document.getElementById('phase').value,
            voltage: parseFloat(document.getElementById('voltage').value),
            rating: parseFloat(document.getElementById('rating').value),
            cableType: document.getElementById('cable-type').value,
            conductor: document.getElementById('conductor').value,
            maxVoltageDrop: parseFloat(document.getElementById('max-voltage-drop').value),
            activeSize: document.getElementById('active-size').value,
            distance: parseFloat(document.getElementById('distance').value),
            earthSize: document.getElementById('earth-size').value,
            flexibleCable: document.getElementById('flexible-cable').checked,
            useParallel: document.getElementById('use-parallel').checked,
            calculateConduit: document.getElementById('calculate-conduit').checked,
            conduitType: document.getElementById('conduit-type').value,
            checkShortCircuit: document.getElementById('check-short-circuit').checked,
            checkLoopImpedance: document.getElementById('check-loop-impedance').checked,
            showDerating: document.getElementById('show-derating').checked,
            advancedOptions: document.getElementById('advanced-options').checked
        };
    }

    lookupBaseCurrentRating(designState) {
        // Step 1: Find the correct current table based on:
        // - Cable type
        // - Insulation type (from insulation option)
        // - Maximum temp (from insulation option - these two are combined)
        const table = this.findCurrentRatingTable(designState);
        if (!table) {
            throw new Error('No suitable current rating table found');
        }

        // Step 2: Choose the correct column using:
        // - Installation from user input (which is the arrangement in the JSON file)
        // - Conductor material
        const column = this.findCurrentRatingColumn(table, designState);
        if (!column) {
            throw new Error('No suitable column found in current rating table');
        }

        // Step 3: Record all rows of the correct column for later use
        const columnData = this.getAllRowsForColumn(table, column);

        return {
            table: table,
            column: column,
            columnData: columnData, // All rows with I_z(S) values
            reference: `${table.table_id}, ${column}`
        };
    }

    findCurrentRatingTable(designState) {
        // Find table matching:
        // 1. Cable type
        // 2. Insulation type (from insulation option)
        // 3. Maximum temp (from insulation option - these two are combined)
        const tables = this.database.current_rating_tables;
        
        // Find table matching all criteria
        for (const table of tables) {
            if (this.tableMatchesDesignState(table, designState)) {
                return table;
            }
        } // return table that matches the design state
        
        // Fallback to first available table
        console.warn('No exact table match found, using fallback table');
        return tables[0];
    }

    tableMatchesDesignState(table, designState) {
        // Step 1: Match cable type (number of cores)
        const cableTypeMatch = this.matchCableType(table, designState);
        if (!cableTypeMatch) return false;
        
        // Step 2: Match insulation type and max temperature (combined in insulation option)
        const insulationMatch = this.matchInsulationAndTemp(table, designState);
        if (!insulationMatch) return false;
        
        return true;
    }

    matchCableType(table, designState) {
        // Map cable_type enum to table cable_type
        const cableTypeMap = {
            'TWO_CORE_SHEATHED': ['Two-core sheathed'],   //Name in frontend:name in json
            'TWO_SINGLE_CORE': ['Two single-core'],
            'THREE_SINGLE_CORE': ['Three single-core'],
            'MULTICORE': ['Multicore'],
            'THREE_CORE_AND_FOUR_CORE_SHEATHED': ['Three-core and four-core sheathed'],
            'THREE_CORE_AND_FOUR_CORE': ['Three-core and four-core'],
            'FLEXIBLE_CORD': ['Flexible cords'],
            'CABLE_AND_FLEXIBLE_CORDS': ['Cables and flexible cords'],
            'BARE_SINGLE_CORE_MIMS_CABLES_WITH_COPPER_CONDUCTORS': ['Bare single-core MIMS cables with copper conductors']
        };
        
        const tableCableType = table.cable_type;
        if (!tableCableType) return false;
        
        const expectedTypes = cableTypeMap[designState.cableType] || [];
        const tableTypeLower = tableCableType.toLowerCase();
        
        return expectedTypes.some(type => 
            tableTypeLower.includes(type.toLowerCase()) ||
            type.toLowerCase().includes(tableTypeLower)
        );
    }

    matchInsulationAndTemp(table, designState) {   //Name in frontend:name in json(insulation_type)
        // Match both insulation type and max temperature from insulation option
        const insulationMap = {
            'PVC_V75': { type: 'Thermoplastic', temp: 75 },
            'PVC_V90': { type: 'Thermoplastic', temp: 75 }, // PVC_V90 also uses Thermoplastic at 75°C
            'PVC_V60': { type: 'Thermoplastic', temp: 60 },
            'XLPE_90': { type: 'XLPE', temp: 90 },
            'X-90': { type: 'X-90', temp: 90 },
            'X-H-90': { type: 'X-90', temp: 90 },
            'X-HF-90': { type: 'X-HF-90', temp: 90 },
            'X-HF-110': { type: 'X-HF-110', temp: 110 },
            'R-E-110': { type: 'R-E-110', temp: 110 },
            'R-EP-90': { type: 'R-EP-90', temp: 90 },
            'R-CPE-90': { type: 'R-CPE-90', temp: 90 },
            'R-HF-90': { type: 'R-HF-90', temp: 90 },
            'R-HF-110': { type: 'R-HF-110', temp: 110 },
            'R-CSP-90': { type: 'R-CSP-90', temp: 90 },
            'R-S-150': { type: 'R-S-150', temp: 150 },
            'Cross-linked Polyethylene': { type: 'Cross-linked', temp: 60 },
            'Type 150 fibrous': { type: 'Type 150 fibrous', temp: 150 },
            '150°C Rated Fluoropolymer': { type: '150°C Rated Fluoropolymer', temp: 150 }
        };
        
        const expected = insulationMap[designState.insulation];
        if (!expected) return false;
        
        const tableInsulationType = table.insulation_type;
        const tableTemp = table.max_temp_C;
        
        // Match insulation type
        let insulationMatch = false;
        if (Array.isArray(tableInsulationType)) { //check if tableInsulationType is an array
            insulationMatch = tableInsulationType.some(type =>
                type.toLowerCase().includes(expected.type.toLowerCase())
            );
        } else {
            insulationMatch =
            tableInsulationType &&
            tableInsulationType.toLowerCase().includes(expected.type.toLowerCase());
        }
        
        // Match temperature (exact match preferred)
        const tempMatch = tableTemp === expected.temp;
        
        return insulationMatch && tempMatch;
    }

    findCurrentRatingColumn(table, designState) {
        const columns = table.columns;
        
        // Find column matching installation arrangement and conductor material
        for (const [colId, colData] of Object.entries(columns)) {
            if (this.columnMatchesDesignState(colData, designState)) {
                return colId;
            }
        }
        
        // Fallback to first available column
        return Object.keys(columns)[0];
    }

    columnMatchesDesignState(colData, designState) {
        // Match conductor material
        const materialMatch = colData.material === designState.conductor;
        
        // Match installation arrangement (simplified)
        const arrangementMatch = this.mapInstallationToArrangement(designState.installation, colData.arrangement);
        
        return materialMatch && arrangementMatch;
    }

    mapInstallationToArrangement(installation, arrangement) {
        const mapping = {
            'Spaced from surface': 'UNENCLOSED_SPACED',
            'Touching surface': 'UNENCLOSED_TOUCHING',
            'Exposed to sun': 'UNENCLOSED_EXPOSED_TO_SUN',
            'Wiring enclosure in air': 'ENCLOSED_IN_AIR',
            'Partially surrounded by thermal insulation, in wiring enclosure': 'THERMAL_INSULATION_PARTIAL_ENCLOSED',
            'Partially surrounded by thermal insulation, unenclosed': 'THERMAL_INSULATION_PARTIAL_UNENCLOSED',
            'Completely surrounded by thermal insulation, in wiring enclosure': 'THERMAL_INSULATION_COMPLETE_ENCLOSED',
            'Completely surrounded by thermal insulation, unenclosed': 'THERMAL_INSULATION_COMPLETE_UNENCLOSED',
            'Buried direct': 'BURIED_DIRECT',
            'Underground duct same': 'UNDERGROUND_DUCT_SAME',
            'Underground duct separate': 'UNDERGROUND_DUCT_SEPARATE'
        };
        
        const mappedArrangement = mapping[installation];
        return mappedArrangement === arrangement;
    }

    getAllRowsForColumn(table, column) {
        // Record all rows of the correct column for later use
        // Each row contains: { size: S, I_z: I_z(S) }
        return table.rows.map(row => ({
            size: row.size,
            I_z: row.values[column] || null // I_z(S) - base current rating
        })).filter(row => row.I_z !== null); // Only include rows with valid data
    }

    getCurrentRatingForSize(table, column, cableSize) {
        const row = table.rows.find(r => r.size === cableSize);
        return row ? row.values[column] : null;
    }

    applyDeratingFactors(columnData, designState) {
        // Apply derating per row (not per column globally)
        // Compute combined factor: C_total = C_a · C_g · C_s · C_i · ...
        
        // Get individual derating factors
        const C_a = this.getAmbientTemperatureFactor(designState);      // Ambient temperature
        const C_g = this.getGroupingFactor(designState);                // Grouping/bunching
        const C_s = this.getSoilThermalFactor(designState);             // Soil thermal resistivity
        const C_i = this.getInstallationFactor(designState);            // Installation method
        
        // Compute combined derating factor
        const C_total = C_a * C_g * C_s * C_i;
        
        // For each size: I_z,adj(S) = I_z(S) · C_total
        // Mark sizes where I_z,adj(S) >= I_b (I_b is the load current)
        const I_b = designState.rating; // Load current
        
        const deratedRows = columnData.map(row => {
            const I_z_adj = row.I_z * C_total; // Adjusted current rating
            const meetsRequirement = I_z_adj >= I_b; // Mark if meets load current requirement
            
            return {
                size: row.size,
                I_z: row.I_z,                    // Base current rating I_z(S)
                I_z_adj: I_z_adj,                // Adjusted current rating I_z,adj(S)
                meetsRequirement: meetsRequirement, // I_z,adj(S) >= I_b
                C_total: C_total                 // Combined derating factor
            };
        });
        
        return {
            deratedRows: deratedRows,
            C_total: C_total,
            factors: {
                C_a: C_a,
                C_g: C_g,
                C_s: C_s,
                C_i: C_i
            },
            I_b: I_b
        };
    }

    getAmbientTemperatureFactor(designState) {
        // C_a: Ambient temperature factor
        // Simplified - in reality, this would use AS/NZS 3008 temperature derating tables
        const ambientTemp = 40; // Default ambient temperature (can be made configurable)
        const maxTemp = this.getMaxTemperature(designState.insulation);
        
        if (ambientTemp <= 40) return 1.0;
        // Formula: C_a = sqrt((T_max - T_ambient) / (T_max - 40))
        return Math.sqrt((maxTemp - ambientTemp) / (maxTemp - 40));
    }

    getGroupingFactor(designState) {
        // C_g: Grouping/bunching factor
        // Simplified - in reality, this would depend on number of cables and spacing
        return 0.95; // 5% derating for grouping (default)
    }

    getSoilThermalFactor(designState) {
        // C_s: Soil thermal resistivity factor
        // Only applies to buried cables
        if (designState.installation === 'BURIED_DIRECT' || designState.installation === 'UNDERGROUND_DUCT') {
            // Simplified - in reality, this would use AS/NZS 3008 soil thermal resistivity tables
            return 0.9; // 10% derating for soil conditions (default)
        }
        return 1.0; // No derating for non-buried cables
    }

    getInstallationFactor(designState) {
        // C_i: Installation method factor
        // Additional derating factors specific to installation method
        // For now, return 1.0 (no additional derating)
        // This can be expanded based on AS/NZS 3008 installation method tables
        return 1.0;
    }

    getMaxTemperature(insulation) {
        const tempMap = {
            'PVC_V75': 75,
            'PVC_V90': 90,
            'XLPE_90': 90,
            'XLPE_110': 110,
            'ELASTOMERIC_90': 90,
            'ELASTOMERIC_110': 110,
            'MIMS_250': 250
        };
        return tempMap[insulation] || 90;
    }

    calculateOperatingTemperature(designState, deratingFactor) {
        const ambientTemp = 40;
        const maxTemp = this.getMaxTemperature(designState.insulation);
        
        // Simplified calculation
        return ambientTemp + (maxTemp - ambientTemp) * (1 - deratingFactor);
    }

    calculateCableImpedance(designState) {
        const cableSize = designState.activeSize === 'AUTO' ? 16 : parseFloat(designState.activeSize);
        
        // Get resistance and reactance from tables
        const resistanceData = this.getResistance(cableSize, designState);
        const reactanceData = this.getReactance(cableSize, designState);
        const impedance = Math.sqrt(resistanceData.value * resistanceData.value + reactanceData.value * reactanceData.value);
        
        return {
            resistance: resistanceData.value,
            reactance: reactanceData.value,
            impedance: impedance,
            cableSize: cableSize,
            resistanceRef: resistanceData.reference,
            reactanceRef: reactanceData.reference
        };
    }

    getResistance(cableSize, designState) {
        // Look up resistance from database tables
        if (!this.database || !this.database.resistance_tables) {
            // Fallback to hardcoded values if database not available
            const resistanceMap = {
                1: 18.1, 1.5: 12.1, 2.5: 7.41, 4: 4.61, 6: 3.08,
                10: 1.83, 16: 1.15, 25: 0.727, 35: 0.524, 50: 0.387,
                70: 0.268, 95: 0.193, 120: 0.153
            };
            return {
                value: resistanceMap[cableSize] || 1.15,
                reference: 'Table 35 (estimated)'
            };
        }

        // Find appropriate resistance table based on cable type
        const tables = this.database.resistance_tables;
        const table = this.findResistanceTable(tables, designState);
        
        if (!table) {
            return { value: 1.15, reference: 'Table 35 (estimated)' };
        }

        // Find appropriate column based on material and temperature
        const column = this.findResistanceColumn(table, designState);
        if (!column) {
            const tableNumber = table.table_id.replace('T', '');
            return { value: 1.15, reference: `Table ${tableNumber} (estimated)` };
        }

        // Find row for cable size
        const row = table.rows.find(r => 
            (r.conductor_size_mm2 === cableSize) || 
            (r.conductor_size_or_stranding && parseFloat(r.conductor_size_or_stranding) === cableSize)
        );
        
        if (!row || !row.values || row.values[column] === null || row.values[column] === undefined) {
            const tableNumber = table.table_id.replace('T', '');
            return { value: 1.15, reference: `Table ${tableNumber}, ${column} (estimated)` };
        }

        // Format reference: Extract table number from table_id (e.g., "T35" -> "35")
        const tableNumber = table.table_id.replace('T', '');
        return {
            value: row.values[column],
            reference: `Table ${tableNumber}, ${column}`
        };
    }

    getReactance(cableSize, designState) {
        // Look up reactance from database tables
        if (!this.database || !this.database.reactance_tables) {
            // Fallback to hardcoded values if database not available
            const reactanceMap = {
                1: 0.114, 1.5: 0.111, 2.5: 0.102, 4: 0.102, 6: 0.0967,
                10: 0.0906, 16: 0.0861, 25: 0.0805, 35: 0.0742, 50: 0.0681,
                70: 0.0620, 95: 0.0559, 120: 0.0498
            };
            return {
                value: reactanceMap[cableSize] || 0.0861,
                reference: 'Table 30 (estimated)'
            };
        }

        // Find appropriate reactance table based on cable type
        const tables = this.database.reactance_tables;
        const table = this.findReactanceTable(tables, designState);
        
        if (!table) {
            return { value: 0.0861, reference: 'Table 30 (estimated)' };
        }

        // Find appropriate column based on arrangement and insulation
        const column = this.findReactanceColumn(table, designState);
        if (!column) {
            const tableNumber = table.table_id.replace('T', '');
            return { value: 0.0861, reference: `Table ${tableNumber} (estimated)` };
        }

        // Find row for cable size
        const row = table.rows.find(r => 
            (r.conductor_size_mm2 === cableSize) || 
            (r.conductor_size_or_stranding && parseFloat(r.conductor_size_or_stranding) === cableSize)
        );
        
        if (!row || !row.values || row.values[column] === null || row.values[column] === undefined) {
            const tableNumber = table.table_id.replace('T', '');
            return { value: 0.0861, reference: `Table ${tableNumber}, ${column} (estimated)` };
        }

        // Format reference: Extract table number from table_id (e.g., "T30" -> "30")
        const tableNumber = table.table_id.replace('T', '');
        return {
            value: row.values[column],
            reference: `Table ${tableNumber}, ${column}`
        };
    }

    findResistanceTable(tables, designState) {
        // Find table matching cable type
        // For now, default to Table 35 (Multicore with circular conductors)
        // This can be enhanced to match cable type more precisely
        return tables.find(t => t.table_id === 'T35') || tables[0];
    }

    findResistanceColumn(table, designState) {
        // Find column matching material and temperature
        const material = designState.conductor === 'CU' ? 'Copper' : 'Aluminium';
        const maxTemp = this.getMaxTemperature(designState.insulation);
        
        // Find column with matching material and closest temperature
        for (const [colId, colData] of Object.entries(table.columns)) {
            if (colData.material === material) {
                const colTemp = colData.temperature_C;
                // Use column if temperature matches or is closest
                if (colTemp === maxTemp || (colTemp <= maxTemp && colTemp >= maxTemp - 15)) {
                    return colId;
                }
            }
        }
        
        // Fallback: find any column with matching material
        for (const [colId, colData] of Object.entries(table.columns)) {
            if (colData.material === material) {
                return colId;
            }
        }
        
        return Object.keys(table.columns)[0]; // Fallback to first column
    }

    findReactanceTable(tables, designState) {
        // Find table matching cable type
        // Default to Table 30 (All cables except flexible, MIMS, aerial)
        return tables.find(t => t.table_id === 'T30') || tables[0];
    }

    findReactanceColumn(table, designState) {
        // Find column matching arrangement and insulation
        const insulation = designState.insulation;
        let insulationType = 'PVC'; // Default
        if (insulation.includes('XLPE') || insulation.includes('X-')) {
            insulationType = 'XLPE';
        } else if (insulation.includes('Elastomer') || insulation.includes('R-')) {
            insulationType = 'Elastomer';
        }

        // Determine arrangement based on cable type
        let arrangement = 'Multicore Circular conductors';
        if (designState.cableType.includes('SINGLE_CORE')) {
            arrangement = 'Single-core Trefoil or single phase';
        }

        // Find column with matching arrangement and insulation
        for (const [colId, colData] of Object.entries(table.columns)) {
            if (colData.arrangement && colData.arrangement.includes(arrangement.split(' ')[0])) {
                if (colData.insulation === insulationType) {
                    return colId;
                }
            }
        }
        
        // Fallback: find any column with matching arrangement
        for (const [colId, colData] of Object.entries(table.columns)) {
            if (colData.arrangement && colData.arrangement.includes(arrangement.split(' ')[0])) {
                return colId;
            }
        }
        
        return Object.keys(table.columns)[0]; // Fallback to first column
    }

    calculateVoltageDrop(designState, cableImpedance) {
        const current = designState.rating;
        const distance = designState.distance;
        const voltage = designState.voltage;
        
        let voltageDrop;
        
        if (designState.phase === '3P_AC') {
            // 3-phase: ΔV = (I × L × √3 × Zc) / 1000
            voltageDrop = (current * distance * Math.sqrt(3) * cableImpedance.impedance) / 1000;
        } else {
            // Single-phase: ΔV = (I × L × 2 × Zc) / 1000
            voltageDrop = (current * distance * 2 * cableImpedance.impedance) / 1000;
        }
        
        const voltageDropPercent = (voltageDrop / voltage) * 100;
        const voltageAtLoad = voltage - voltageDrop;
        
        return {
            voltageDrop: voltageDrop,
            voltageDropPercent: voltageDropPercent,
            voltageAtLoad: voltageAtLoad,
            maxDistance: this.calculateMaxDistance(designState, cableImpedance)
        };
    }

    calculateMaxDistance(designState, cableImpedance) {
        const maxVoltageDrop = designState.maxVoltageDrop;
        const maxVoltageDropVolts = (designState.voltage * maxVoltageDrop) / 100;
        const current = designState.rating;
        
        let maxDistance;
        
        if (designState.phase === '3P_AC') {
            maxDistance = (maxVoltageDropVolts * 1000) / (current * Math.sqrt(3) * cableImpedance.impedance);
        } else {
            maxDistance = (maxVoltageDropVolts * 1000) / (current * 2 * cableImpedance.impedance);
        }
        
        return maxDistance;
    }

    calculateLoopImpedance(designState, cableImpedance) {
        // Simplified loop impedance calculation
        const phaseImpedance = cableImpedance.impedance;
        const earthImpedance = this.calculateEarthImpedance(designState);
        
        return {
            phaseImpedance: phaseImpedance,
            earthImpedance: earthImpedance,
            totalImpedance: phaseImpedance + earthImpedance
        };
    }

    calculateEarthImpedance(designState) {
        // Simplified earth impedance calculation
        const earthSize = designState.earthSize === 'AUTO' ? this.calculateEarthSize(designState) : parseFloat(designState.earthSize);
        
        // Earth conductor typically has higher resistance
        const earthResistance = this.getResistance(earthSize, designState) * 1.5; // Simplified factor
        const earthReactance = this.getReactance(earthSize, designState);
        
        return Math.sqrt(earthResistance * earthResistance + earthReactance * earthReactance);
    }

    calculateEarthSize(designState) {
        // Simplified earth sizing per AS/NZS 3000 Table 5.1
        const activeSize = designState.activeSize === 'AUTO' ? 16 : parseFloat(designState.activeSize);
        
        const earthSizeMap = {
            1: 1,
            1.5: 1.5,
            2.5: 2.5,
            4: 2.5,
            6: 2.5,
            10: 4,
            16: 6,
            25: 6,
            35: 10,
            50: 10,
            70: 16,
            95: 16,
            120: 16
        };
        
        return earthSizeMap[activeSize] || 6;
    }

    checkShortCircuitRating(designState) {
        // Simplified short circuit check: I²t ≤ K²S²
        const cableSize = designState.activeSize === 'AUTO' ? 16 : parseFloat(designState.activeSize);
        const K = this.getKFactor(designState.insulation);
        const S = cableSize;
        
        // Assume a typical fault current
        const faultCurrent = 1000; // Amperes
        const faultTime = 0.1; // seconds
        
        const I2t = faultCurrent * faultCurrent * faultTime;
        const K2S2 = K * K * S * S;
        
        return {
            passes: I2t <= K2S2,
            I2t: I2t,
            K2S2: K2S2,
            K: K,
            S: S
        };
    }

    getKFactor(insulation) {
        const KMap = {
            'PVC_V75': 115,
            'PVC_V90': 115,
            'XLPE_90': 143,
            'XLPE_110': 143,
            'ELASTOMERIC_90': 143,
            'ELASTOMERIC_110': 143,
            'MIMS_250': 115
        };
        return KMap[insulation] || 115;
    }

    calculateProtectionDevice(designState) {
        // Simplified protection device calculation
        const rating = designState.rating;
        
        // Auto-select MCB rating
        const mcbRating = this.selectMCBRating(rating);
        
        return {
            type: 'MCB',
            rating: mcbRating,
            tripMultiple: this.getTripMultiple('B'), // Type B curve
            minTripCurrent: mcbRating * this.getTripMultiple('B')
        };
    }

    selectMCBRating(loadCurrent) {
        // Standard MCB ratings
        const ratings = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];
        
        for (const rating of ratings) {
            if (rating >= loadCurrent) {
                return rating;
            }
        }
        
        return 125; // Maximum standard rating
    }

    getTripMultiple(type) {
        const multiples = {
            'B': 4,
            'C': 7.5,
            'D': 12.5
        };
        return multiples[type] || 4;
    }

    calculateEarthConductor(designState) {
        const earthSize = this.calculateEarthSize(designState);
        
        return {
            size: earthSize,
            resistance: this.getResistance(earthSize, designState) * 1.5,
            reactance: this.getReactance(earthSize, designState),
            impedance: this.calculateEarthImpedance(designState)
        };
    }

    performAutoSizeSearch(designState) {
        // Find the smallest cable size that satisfies all criteria
        // Uses the deratedRows to find sizes where I_z,adj(S) >= I_b
        try {
            const baseRating = this.lookupBaseCurrentRating(designState);
            const deratedRating = this.applyDeratingFactors(baseRating.columnData, designState);
            
            // Find the smallest size that meets the requirement (I_z,adj(S) >= I_b)
            const suitableSizes = deratedRating.deratedRows
                .filter(row => row.meetsRequirement)
                .sort((a, b) => a.size - b.size);
            
            if (suitableSizes.length > 0) {
                // Check voltage drop for the smallest suitable size
                const selectedSize = suitableSizes[0].size;
                const testDesignState = { ...designState, activeSize: selectedSize.toString() };
                const cableImpedance = this.calculateCableImpedance(testDesignState);
                const voltageDrop = this.calculateVoltageDrop(testDesignState, cableImpedance);
                
                // If voltage drop is acceptable, return this size
                if (voltageDrop.voltageDropPercent <= designState.maxVoltageDrop) {
                    return selectedSize;
                }
                
                // Otherwise, try the next suitable size
                for (let i = 1; i < suitableSizes.length; i++) {
                    const size = suitableSizes[i].size;
                    const testState = { ...designState, activeSize: size.toString() };
                    const impedance = this.calculateCableImpedance(testState);
                    const vd = this.calculateVoltageDrop(testState, impedance);
                    
                    if (vd.voltageDropPercent <= designState.maxVoltageDrop) {
                        return size;
                    }
                }
            }
            
            // Fallback to largest size
            const largestSize = deratedRating.deratedRows[deratedRating.deratedRows.length - 1];
            return largestSize ? largestSize.size : 120;
        } catch (error) {
            console.error('Auto size search error:', error);
            return 120; // Fallback
        }
    }

    displayResults(results) {
        // Store current calculation for PDF export
        this.currentCalculation = results;
        
        const resultsSection = document.getElementById('results-section');
        resultsSection.style.display = 'block';
        
        // Update load information
        document.getElementById('load-current').textContent = `${results.designState.rating} A`;
        
        // Update cable information
        const selectedSize = results.selectedSize;
        document.getElementById('phase1-core').textContent = `${selectedSize} mm²`;
        document.getElementById('phase2-core').textContent = `${selectedSize} mm²`;
        document.getElementById('phase3-core').textContent = `${selectedSize} mm²`;
        document.getElementById('neutral-core').textContent = `${selectedSize} mm²`;
        document.getElementById('earth-core').textContent = `${results.earthConductor.size} mm²`;
        document.getElementById('conductors').textContent = results.designState.conductor === 'CU' ? 'Copper' : 'Aluminium';
        
        // Update conduit information
        document.getElementById('conduit-type-result').textContent = results.designState.conduitType;
        document.getElementById('required-cables').textContent = `1 x ${selectedSize} mm²`;
        
        // Update current rating
        // Find the selected size in deratedRows
        const selectedRow = results.deratedRating.deratedRows.find(row => row.size === selectedSize);
        const adjustedRating = selectedRow ? Math.round(selectedRow.I_z_adj) : 0;
        const baseRating = selectedRow ? selectedRow.I_z : 0;
        
        document.getElementById('rated-current').textContent = `${adjustedRating} A`;
        // Format reference: Extract table number from table_id (e.g., "T04" -> "4")
        const tableNumber = results.baseRating.table.table_id.replace('T', '');
        document.getElementById('rated-current-ref').textContent = `Table ${tableNumber}, ${results.baseRating.column}`;
        
        // Calculate operating temperature from derating factor
        const ambientTemp = 40;
        const maxTemp = this.getMaxTemperature(results.designState.insulation);
        const C_total = results.deratedRating.C_total;
        const operatingTemp = ambientTemp + (maxTemp - ambientTemp) * (1 - C_total);
        
        document.getElementById('operating-temp').textContent = `${Math.round(operatingTemp)}°C`;
        document.getElementById('max-operating-temp').textContent = `${this.getMaxTemperature(results.designState.insulation)}°C`;
        
        // Update impedance
        document.getElementById('resistance-per-core').textContent = `${results.cableImpedance.resistance} Ω/km`;
        document.getElementById('resistance-ref').textContent = results.cableImpedance.resistanceRef || 'Table 35 (estimated)';
        document.getElementById('reactance-per-core').textContent = `${results.cableImpedance.reactance} Ω/km`;
        document.getElementById('reactance-ref').textContent = results.cableImpedance.reactanceRef || 'Table 30 (estimated)';
        document.getElementById('impedance-per-core').textContent = `${results.cableImpedance.impedance.toFixed(4)} Ω/km`;
        
        // Update voltage drop
        document.getElementById('voltage-drop-result').textContent = 
            `${results.voltageDrop.voltageDropPercent.toFixed(1)}%, ${results.voltageDrop.voltageDrop.toFixed(1)} V`;
        document.getElementById('voltage-at-load').textContent = `${results.voltageDrop.voltageAtLoad.toFixed(1)} V`;
        document.getElementById('max-distance').textContent = `${Math.round(results.voltageDrop.maxDistance)} m for ${results.designState.maxVoltageDrop}%`;
        
        // Update earth impedance
        document.getElementById('earth-resistance').textContent = `${results.earthConductor.resistance.toFixed(2)} Ω/km`;
        document.getElementById('earth-reactance').textContent = `${results.earthConductor.reactance} Ω/km`;
        document.getElementById('earth-impedance').textContent = `${results.earthConductor.impedance.toFixed(4)} Ω/km`;
        
        // Generate cable selection table
        this.generateCableSelectionTable(results);
        
        // Generate conduit size options
        this.generateConduitSizeOptions(selectedSize);
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    generateCableSelectionTable(results) {
        const tbody = document.getElementById('cable-selection-tbody');
        tbody.innerHTML = '';
        
        // Use deratedRows data - show sizes that are available in the table
        // Limit to common sizes for display
        const displaySizes = [1, 1.5, 2.5, 4, 6, 10, 16, 25, 35];
        
        displaySizes.forEach(size => {
            // Find this size in deratedRows
            const deratedRow = results.deratedRating.deratedRows.find(row => row.size === size);
            if (!deratedRow) return; // Skip if size not in table
            
            const row = document.createElement('tr');
            if (size === results.selectedSize) {
                row.classList.add('selected');
            }
            
            const earthSize = this.calculateEarthSize({ ...results.designState, activeSize: size.toString() });
            const voltageDrop = this.calculateVoltageDrop({ ...results.designState, activeSize: size.toString() }, 
                this.calculateCableImpedance({ ...results.designState, activeSize: size.toString() }));
            
            // Use adjusted current rating (I_z,adj) from deratedRows
            const currentRating = Math.round(deratedRow.I_z_adj);
            
            row.innerHTML = `
                <td>
                    <input type="radio" name="cable-size" value="${size}" ${size === results.selectedSize ? 'checked' : ''}>
                    ${size}
                </td>
                <td>${earthSize}</td>
                <td>${currentRating}</td>
                <td>${voltageDrop.voltageDropPercent.toFixed(1)}</td>
            `;
            
            tbody.appendChild(row);
        });
    }

    generateConduitSizeOptions(cableSize) {
        const container = document.getElementById('conduit-size-options');
        container.innerHTML = '';
        
        const conduitSizes = [
            { size: 40, description: '40 mm' },
            { size: 50, description: '50 mm' }
        ];
        
        conduitSizes.forEach((conduit, index) => {
            const option = document.createElement('div');
            option.className = 'radio-option';
            if (index === 0) option.classList.add('selected');
            
            option.innerHTML = `
                <input type="radio" name="conduit-size" value="${conduit.size}" ${index === 0 ? 'checked' : ''}>
                <span>${conduit.description}: 1 x ${cableSize}mm²</span>
            `;
            
            container.appendChild(option);
        });
    }

    selectCableSize(row) {
        // Remove previous selection
        document.querySelectorAll('.cable-selection-table tbody tr').forEach(r => r.classList.remove('selected'));
        
        // Add selection to clicked row
        row.classList.add('selected');
        
        // Update radio button
        const radio = row.querySelector('input[type="radio"]');
        radio.checked = true;
    }

    updateConduitSelection(size) {
        document.querySelectorAll('.radio-option').forEach(option => option.classList.remove('selected'));
        document.querySelector(`input[value="${size}"]`).closest('.radio-option').classList.add('selected');
    }

    resetForm() {
        // Reset all form fields to default values
        document.getElementById('insulation').value = 'PVC_V90';
        document.getElementById('installation').value = 'Spaced from surface';
        document.getElementById('phase').value = '3P_AC';
        document.getElementById('voltage').value = '400';
        document.getElementById('rating').value = '63';
        document.getElementById('cable-type').value = 'MULTICORE';
        document.getElementById('conductor').value = 'CU';
        document.getElementById('max-voltage-drop').value = '3';
        document.getElementById('active-size').value = 'AUTO';
        document.getElementById('distance').value = '40';
        document.getElementById('earth-size').value = 'AUTO';
        document.getElementById('flexible-cable').checked = false;
        document.getElementById('use-parallel').checked = false;
        document.getElementById('calculate-conduit').checked = true;
        document.getElementById('conduit-type').value = 'heavy-duty-rigid';
        document.getElementById('check-short-circuit').checked = false;
        document.getElementById('check-loop-impedance').checked = false;
        document.getElementById('show-derating').checked = false;
        document.getElementById('advanced-options').checked = false;
        
        // Hide results
        document.getElementById('results-section').style.display = 'none';
        
        // Update installation icon
        this.updateInstallationIcon('Spaced from surface');
    }

    showLoading() {
        const calculateBtn = document.getElementById('calculate');
        const originalText = calculateBtn.innerHTML;
        calculateBtn.innerHTML = '<div class="loading"></div> Calculating...';
        calculateBtn.disabled = true;
        
        // Re-enable after a short delay
        setTimeout(() => {
            calculateBtn.innerHTML = originalText;
            calculateBtn.disabled = false;
        }, 1000);
    }

    showError(message) {
        alert('Error: ' + message);
    }

    exportToPDF() {
        if (!this.currentCalculation) {
            this.showError('Please perform a calculation first');
            return;
        }

        // Create a new window for PDF content
        const printWindow = window.open('', '_blank');
        
        const pdfContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Cable Size Calculation Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .section { margin-bottom: 25px; }
                    .section h3 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px; }
                    .result-item { display: flex; justify-content: space-between; margin: 5px 0; }
                    .label { font-weight: bold; }
                    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
                    th { background-color: #f2f2f2; }
                    .footer { margin-top: 30px; text-align: center; font-size: 0.8em; color: #666; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Cable Size Calculator AS/NZS 3008</h1>
                    <h2>Calculation Report</h2>
                    <p>Generated on: ${new Date().toLocaleDateString()}</p>
                </div>

                <div class="section">
                    <h3>Input Parameters</h3>
                    <div class="result-item">
                        <span class="label">Standard:</span>
                        <span>Australian conditions</span>
                    </div>
                    <div class="result-item">
                        <span class="label">Insulation:</span>
                        <span>${this.getInsulationName(this.currentCalculation.designState.insulation)}</span>
                    </div>
                    <div class="result-item">
                        <span class="label">Installation:</span>
                        <span>${this.getInstallationName(this.currentCalculation.designState.installation)}</span>
                    </div>
                    <div class="result-item">
                        <span class="label">Phase System:</span>
                        <span>${this.getPhaseName(this.currentCalculation.designState.phase)}</span>
                    </div>
                    <div class="result-item">
                        <span class="label">Voltage:</span>
                        <span>${this.currentCalculation.designState.voltage} V</span>
                    </div>
                    <div class="result-item">
                        <span class="label">Load Current:</span>
                        <span>${this.currentCalculation.designState.rating} A</span>
                    </div>
                    <div class="result-item">
                        <span class="label">Cable Distance:</span>
                        <span>${this.currentCalculation.designState.distance} m</span>
                    </div>
                    <div class="result-item">
                        <span class="label">Max Voltage Drop:</span>
                        <span>${this.currentCalculation.designState.maxVoltageDrop}%</span>
                    </div>
                </div>

                <div class="section">
                    <h3>Selected Cable</h3>
                    <div class="result-item">
                        <span class="label">Active Conductor Size:</span>
                        <span>${this.currentCalculation.selectedSize} mm²</span>
                    </div>
                    <div class="result-item">
                        <span class="label">Earth Conductor Size:</span>
                        <span>${this.currentCalculation.earthConductor.size} mm²</span>
                    </div>
                    <div class="result-item">
                        <span class="label">Conductor Material:</span>
                        <span>${this.currentCalculation.designState.conductor === 'CU' ? 'Copper' : 'Aluminium'}</span>
                    </div>
                </div>

                <div class="section">
                    <h3>Current Rating</h3>
                    <div class="result-item">
                        <span class="label">Rated Current:</span>
                        <span>${(() => {
                            const selectedRow = this.currentCalculation.deratedRating.deratedRows.find(
                                row => row.size === this.currentCalculation.selectedSize
                            );
                            return selectedRow ? Math.round(selectedRow.I_z_adj) : 0;
                        })()} A</span>
                    </div>
                    <div class="result-item">
                        <span class="label">Operating Temperature:</span>
                        <span>${(() => {
                            const ambientTemp = 40;
                            const maxTemp = this.getMaxTemperature(this.currentCalculation.designState.insulation);
                            const C_total = this.currentCalculation.deratedRating.C_total;
                            return Math.round(ambientTemp + (maxTemp - ambientTemp) * (1 - C_total));
                        })()}°C</span>
                    </div>
                    <div class="result-item">
                        <span class="label">Max Operating Temperature:</span>
                        <span>${this.getMaxTemperature(this.currentCalculation.designState.insulation)}°C</span>
                    </div>
                </div>

                <div class="section">
                    <h3>Voltage Drop</h3>
                    <div class="result-item">
                        <span class="label">Voltage Drop:</span>
                        <span>${this.currentCalculation.voltageDrop.voltageDropPercent.toFixed(1)}% (${this.currentCalculation.voltageDrop.voltageDrop.toFixed(1)} V)</span>
                    </div>
                    <div class="result-item">
                        <span class="label">Voltage at Load:</span>
                        <span>${this.currentCalculation.voltageDrop.voltageAtLoad.toFixed(1)} V</span>
                    </div>
                    <div class="result-item">
                        <span class="label">Maximum Distance:</span>
                        <span>${Math.round(this.currentCalculation.voltageDrop.maxDistance)} m for ${this.currentCalculation.designState.maxVoltageDrop}%</span>
                    </div>
                </div>

                <div class="section">
                    <h3>Cable Impedance</h3>
                    <div class="result-item">
                        <span class="label">Resistance per Core:</span>
                        <span>${this.currentCalculation.cableImpedance.resistance} Ω/km</span>
                    </div>
                    <div class="result-item">
                        <span class="label">Reactance per Core:</span>
                        <span>${this.currentCalculation.cableImpedance.reactance} Ω/km</span>
                    </div>
                    <div class="result-item">
                        <span class="label">Impedance per Core:</span>
                        <span>${this.currentCalculation.cableImpedance.impedance.toFixed(4)} Ω/km</span>
                    </div>
                </div>

                <div class="section">
                    <h3>Earth Conductor Impedance</h3>
                    <div class="result-item">
                        <span class="label">Resistance per Core:</span>
                        <span>${this.currentCalculation.earthConductor.resistance.toFixed(2)} Ω/km</span>
                    </div>
                    <div class="result-item">
                        <span class="label">Reactance per Core:</span>
                        <span>${this.currentCalculation.earthConductor.reactance} Ω/km</span>
                    </div>
                    <div class="result-item">
                        <span class="label">Impedance per Core:</span>
                        <span>${this.currentCalculation.earthConductor.impedance.toFixed(4)} Ω/km</span>
                    </div>
                </div>

                <div class="footer">
                    <p>This calculation is based on AS/NZS 3008.1.1:2017 Electrical installations—Selection of cables</p>
                    <p>Generated by Cable Size Calculator AS/NZS 3008</p>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(pdfContent);
        printWindow.document.close();
        
        // Wait for content to load, then print
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }

    getInsulationName(insulation) {
        const names = {
            'PVC_V75': 'PVC V-75 Standard 60°',
            'PVC_V90': 'PVC V-90 Standard 75°',
            'XLPE_90': 'XLPE 90°',
            'XLPE_110': 'XLPE 110°',
            'ELASTOMERIC_90': 'Elastomeric 90°',
            'ELASTOMERIC_110': 'Elastomeric 110°',
            'MIMS_250': 'MIMS 250°'
        };
        return names[insulation] || insulation;
    }

    getInstallationName(installation) {
        // Return the installation name as-is since it's already a descriptive string
        return installation || 'Unknown';
    }

    getPhaseName(phase) {
        const names = {
            '1P_AC': '1 Phase AC',
            '3P_AC': '3 Phase AC',
            'DC': 'DC',
            '2P_120deg': '2 Phase 120°',
            '2P_180deg': '2 Phase 180°'
        };
        return names[phase] || phase;
    }
}

// Initialize the calculator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CableCalculator();
});
