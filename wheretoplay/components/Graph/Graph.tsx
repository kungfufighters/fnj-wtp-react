'use client';

import { Center } from '@mantine/core';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
  import { Bar } from 'react-chartjs-2';

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

export function Graph({ key, votes, graphTitle }) {
    const graphData = (label : string, data: number[][]) => ({
        labels: [label],
        datasets: [
          {
            label,
            data: data.map(row => ({
                x: row[0],
                y: row[1],
            })),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      });

      const chartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          x: {
            type: 'linear',
            min: 1,
            max: 5,
            ticks: {
                stepSize: 1,
                precision: 0,
            font: { size: 10 },
            },
            },
          y: {
            min: 0,
            max: 10,
            ticks: {
            stepSize: 2,
            font: { size: 10 },
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true },
        },
      };

  return (
    <>
        <Center>
            <h3>{graphTitle}</h3>
        </Center>
        <div style={{ height: '150px' }}>
            <Bar key={key} data={graphData('External Risks', votes)} options={chartOptions} />
        </div>
    </>
  );
}
