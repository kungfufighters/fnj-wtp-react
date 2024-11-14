'use client';
import React, { useState, useEffect } from 'react';
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
import '../../Idea.css';
import { ScrollArea, Center, Stack} from '@mantine/core';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement
);

type Opp = {
    name: string;
    customer_segment: string;
    description: string;
    cur_votes: number[][];
    reasons: string[];
    imgurl: string;
};

const ResultsPage = ({ params }) => {
  const [currentIdeaIndex, setCurrentIdeaIndex] = useState(0);
  const [ideas, setIdeas] = useState<Opp[]>([]);
  const [idea, setIdea] = useState(null);
  const [session, setSession] = useState(0);
  const [queryFetched, setQueryFetched] = useState(false);

  const getScatterValues = () => {
    const points: { x: number; y: number; label: string }[] = [];
    let index = 0;
    ideas.forEach(ide => {
      const votes = ide[3];
      let count = 0;
      let sum = 0;
      for (let i = 0; i <= 2; i += 1) {
        for (let j = 0; j < 5; j += 1) {
          count += votes[i][j];
          sum += votes[i][j] * (j + 1);
        }
      }
      const yVal = 300 - (sum / count - 1) * 75;
      count = 0;
      sum = 0;

      for (let i = 3; i <= 5; i += 1) {
        for (let j = 0; j < 5; j += 1) {
          count += votes[i][j];
          sum += votes[i][j] * (j + 1);
        }
      }

      const xVal = (sum / count - 1) * 75;

      points.push({ x: xVal, y: yVal, label: ide[0] });
      index += 1;
    });
    return points;
  };

  //GetIdeaStatus function returns a ratio, if this ratio is less than .4 the point is red, if it's between .4 and .6, it's orange, and if it's above .6 it's green
    const getIdeaStatus = (points: { x: number; y: number; label: string }[]): void => {
      points.forEach(point => {
        //the position of the point on the line y=x, the middle of the graph
        const a = (point.x + point.y)/2;
        //The length of one side of the graph, which should always be a square
        const s = 300;
        const ratio = ( (2*(a-s)**2)**(.5) ) / (s*(2**.5));
        console.log(ratio);
      });
    };

  const getSession = async () => {
       const TOKEN = localStorage.getItem('accessToken');
       const sesh = (await params).session;
       const requestString = `http://localhost:8000/api/query/oppresults?code=${sesh}`;
       setSession(sesh);
       await axios
            .get(requestString, {
              headers: {
                AUTHORIZATION: `Bearer ${TOKEN}`,
              },
            })
            .then(res => {
                const newIdeas: React.SetStateAction<any[]> = [];
                const opportunities = res.data;
                opportunities.forEach((
                  opp: {
                    name: any;
                    customer_segment: any;
                    description: any;
                    cur_votes: any;
                    reasons: any;
                    imgurl: string }) => {
                  newIdeas.push([
                    opp.name,
                    opp.customer_segment,
                    opp.description,
                    opp.cur_votes,
                    opp.reasons,
                    opp.imgurl]);
                });
                console.log(newIdeas);
                setIdeas(newIdeas);
                setIdea(newIdeas[currentIdeaIndex]);
                console.log(newIdeas[currentIdeaIndex]);
            })
            .catch(error => {
              console.log(error);
            });
  };

  if (!queryFetched) {
    getSession();
    setQueryFetched(true);
  }

  const goToPreviousIdea = () => {
    if (currentIdeaIndex > 0) {
      setIdea(ideas[currentIdeaIndex - 1]);
      setCurrentIdeaIndex(currentIdeaIndex - 1);
    }
  };

  const goToNextIdea = () => {
    if (currentIdeaIndex < ideas.length - 1) {
      setIdea(ideas[currentIdeaIndex + 1]);
      console.log(ideas[currentIdeaIndex + 1]);
      setCurrentIdeaIndex(currentIdeaIndex + 1);
    }
  };

  const graphData = (label, votes) => ({
    labels: [label],
    datasets: [
      {
        label,
        data: {
          1: votes[0],
          2: votes[1],
          3: votes[2],
          4: votes[3],
          5: votes[4],
        },
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

  //const outlierSampleText = "Participant #: \n Reason:Lorem\n Participant #: \n Reason:Lorem\n Participant #: \n Reason:Lorem\n Participant #: \n Reason:Lorem\n Participant #: \n Reason:Lorem";

  if (!queryFetched || !idea) {
    return (
        <p>Loading...</p>
    );
  }

  //placeholder getIdeaStatus function call, just to make sure it runs and gets the right ratio
  getIdeaStatus(getScatterValues());

  return (
    <div>
        <h2 style={{ textAlign: 'center' }}>
            Opportunity #{currentIdeaIndex + 1} Results: {`${idea[0]} (${idea[1]})`}
        </h2>

        <p style={{ textAlign: 'center', width: '50%', margin: 'auto'}}>
            {idea[2]}
        </p>

        <div style={{ textAlign: 'center' }}>
            <img
                src={idea[5]}
                alt=""  // Empty alt attribute for decorative images
                style={{ width: '300px', marginBottom: '20px' }}
            />
        </div>

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
            <Bar key={`chart-reason-${currentIdeaIndex}`} data={graphData('Reason to Buy', idea[3][0])} options={chartOptions} />
          </div>

          <h3>Market Volume</h3>
          <div style={{ height: '150px' }}>
            <Bar key={`chart-volume-${currentIdeaIndex}`} data={graphData('Market Volume', idea[3][1])} options={chartOptions} />
          </div>

          <h3>Economic Viability</h3>
          <div style={{ height: '150px' }}>
            <Bar key={`chart-viability-${currentIdeaIndex}`} data={graphData('Economic Viability', idea[3][2])} options={chartOptions} />
          </div>
        </div>

        <div className="middle-text-areas" style={{ width: '20%' }}>
          <h3>Justifications</h3>
          <div style={{ height: '150px', whiteSpace: 'pre-wrap', margin:0,padding:0  } }> 
            
          <ScrollArea h={150} scrollbars="y"> {idea[4][0]}</ScrollArea>
          </div>

          <h3>Justifications</h3>
          <div style={{ height: '150px', whiteSpace: 'pre-wrap', margin:0,padding:0  }}>
          <ScrollArea h={150} scrollbars="y"> {idea[4][1]}</ScrollArea>
          </div>

          <h3>Justifications</h3>
          <div style={{ height: '150px', whiteSpace: 'pre-wrap', margin:0,padding:0  }}>
          <ScrollArea h={150} scrollbars="y"> {idea[4][2]}</ScrollArea>
          </div>
        </div>

        <div className="right-graphs" style={{ width: '20%' }}>
          <h3>Obstacles</h3>
          <div style={{ height: '150px' }}>
            <Bar key={`chart-obstacles-${currentIdeaIndex}`} data={graphData('Obstacles', idea[3][3])} options={chartOptions} />
          </div>

          <h3>External Risks</h3>
          <div style={{ height: '150px' }}>
            <Bar key={`chart-risks-${currentIdeaIndex}`} data={graphData('External Risks', idea[3][4])} options={chartOptions} />
          </div>

          <h3>Time to Revenue</h3>
          <div style={{ height: '150px' }}>
            <Bar key={`chart-revenue-${currentIdeaIndex}`} data={graphData('Time to Revenue', idea[3][5])} options={chartOptions} />
          </div>
          
        </div>
        <div className="right-text-areas" style={{ width: '20%' }}>
          <h3>Justifications</h3>
          <div style={{ height: '150px', whiteSpace: 'pre-wrap', margin:0,padding:0  } }> 
            
          <ScrollArea h={150} scrollbars="y"> {idea[4][3]}</ScrollArea>
          </div>

          <h3>Justifications</h3>
          <div style={{ height: '150px', whiteSpace: 'pre-wrap', margin:0,padding:0 }}>
          <ScrollArea h={150} scrollbars="y"> {idea[4][4]}</ScrollArea>
          </div>

          <h3>Justifications</h3>
          <div style={{ height: '150px', whiteSpace: 'pre-wrap', margin:0,padding:0  }}>
          <ScrollArea h={150} scrollbars="y"> {idea[4][5]}</ScrollArea>
          </div>
        </div>
      </div>

      <Stack>
        <h3 style={{textAlign: 'center'}}>Where to Play</h3>
        <div style={{height: '350px'}}>
        <Center>
          <ScatterPlot points={getScatterValues()} />
        </Center>
        </div>
      </Stack>

      <div className="navigation-buttons" style={{ marginTop: '20px', textAlign: 'center'  }}>
        {currentIdeaIndex > 0 &&
        <button className="Idea-button" onClick={goToPreviousIdea} disabled={currentIdeaIndex === 0} type="button">
          Previous Opportunity
        </button>}
        {currentIdeaIndex < ideas.length - 1 &&
        <button
          className="Idea-button"
          onClick={goToNextIdea}
          disabled={currentIdeaIndex === ideas.length - 1}
          style={{ marginLeft: '10px' }}
          type="button"
        >
          Next Opportunity
        </button>}
      </div>
      <br />
      <br />
    </div>
  );
};

export default ResultsPage;
