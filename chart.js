// Interactive Sector Chart
class SectorChart {
    constructor() {
        this.chart = null;
        this.currentView = 'sectors'; // 'sectors', 'subsectors', or 'measures'
        this.currentSector = null;
        this.currentSubsector = null;
        this.data = null;
        // IPE Brand Colors
        this.colors = [
            '#d63f44', // IPE Red (primary)
            '#4790b1', // IPE Aqua
            '#00843b', // IPE Dark Green
            '#9f9f9f', // IPE Gray
            '#1f497d', // IPE Dark Blue
            '#f4ede3', // IPE Beige
            // Additional variations for more sectors
            '#b8353a', // Darker red
            '#3a7a99', // Darker aqua
            '#006b2f', // Darker green
            '#7f7f7f', // Darker gray
            '#183c5a', // Darker blue
            '#e6d5c1', // Darker beige
            // Lighter tints (80% opacity)
            '#e06c76', // Light red
            '#72a6c3', // Light aqua
            '#4da069', // Light green
            '#b8b8b8', // Light gray
            '#4f6b96', // Light blue
            '#f7f2ea'  // Light beige
        ];

        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.createSectorChart();
    }

    async loadData() {
        try {
            const response = await fetch('./sector_data.json');
            this.data = await response.json();
        } catch (error) {
            console.error('Error loading data:', error);
            // Fallback: try to load data from a different path
            alert('Error loading data. Please ensure sector_data.json is in the same directory.');
        }
    }

    setupEventListeners() {
        const backButton = document.getElementById('backButton');
        backButton.addEventListener('click', () => {
            this.goBack();
        });
    }

    goBack() {
        if (this.currentView === 'measures' && this.currentSubsector) {
            // Go back from measures to subsectors (only for industrie)
            this.showSubsectorView(this.currentSector);
        } else if (this.currentView === 'subsectors' || this.currentView === 'measures') {
            // Go back to main sector view
            this.showSectorView();
        } else {
            // Default: go back to sectors
            this.showSectorView();
        }
    }

