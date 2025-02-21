import QuickChart from 'quickchart-js';
import fs from 'fs';
import path from "path";
import {typedConfig} from "../index";
import translate from "../translator/translator";

export async function generateChart(nameServer: string, stats: { [key: string]: number }): Promise<Buffer> {
    const labels = Object.keys(stats).map(key => key + ':00');
    const data = Object.values(stats);

    const chart = new QuickChart();
    chart.setWidth(800);
    chart.setHeight(400);
    chart.setBackgroundColor('#eaeaea'); // Белый фон

    chart.setConfig({
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: translate('count_players'),
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                lineTension: 0.3,
            }]
        },
        options: {
            title: {
                display: true,
                text: nameServer,
                fontSize: 20,
                fontColor: '#000'
            },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true },
            },
            scales: {
                x: {
                    ticks: {
                        color: '#333',
                        fontFamily: 'Mono',
                        fontColor: '#000'
                    },
                    grid: { color: 'rgba(200, 200, 200, 0.2)' }
                },
                y: {
                    ticks: {
                        color: '#333',
                        stepSize: 1,
                        beginAtZero: true,
                        fontFamily: 'Mono',
                        fontColor: '#000'
                    },
                    min: 0,
                    grid: { color: 'rgba(200, 200, 200, 0.2)' }
                }
            }
        }
    });

    const buffer = await chart.toBinary();

    if (typedConfig.debug) {
        const filePath = path.join(__dirname, 'chart_debug.png');
        fs.writeFileSync(filePath, buffer);
        console.log(`Image saved in: ${filePath}`);
    }

    return buffer;
}
