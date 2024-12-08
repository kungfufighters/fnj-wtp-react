'use client';

import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Center, Flex, Button, Modal, Table } from '@mantine/core';
import axios from 'axios';
import ScatterPlot from '@/components/ScatterPlot/ScatterPlot';
import TriangleChart from '@/components/TriangleChart/TriangleChart';

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

const ResultsPage = ({ params } : any) => {
  const [currentIdeaIndex, setCurrentIdeaIndex] = useState(0);
  const [ideas, setIdeas] = useState<Opp[]>([]);
  const [idea, setIdea] = useState(null);
  const [session, setSession] = useState(0);
  const [queryFetched, setQueryFetched] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);

  const getScatterValues = () => {
    const points: { x: number; y: number; label: string }[] = [];
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
    });
    console.table(points);
    return points;
  };

  //transformPoints converts points on the graph into points from the triangle.
  //the y is equal to each point's position on the diagonal, the x is a random value within the width of the triangle graph
  const getTriValues = (points: { x: number; y: number; label: string }[]):
  { x: number; y: number; label: string }[] =>
    points.map(point => {
      const a = (point.x + point.y) / 2; // Position on the y=x line
      const s = 300; // Length of one side of the square
      const ratio = (Math.sqrt(2 * (a - s) ** 2)) / (s * Math.sqrt(2)); // Calculate the ratio
      const minX = (ratio) / 2;
      const maxX = (ratio - 2) / (-2);

      const newX = (point.x / 300) * (maxX - minX) + minX;//Transposing the old x value onto the triangle gives a meaningless(?) result but is consistent
      return { x: newX, y: ratio, label: point.label };
    });

  const getSession = async () => {
       if (typeof window === 'undefined') return;
       const TOKEN = localStorage.getItem('accessToken');
       const sesh = (await params).session;
       const requestString = `${process.env.NEXT_PUBLIC_API_BASE_URL}/query/oppresults?code=${sesh}`;
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

  const graphData = (label : any, votes : any) => ({
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

  const optionProps = {
    options: chartOptions,
  };

  if (!queryFetched || !idea) {
    return (
        <p>Loading...</p>
    );
  }

  const handleOpenModal = (inputStr: String) => {
    console.log(inputStr);
    const parsedData = parseReasons(inputStr); // Parse the input string
    setTableData(parsedData); // Store the parsed data
    setModalOpen(true); // Open the modal
  };

  const parseReasons = (inputStr) => {
    inputStr = String(inputStr);
    if (inputStr === "No outliers") {
      return [];
    }
    const rows = inputStr.split(";").map(row => row.trim()).filter(row => row !== "");
  
    return rows.map(row => {
      const emailStart = 0;
      const emailEnd = row.indexOf(" voted ");
      const voteStart = emailEnd + " voted ".length;
      const voteEnd = row.indexOf(": ");
      const reasonStart = voteEnd + ": ".length;
  
      return {
        name: row.substring(emailStart, emailEnd).trim(),
        vote: row.substring(voteStart, voteEnd).trim(),
        reason: row.substring(reasonStart).trim(),
      };
    });
  };
  
  return (
    <div>
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Justifications"
      >
                <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Vote</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody >
            {tableData.map((row, index) => (
              <tr key={index}>
                <td>{row.name}</td>
                <td style = {{textAlign:'center'}}>{row.vote}</td>
                <td>{row.reason}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal>
        <h2 style={{ textAlign: 'center' }}>
            Opportunity #{currentIdeaIndex + 1} Results: {`${idea[0]} (${idea[1]})`}
        </h2>

        <p style={{ textAlign: 'center', width: '50%', margin: 'auto' }}>
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
            <Bar key={`chart-reason-${currentIdeaIndex}`} data={graphData('Reason to Buy', idea[3][0])} {...optionProps} />
          </div>

          <h3>Market Volume</h3>
          <div style={{ height: '150px' }}>
            <Bar key={`chart-volume-${currentIdeaIndex}`} data={graphData('Market Volume', idea[3][1])} {...optionProps} />
          </div>

          <h3>Economic Viability</h3>
          <div style={{ height: '150px' }}>
            <Bar key={`chart-viability-${currentIdeaIndex}`} data={graphData('Economic Viability', idea[3][2])} {...optionProps} />
          </div>
        </div>

        <div className="middle-text-areas" style={{ width: '20%' }}>
          <div style={{ height: '125px', whiteSpace: 'pre-wrap', margin:0,padding:0  } } /> 
          {idea[4][0] === 'No outliers' ? (
            <Button style={{ backgroundColor: 'red', opacity: 0.5 }}>No Outliers</Button>
          ) : (
            <Button style={{ backgroundColor: 'red' }} onClick={() => handleOpenModal(idea[4][0])}>See Outliers</Button>
          )}
          <div style={{ height: '175px', whiteSpace: 'pre-wrap', margin:0,padding:0  } } /> 
          {idea[4][1] === 'No outliers' ? (
            <Button style={{ backgroundColor: 'red', opacity: 0.5 }}>No Outliers</Button>
          ) : (
            <Button style={{ backgroundColor: 'red' }} onClick={() => handleOpenModal(idea[4][1])}>See Outliers</Button>
          )}
          <div style={{ height: '175px', whiteSpace: 'pre-wrap', margin:0,padding:0  } } /> 
          {idea[4][2] === 'No outliers' ? (
            <Button style={{ backgroundColor: 'red', opacity: 0.5 }}>No Outliers</Button>
          ) : (
            <Button style={{ backgroundColor: 'red' }} onClick={() => handleOpenModal(idea[4][2])}>See Outliers</Button>
          )}
        </div>

        <div className="right-graphs" style={{ width: '20%' }}>
          <h3>Obstacles</h3>
          <div style={{ height: '150px' }}>
            <Bar key={`chart-obstacles-${currentIdeaIndex}`} data={graphData('Obstacles', idea[3][3])} {...optionProps} />
          </div>

          <h3>Time to Revenue</h3>
          <div style={{ height: '150px' }}>
            <Bar key={`chart-risks-${currentIdeaIndex}`} data={graphData('External Risks', idea[3][4])} {...optionProps} />
          </div>

          <h3>External Risks</h3>
          <div style={{ height: '150px' }}>
            <Bar key={`chart-revenue-${currentIdeaIndex}`} data={graphData('Time to Revenue', idea[3][5])} {...optionProps} />
          </div>
        </div>

        <div className="right-text-areas" style={{ width: '20%' }}>
          <div className="middle-text-areas" style={{ width: '20%' }} />
          <div style={{ height: '125px', whiteSpace: 'pre-wrap', margin:0,padding:0  } } /> 
          {idea[4][3] === 'No outliers' ? (
            <Button style={{ backgroundColor: 'red', opacity: 0.5 }}>No Outliers</Button>
          ) : (
            <Button style={{ backgroundColor: 'red' }} onClick={() => handleOpenModal(idea[4][3])}>See Outliers</Button>
          )}
          <div style={{ height: '175px', whiteSpace: 'pre-wrap', margin:0,padding:0  } } /> 
          {idea[4][4] === 'No outliers' ? (
            <Button style={{ backgroundColor: 'red', opacity: 0.5 }}>No Outliers</Button>
          ) : (
            <Button style={{ backgroundColor: 'red' }} onClick={() => handleOpenModal(idea[4][4])}>See Outliers</Button>
          )}
          <div style={{ height: '175px', whiteSpace: 'pre-wrap', margin:0,padding:0  } } /> 
          {idea[4][5] === 'No outliers' ? (
            <Button style={{ backgroundColor: 'red', opacity: 0.5 }}>No Outliers</Button>
          ) : (
            <Button style={{ backgroundColor: 'red' }} onClick={() => handleOpenModal(idea[4][5])}>See Outliers</Button>
          )}
        </div>
      </div>
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '70%',
        margin: '0 auto',
        padding: '0 20px',
      }}>
      <div style={{ width: '50%' }}>
        <Center><h3>Where To Play Triangle</h3></Center>
          <Center>
            <div style={{ height: '300px' }}>
              <TriangleChart points={getTriValues(getScatterValues())} />
            </div>
          </Center>
      </div>

        <div style={{ width: '50%' }}>
        <h3 style={{ textAlign: 'center' }}>Where to Play</h3>
          <Center>
          <Flex align="center">
            <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
            <p>Potential</p>
            </div>
            <ScatterPlot points={getScatterValues()} />
          </Flex>
          </Center>
          <Center><p>Challenges</p></Center>
        </div>
    </div>

      <div className="navigation-buttons" style={{ marginTop: '20px', textAlign: 'center' }}>
        {currentIdeaIndex > 0 &&
        <Button className="Idea-button" onClick={goToPreviousIdea} disabled={currentIdeaIndex === 0} type="button">
          Previous Opportunity
        </Button>}
        {currentIdeaIndex < ideas.length - 1 &&
        <Button
          className="Idea-button"
          onClick={goToNextIdea}
          disabled={currentIdeaIndex === ideas.length - 1}
          style={{ marginLeft: '10px' }}
          type="button"
        >
          Next Opportunity
        </Button>}
      </div>
      <br />
      <br />
    </div>
  );
};

export default ResultsPage;
