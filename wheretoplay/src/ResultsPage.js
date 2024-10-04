import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,   
  LinearScale,    
  BarElement,     
  Title,          
  Tooltip,        
  Legend           
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

const ResultsPage = ({ ideas }) => {
  const [currentIdeaIndex, setCurrentIdeaIndex] = useState(0);

  const idea = ideas[currentIdeaIndex];

  const goToPreviousIdea = () => {
    if (currentIdeaIndex > 0) {
      setCurrentIdeaIndex(currentIdeaIndex - 1);
    }
  };

  const goToNextIdea = () => {
    if (currentIdeaIndex < ideas.length - 1) {
      setCurrentIdeaIndex(currentIdeaIndex + 1);
    }
  };

  const graphData = (label, data) => ({
    labels: [label],
    datasets: [
      {
        label: label,
        data: [data],
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
        font: {size: 10},
        },
        },  
      y: {
        min: 0,
        max: 10,
        ticks: {
        stepSize: 2,
        font: {size: 10},
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
  };

  return (
    <div>
        <h1 style ={{ textAlign: 'center' }}> 
            Owner's View
        </h1>

        <h2 style ={{ textAlign: 'center' }}>
            Idea #{currentIdeaIndex + 1} Results: {idea.ideaName}
        </h2>

        {idea.image && (
        <div style={{ textAlign: 'center' }}>
            <img
                src={URL.createObjectURL(idea.image)}
                alt=""  // Empty alt attribute for decorative images
                style={{ width: '300px', marginBottom: '20px' }}
            />
        </div>
        )}

      {/* Center the entire graph container */}
      <div
        className="results-container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '60%',  // Reduce the width of the entire graph container
          margin: '0 auto',  // Center the container
          padding: '0 20px',  // Add some padding to prevent it from touching the edge
        }}
      >
        <div className="left-graphs" style={{ width: '30%' }}>
          <h3>Reason to Buy</h3>
          <div style={{ height: '150px' }}>
            <Bar key={`chart-reason-${currentIdeaIndex}`} data={graphData('Reason to Buy', idea.reasonToBuy)} options={chartOptions} />
          </div>

          <h3>Market Volume</h3>
          <div style={{ height: '150px' }}>
            <Bar key={`chart-volume-${currentIdeaIndex}`} data={graphData('Market Volume', idea.marketVolume)} options={chartOptions} />
          </div>

          <h3>Economic Viability</h3>
          <div style={{ height: '150px' }}>
            <Bar key={`chart-viability-${currentIdeaIndex}`} data={graphData('Economic Viability', idea.economicViability)} options={chartOptions} />
          </div>
        </div>

        <div className="right-graphs" style={{ width: '30%' }}>
          <h3>Obstacles to Implementation</h3>
          <div style={{ height: '150px' }}>
            <Bar key={`chart-obstacles-${currentIdeaIndex}`} data={graphData('Obstacles', idea.obstaclesToImplementation)} options={chartOptions} />
          </div>

          <h3>External Risks</h3>
          <div style={{ height: '150px' }}>
            <Bar key={`chart-risks-${currentIdeaIndex}`} data={graphData('External Risks', idea.externalRisks)} options={chartOptions} />
          </div>

          <h3>Time to Revenue</h3>
          <div style={{ height: '150px' }}>
            <Bar key={`chart-revenue-${currentIdeaIndex}`} data={graphData('Time to Revenue', idea.timeToRevenue)} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="navigation-buttons" style={{ marginTop: '20px', textAlign: 'center' }}>
        <button onClick={goToPreviousIdea} disabled={currentIdeaIndex === 0}>
          Previous Idea
        </button>
        <button
          onClick={goToNextIdea}
          disabled={currentIdeaIndex === ideas.length - 1}
          style={{ marginLeft: '10px' }}
        >
          Next Idea
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;
