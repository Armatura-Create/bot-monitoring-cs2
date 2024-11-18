import {ChartJSNodeCanvas} from "chartjs-node-canvas";
import {ChartConfiguration} from "chart.js";
import translate from "../translator/translator";

const width = 800;
const height = 400;
const chartJSNodeCanvas = new ChartJSNodeCanvas({width, height});

export async function generateChart(stats: { [key: string]: number }): Promise<Buffer> {

    const labels = Object.keys(stats).map(key => key + ':00');
    const data = Object.values(stats);

    const config: ChartConfiguration<'line'> = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: translate('count_players'),
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                },
            ],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                    },
                },
            },
        },
    };

    return await chartJSNodeCanvas.renderToBuffer(config);
}
