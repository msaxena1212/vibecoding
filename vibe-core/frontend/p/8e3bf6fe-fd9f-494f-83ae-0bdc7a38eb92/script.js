// script.js

// Mock data for the chart
const mockData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [{
        label: 'Chaotic Data Stream',
        data: [65, 59, 80, 81, 56, 55, 40],
        backgroundColor: '#FF0000', // Glitchy Red
        borderColor: '#00FF00', // Electric Green
        borderWidth: 2,
        tension: 0.4
    }, {
        label: 'Unstable Metrics',
        data: [28, 48, 40, 19, 86, 27, 90],
        backgroundColor: '#0000FF', // Cyberpunk Blue
        borderColor: '#FF0000', // Glitchy Red
        borderWidth: 2,
        tension: 0.4
    }]
};


// Chart configuration
const chartConfig = {
    type: 'line',
    data: mockData,
    options: {
        animation: {
            duration: 1000, // Glitchy animation speed
            easing: 'linear' // Abrupt animation
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#FFFFFF' // White text for visibility on dark backgrounds
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)' // Subtle grid lines
                }
            },
            x: {
                ticks: {
                    color: '#FFFFFF'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: '#FFFFFF'
                }
            }
        }
    }
};

// Function to render the chart
function renderChart() {
    const chartCanvas = document.getElementById('myChart');
    if (chartCanvas) {
        const myChart = new Chart(chartCanvas, chartConfig);

        // Simulate data updates every 3 seconds
        setInterval(() => {
            // Generate new random data
            mockData.datasets.forEach((dataset) => {
                dataset.data = dataset.data.map(() => Math.floor(Math.random() * 100));
            });

            // Update the chart with new data
            myChart.update();
        }, 3000);
    } else {
        console.error('Chart canvas element not found.');
    }
}


// Ensure the DOM is fully loaded before rendering the chart
document.addEventListener('DOMContentLoaded', () => {
    // Dynamically load Chart.js from CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = renderChart; // Call renderChart after Chart.js is loaded
    document.head.appendChild(script);
});