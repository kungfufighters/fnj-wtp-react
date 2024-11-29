import React from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, LinearScale, PointElement, Tooltip, Legend, ChartOptions } from 'chart.js';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);
const options: ChartOptions<'scatter'> = {
  plugins: {
    tooltip: {
      callbacks: {
        label: (context) => context.raw.label,
      },
    },
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      min: 0,
      max: 1,
      beginAtZero: true,
      display: false,
    },
    y: {
      min: 0,
      max: 1,
      beginAtZero: true,
      display: false,
      reverse: false,
    },
  },
  maintainAspectRatio: false, // Allow chart to fill its container
};

const TriangleChart = ({points} : any) => {
  const data = {
    datasets: [
      {
        data: points,
        backgroundColor: 'blue',
      },
    ],
  };
  return (
    <div style={{ position: 'relative', width: '300px', height: '300px' }}>
      <svg
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      >
        <polygon
          points="0,1 1,1 0.8333,0.6667 0.1667,0.6667"
          fill="#c0504d"
          stroke="black"
          strokeWidth="0.01"
        />

        <text x="0.5" y="0.8333" textAnchor="middle" fontSize="0.07" fill="white">
          Shelve
        </text>

        <polygon
          points="0.1667,0.6667 0.8333,0.6667 0.6667,0.3333 0.3333,0.3333"
          fill="#e08d49"
          stroke="black"
          strokeWidth="0.01"
        />

        <text x="0.5" y="0.53" textAnchor="middle" fontSize="0.07" fill="white">
          Keep Open
        </text>
        
        <polygon
          points="0.3333,0.3333 0.6667,0.3333 0.5,0"
          fill="#9bbb59"
          stroke="black"
          strokeWidth="0.01"
        />

        <text x="0.5" y="0.2" textAnchor="middle" fontSize="0.05" fill="white">
          Pursue
        </text>
        <text x="0.5" y="0.25" textAnchor="middle" fontSize="0.05" fill="white">
          Now
        </text>

      </svg>

      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Scatter data={data} options={options} />
      </div>
    </div>
  );
};

export default TriangleChart;