    createSectorChart() {
        const ctx = document.getElementById('sectorChart').getContext('2d');

        // Prepare sector data
        const sectors = Object.keys(this.data.sector_totals);
        const totals = Object.values(this.data.sector_totals);

        // Sort by total amount (descending by absolute value, then by actual value)
        const sortedData = sectors.map((sector, index) => ({
            sector: sector,
            total: totals[index]
        })).sort((a, b) => {
            // Sort by absolute value descending, then by actual value descending for same absolute values
            const absA = Math.abs(a.total);
            const absB = Math.abs(b.total);
            if (absB !== absA) return absB - absA;
            return b.total - a.total;
        });

        const sortedSectors = sortedData.map(d => this.formatSectorName(d.sector));
        const sortedTotals = sortedData.map(d => d.total);
        const originalSectors = sortedData.map(d => d.sector);
        const fullSectorNames = sortedData.map(d => this.formatSectorName(d.sector)); // Store full names for tooltip

        // Color bars based on positive/negative values
        const barColors = sortedTotals.map(total => total >= 0 ? '#d63f44' : '#4790b1');

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedSectors,
                datasets: [{
                    label: 'Totaal bedrag (miljoen €)',
                    data: sortedTotals,
                    backgroundColor: barColors,
                    borderColor: barColors,
                    borderWidth: 1,
                    originalSectors: originalSectors, // Store original sector names
                    fullNames: fullSectorNames // Store full display names for tooltip
                }]
            },
            options: {
                indexAxis: 'y', // Make bars horizontal
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'nearest',
                    axis: 'y',
                    intersect: false
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Totaal bedrag per sector (miljoen €)',
                        font: {
                            size: 20,
                            weight: 'bold',
                            family: 'DM Sans'
                        },
                        color: '#1f497d'
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: (context) => {
                                // Show full label name from stored full names
                                const datasetIndex = context[0].datasetIndex;
                                const dataIndex = context[0].dataIndex;
                                const dataset = context[0].chart.data.datasets[datasetIndex];
                                return dataset.fullNames ? dataset.fullNames[dataIndex] : context[0].label;
                            },
                            label: (context) => {
                                return `€${context.parsed.x.toFixed(1)} miljoen`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            color: (context) => {
                                // Make the zero line more visible
                                return context.tick.value === 0 ? '#1f497d' : '#f4ede3';
                            },
                            lineWidth: (context) => {
                                return context.tick.value === 0 ? 2 : 1;
                            }
                        },
                        ticks: {
                            color: '#1f497d',
                            font: {
                                family: 'DM Sans',
                                weight: '500'
                            },
                            callback: function(value) {
                                return '€' + value.toFixed(0) + 'M';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Bedrag (miljoen €)',
                            color: '#1f497d',
                            font: {
                                family: 'DM Sans',
                                weight: '600'
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: '#f4ede3'
                        },
                        ticks: {
                            color: '#1f497d',
                            font: {
                                family: 'DM Sans',
                                weight: '500'
                            }
                        }
                    }
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const originalSector = this.chart.data.datasets[0].originalSectors[index];

                        // Check if this is Industrie sector - show subsectors instead of measures
                        if (originalSector === 'C Industrie') {
                            this.showSubsectorView(originalSector);
                        } else {
                            this.showMeasureView(originalSector);
                        }
                    }
                }
            }
        });

        this.currentView = 'sectors';
        document.getElementById('backButton').style.display = 'none';
        document.getElementById('chart-info').textContent = 'Klik op een sector om de onderliggende beleidsmaatregelen te bekijken';
    }

    showMeasureView(sector) {
        const ctx = document.getElementById('sectorChart').getContext('2d');
        const measures = this.data.sector_details[sector] || [];

        if (measures.length === 0) {
            alert('Geen maatregelen gevonden voor deze sector.');
            return;
        }

        // Sort measures by absolute value descending, then by actual value
        const sortedMeasures = [...measures].sort((a, b) => {
            const absA = Math.abs(a.amount);
            const absB = Math.abs(b.amount);
            if (absB !== absA) return absB - absA;
            return b.amount - a.amount;
        });

        const labels = sortedMeasures.map(m => this.formatMeasureName(m.name));
        const amounts = sortedMeasures.map(m => m.amount);
        const fullMeasureNames = sortedMeasures.map(m => m.name); // Store full measure names for tooltip

        // Color bars based on positive/negative values
        const barColors = amounts.map(amount => amount >= 0 ? '#d63f44' : '#4790b1');

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Bedrag (miljoen €)',
                    data: amounts,
                    backgroundColor: barColors,
                    borderColor: barColors,
                    borderWidth: 1,
                    fullNames: fullMeasureNames // Store full measure names for tooltip
                }]
            },
            options: {
                indexAxis: 'y', // Make bars horizontal
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'nearest',
                    axis: 'y',
                    intersect: false
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Beleidsmaatregelen: ${this.formatSectorName(sector)}`,
                        font: {
                            size: 18,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: (context) => {
                                // Show full label name from stored full names
                                const datasetIndex = context[0].datasetIndex;
                                const dataIndex = context[0].dataIndex;
                                const dataset = context[0].chart.data.datasets[datasetIndex];
                                return dataset.fullNames ? dataset.fullNames[dataIndex] : context[0].label;
                            },
                            label: (context) => {
                                return `€${context.parsed.x.toFixed(1)} miljoen`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            color: (context) => {
                                // Make the zero line more visible
                                return context.tick.value === 0 ? '#1f497d' : '#f4ede3';
                            },
                            lineWidth: (context) => {
                                return context.tick.value === 0 ? 2 : 1;
                            }
                        },
                        ticks: {
                            color: '#1f497d',
                            font: {
                                family: 'DM Sans',
                                weight: '500'
                            },
                            callback: function(value) {
                                return '€' + value.toFixed(0) + 'M';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Bedrag (miljoen €)',
                            color: '#1f497d',
                            font: {
                                family: 'DM Sans',
                                weight: '600'
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: '#f4ede3'
                        },
                        ticks: {
                            color: '#1f497d',
                            font: {
                                family: 'DM Sans',
                                weight: '500'
                            }
                        }
                    }
                }
            }
        });

        this.currentView = 'measures';
        this.currentSector = sector;
        document.getElementById('backButton').style.display = 'inline-block';

        const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
        document.getElementById('chart-info').innerHTML =
            `<strong>${this.formatSectorName(sector)}</strong><br>` +
            `Totaal: <span class="euro-format">€${totalAmount.toFixed(1)} miljoen</span> verdeeld over ${measures.length} maatregelen`;
    }

    showSectorView() {
        this.currentSubsector = null;
        this.createSectorChart();
    }

    showSubsectorView(sector) {
        const ctx = document.getElementById('sectorChart').getContext('2d');

        // Get subsector data for industrie
        const subsectorData = this.data.industrie_subsectors;
        if (!subsectorData || !subsectorData.subsector_totals) {
            alert('Geen subsector data gevonden voor industrie.');
            return;
        }

        const subsectors = Object.keys(subsectorData.subsector_totals);
        const totals = Object.values(subsectorData.subsector_totals);

        // Sort by total amount (descending by absolute value)
        const sortedData = subsectors.map((subsector, index) => ({
            subsector: subsector,
            total: totals[index]
        })).sort((a, b) => {
            const absA = Math.abs(a.total);
            const absB = Math.abs(b.total);
            if (absB !== absA) return absB - absA;
            return b.total - a.total;
        });

        const sortedSubsectors = sortedData.map(d => this.formatSubsectorName(d.subsector));
        const sortedTotals = sortedData.map(d => d.total);
        const originalSubsectors = sortedData.map(d => d.subsector);
        const fullSubsectorNames = sortedData.map(d => this.formatSubsectorName(d.subsector));

        // Color bars based on positive/negative values
        const barColors = sortedTotals.map(total => total >= 0 ? '#d63f44' : '#4790b1');

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedSubsectors,
                datasets: [{
                    label: 'Totaal bedrag (miljoen €)',
                    data: sortedTotals,
                    backgroundColor: barColors,
                    borderColor: barColors,
                    borderWidth: 1,
                    originalSubsectors: originalSubsectors,
                    fullNames: fullSubsectorNames
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'nearest',
                    axis: 'y',
                    intersect: false
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Subsectoren: Industrie',
                        font: {
                            size: 18,
                            weight: 'bold',
                            family: 'DM Sans'
                        },
                        color: '#1f497d'
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: (context) => {
                                const datasetIndex = context[0].datasetIndex;
                                const dataIndex = context[0].dataIndex;
                                const dataset = context[0].chart.data.datasets[datasetIndex];
                                return dataset.fullNames ? dataset.fullNames[dataIndex] : context[0].label;
                            },
                            label: (context) => {
                                return `€${context.parsed.x.toFixed(1)} miljoen`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            color: (context) => {
                                return context.tick.value === 0 ? '#1f497d' : '#f4ede3';
                            },
                            lineWidth: (context) => {
                                return context.tick.value === 0 ? 2 : 1;
                            }
                        },
                        ticks: {
                            color: '#1f497d',
                            font: {
                                family: 'DM Sans',
                                weight: '500'
                            },
                            callback: function(value) {
                                return '€' + value.toFixed(0) + 'M';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Bedrag (miljoen €)',
                            color: '#1f497d',
                            font: {
                                family: 'DM Sans',
                                weight: '600'
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: '#f4ede3'
                        },
                        ticks: {
                            color: '#1f497d',
                            font: {
                                family: 'DM Sans',
                                weight: '500'
                            }
                        }
                    }
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const originalSubsector = this.chart.data.datasets[0].originalSubsectors[index];
                        this.showSubsectorMeasures(sector, originalSubsector);
                    }
                }
            }
        });

        this.currentView = 'subsectors';
        this.currentSector = sector;
        this.currentSubsector = null;
        document.getElementById('backButton').style.display = 'inline-block';

        const totalAmount = sortedTotals.reduce((sum, amount) => sum + amount, 0);
        document.getElementById('chart-info').innerHTML =
            `<strong>Industrie - Subsectoren</strong><br>` +
            `Totaal: <span class="euro-format">€${totalAmount.toFixed(1)} miljoen</span> verdeeld over ${subsectors.length} subsectoren<br>` +
            `Klik op een subsector om de onderliggende beleidsmaatregelen te bekijken`;
    }

    showSubsectorMeasures(sector, subsector) {
        const ctx = document.getElementById('sectorChart').getContext('2d');

        const measures = this.data.industrie_subsectors.subsector_details[subsector] || [];

        if (measures.length === 0) {
            alert('Geen maatregelen gevonden voor deze subsector.');
            return;
        }

        // Sort measures by absolute value descending
        const sortedMeasures = [...measures].sort((a, b) => {
            const absA = Math.abs(a.amount);
            const absB = Math.abs(b.amount);
            if (absB !== absA) return absB - absA;
            return b.amount - a.amount;
        });

        const labels = sortedMeasures.map(m => this.formatMeasureName(m.name));
        const amounts = sortedMeasures.map(m => m.amount);
        const fullMeasureNames = sortedMeasures.map(m => m.name);

        // Color bars based on positive/negative values
        const barColors = amounts.map(amount => amount >= 0 ? '#d63f44' : '#4790b1');

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Bedrag (miljoen €)',
                    data: amounts,
                    backgroundColor: barColors,
                    borderColor: barColors,
                    borderWidth: 1,
                    fullNames: fullMeasureNames
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'nearest',
                    axis: 'y',
                    intersect: false
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Beleidsmaatregelen: ${this.formatSubsectorName(subsector)}`,
                        font: {
                            size: 18,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: (context) => {
                                const datasetIndex = context[0].datasetIndex;
                                const dataIndex = context[0].dataIndex;
                                const dataset = context[0].chart.data.datasets[datasetIndex];
                                return dataset.fullNames ? dataset.fullNames[dataIndex] : context[0].label;
                            },
                            label: (context) => {
                                return `€${context.parsed.x.toFixed(1)} miljoen`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            color: (context) => {
                                return context.tick.value === 0 ? '#1f497d' : '#f4ede3';
                            },
                            lineWidth: (context) => {
                                return context.tick.value === 0 ? 2 : 1;
                            }
                        },
                        ticks: {
                            color: '#1f497d',
                            font: {
                                family: 'DM Sans',
                                weight: '500'
                            },
                            callback: function(value) {
                                return '€' + value.toFixed(0) + 'M';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Bedrag (miljoen €)',
                            color: '#1f497d',
                            font: {
                                family: 'DM Sans',
                                weight: '600'
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: '#f4ede3'
                        },
                        ticks: {
                            color: '#1f497d',
                            font: {
                                family: 'DM Sans',
                                weight: '500'
                            }
                        }
                    }
                }
            }
        });

        this.currentView = 'measures';
        this.currentSector = sector;
        this.currentSubsector = subsector;
        document.getElementById('backButton').style.display = 'inline-block';

        const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
        document.getElementById('chart-info').innerHTML =
            `<strong>${this.formatSubsectorName(subsector)}</strong><br>` +
            `Totaal: <span class="euro-format">€${totalAmount.toFixed(1)} miljoen</span> verdeeld over ${measures.length} maatregelen`;
    }

    formatSectorName(sector) {
        // Remove sector letter prefix and clean up
        return sector.replace(/^[A-Z]\s+/, '').trim();
    }

    formatSubsectorName(subsector) {
        // Remove subsector number prefix (e.g., "10 " from "10 Vervaardiging van...")
        return subsector.replace(/^\d+\s+/, '').trim();
    }

    formatMeasureName(measure) {
        // Truncate long measure names for better display
        if (measure.length > 40) {
            return measure.substring(0, 37) + '...';
        }
        return measure;
    }
}

// Initialize the chart when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SectorChart();
});