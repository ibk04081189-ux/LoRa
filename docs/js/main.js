document.addEventListener('DOMContentLoaded', () => {
    fetchData();
});

async function fetchData() {
    try {
        const response = await fetch('data/results.csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
            header: true,
            dynamicTyping: true,
            complete: (results) => {
                renderDashboard(results.data.filter(row => row.N !== null));
            },
            error: (err) => {
                console.error("Error parsing CSV:", err);
            }
        });
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function renderDashboard(data) {
    const labels = data.map(row => row.N);
    
    // Create Chart
    const ctx = document.getElementById('pdrChart').getContext('2d');
    
    // Define datasets based on CSV structure
    const datasets = [
        {
            label: 'Pure ALOHA (Sim)',
            data: data.map(row => row['Pure ALOHA (LBTなし) (Sim)']),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 8
        },
        {
            label: 'Pure ALOHA (Theory)',
            data: data.map(row => row['Pure ALOHA Theory']),
            borderColor: '#6366f1',
            borderDash: [5, 5],
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0
        },
        {
            label: 'Slotted ALOHA (Sim)',
            data: data.map(row => row['Slotted ALOHA (Sim)']),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 8
        },
        {
            label: 'Slotted ALOHA (Theory)',
            data: data.map(row => row['Slotted ALOHA Theory']),
            borderColor: '#10b981',
            borderDash: [5, 5],
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0
        },
        {
            label: 'LBT / CSMA (Sim)',
            data: data.map(row => row['Pure ALOHA (LBTあり) (Sim)']),
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderWidth: 4,
            tension: 0.4,
            pointRadius: 6,
            pointHoverRadius: 9
        }
    ];

    new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#94a3b8',
                        font: { family: 'Inter', size: 12 },
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#f8fafc',
                    bodyColor: '#94a3b8',
                    cornerRadius: 8,
                    padding: 12
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Number of Devices (N)', color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    title: { display: true, text: 'Packet Delivery Ratio (PDR)', color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    ticks: { color: '#94a3b8' },
                    min: 0,
                    max: 1
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            }
        }
    });

    // Populate Params Summary
    const paramsDiv = document.getElementById('paramsSummary');
    const params = [
        { label: 'Bandwidth', value: '125 kHz' },
        { label: 'Packet Length', value: '70 ms' },
        { label: 'Carrier Sense', value: '5 ms' },
        { label: 'SINR Threshold', value: '6 dB' },
        { label: 'Environment', value: '920 MHz (Japan)' }
    ];
    
    paramsDiv.innerHTML = params.map(p => `
        <div class="param-item" style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
            <span style="color: #94a3b8;">${p.label}</span>
            <span style="font-weight: 600;">${p.value}</span>
        </div>
    `).join('');

    // Populate Table
    const table = document.getElementById('resultsTable');
    let tableHtml = `
        <thead>
            <tr style="text-align: left; color: #94a3b8; border-bottom: 1px solid var(--border-color);">
                <th style="padding: 1rem;">N</th>
                <th style="padding: 1rem;">ALOHA</th>
                <th style="padding: 1rem;">Slotted</th>
                <th style="padding: 1rem;">LBT</th>
            </tr>
        </thead>
        <tbody>
    `;

    data.forEach(row => {
        tableHtml += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.02);">
                <td style="padding: 1rem; font-weight: 600;">${row.N}</td>
                <td style="padding: 1rem;">${(row['Pure ALOHA (LBTなし) (Sim)'] * 100).toFixed(1)}%</td>
                <td style="padding: 1rem;">${(row['Slotted ALOHA (Sim)'] * 100).toFixed(1)}%</td>
                <td style="padding: 1rem; color: #f59e0b; font-weight: 600;">${(row['Pure ALOHA (LBTあり) (Sim)'] * 100).toFixed(1)}%</td>
            </tr>
        `;
    });

    tableHtml += '</tbody>';
    table.innerHTML = tableHtml;
}
