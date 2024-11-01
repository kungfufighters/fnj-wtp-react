'use client';
import React, {  useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement
} from 'chart.js';
import { Bar, Scatter} from 'react-chartjs-2';
import ScatterPlot from '@/components/ScatterPlot/ScatterPlot';
import { ScrollArea } from '@mantine/core';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement
);

const ResultsPage = ({ /*ideas*/ }) => {
  const [currentIdeaIndex, setCurrentIdeaIndex] = useState(0);
  const ideas = [['Butter Stick', 'Suburbanites', 'Pursue Now', null], ['Reverse Bike', 'Idiots', 'Keep Open', null]]
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

  const outlierSampleText = "Participant #: \n Reason:Lorem\n Participant #: \n Reason:Lorem\n Participant #: \n Reason:Lorem\n Participant #: \n Reason:Lorem\n Participant #: \n Reason:Lorem";

  return (
    <div>
        <h1 style={{ textAlign: 'center' }}>
            Results
        </h1>

        <h2 style={{ textAlign: 'center' }}>
            Opportunity #{currentIdeaIndex + 1} Results: {`${idea[0]} ( ${idea[1]})`}
        </h2>

        {idea[3] && (
        <div style={{ textAlign: 'center' }}>
            <img
                src={idea[3]}
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
          width: '70%', // Reduce the width of the entire graph container
          margin: '0 auto', // Center the container
          padding: '0 20px', // Add some padding to prevent it from touching the edge
        }}
      >
        <div className="left-graphs" style={{ width: '20%' }}>
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

        <div className="middle-text-areas" style={{ width: '20%' }}>
          <h3>Reason to Buy Reasons</h3>
          <div style={{ height: '150px', whiteSpace: 'pre-wrap', margin:0,padding:0  } }> 
            
          <ScrollArea h={150} scrollbars="y"> {outlierSampleText}</ScrollArea>
          </div>

          <h3>Market Volume Reasons</h3>
          <div style={{ height: '150px', whiteSpace: 'pre-wrap', margin:0,padding:0  }}>
          <ScrollArea h={150} scrollbars="y"> {outlierSampleText}</ScrollArea>
          </div>

          <h3>Economic Viability Reasons</h3>
          <div style={{ height: '150px', whiteSpace: 'pre-wrap', margin:0,padding:0  }}>
          <ScrollArea h={150} scrollbars="y"> {outlierSampleText}</ScrollArea>
          </div>
        </div>

        <div className="right-graphs" style={{ width: '20%' }}>
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

          <h3>Where to Play</h3>
          <div style= {{height: '350px'}}>
          <ScatterPlot />
          </div>
        </div>
        <div className="right-text-areas" style={{ width: '20%' }}>
          <h3>Reason to Buy Reasons</h3>
          <div style={{ height: '150px', whiteSpace: 'pre-wrap', margin:0,padding:0  } }> 
            
          <ScrollArea h={150} scrollbars="y"> {outlierSampleText}</ScrollArea>
          </div>

          <h3>Market Volume Reasons</h3>
          <div style={{ height: '150px', whiteSpace: 'pre-wrap', margin:0,padding:0 }}>
          <ScrollArea h={150} scrollbars="y"> {outlierSampleText}</ScrollArea>
          </div>

          <h3>Economic Viability Reasons</h3>
          <div style={{ height: '150px', whiteSpace: 'pre-wrap', margin:0,padding:0  }}>
          <ScrollArea h={150} scrollbars="y"> {outlierSampleText}</ScrollArea>
          </div>
        </div>
      </div>

      <div className="navigation-buttons" style={{ marginTop: '20px', textAlign: 'center'  }}>
        <button onClick={goToPreviousIdea} disabled={currentIdeaIndex === 0} type="button">
          Previous Opportunity
        </button>
        <button
          onClick={goToNextIdea}
          disabled={currentIdeaIndex === ideas.length - 1}
          style={{ marginLeft: '10px' }}
          type="button"
        >
          Next Opportunity
        </button>
      </div>
    </div>
    
  );
};

export default ResultsPage;
