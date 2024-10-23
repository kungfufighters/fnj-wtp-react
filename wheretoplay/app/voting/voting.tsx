'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from '@mantine/form';
import './Idea.css';
import NextImage from 'next/image';
import { RadioGroup, Radio, Flex, Button, Stack, Center, Image } from '@mantine/core';
import { Graph } from '../../components/Graph/Graph';
import oneF from '../../public/OneFinger.png';
import fiveF from '../../public/FiveFingers.png';

// TypeScript Interfaces
interface VotingProps {
  caption: string;
  index: number;
  infoM: string;
}

interface InfoProps {
  message: string;
}

interface WebSocketMessage {
  message: string;
}

export default function Voting({ ideas }: any) {
  const NUMCATS = 6;
  const form = useForm({ mode: 'uncontrolled' });
  const [currentIdeaIndex, setCurrentIdeaIndex] = useState(0);
  const [isVoted, setIsVoted] = useState(Array.from({ length: NUMCATS }, () => false));
  const [votes, setVotes] = useState(Array.from({ length: NUMCATS }, () => 0));
  const [timers, setTimers] = useState(Array.from({ length: NUMCATS }, () => setTimeout(() => {}, 1)));

  const idea = ideas[currentIdeaIndex];
  const socketRef = useRef<WebSocket | null>(null); // Store WebSocket in ref to persist between renders

  // Establish WebSocket connection
  const connectWebSocket = () => {
    socketRef.current = new WebSocket('ws://localhost:8000/ws/vote/');

    socketRef.current.onopen = () => {
      console.log('WebSocket connection opened');
    };

    socketRef.current.onmessage = (event: MessageEvent) => {
      const data: WebSocketMessage = JSON.parse(event.data);
      console.log('Message received from server:', data.message); // Expecting "received!"
    };

    socketRef.current.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
    };

    socketRef.current.onclose = (event: CloseEvent) => {
      console.log('WebSocket connection closed:', event);
    };
  };

  // Initialize WebSocket connection when component is mounted
  useEffect(() => {
    connectWebSocket();
    return () => {
      socketRef.current?.close(); // Clean up WebSocket on component unmount
    };
  }, []);

  // Handle form submission and send data via WebSocket
  const handleSubmit = (values: typeof form.values) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const payload = {
        ideaIndex: currentIdeaIndex, // Should be an integer
        votes: votes,                // Array of votes
        formValues: values           // Additional form data
      };
  
      console.log("Sending payload to backend:", payload); // Log payload
  
      socketRef.current.send(JSON.stringify(payload)); // Send data via WebSocket
    } else {
      console.error("WebSocket is not open. Current readyState:", socketRef.current?.readyState);
    }
  
    goToNextIdea();  // Progress to the next idea
  };
  

  const goToNextIdea = () => {
    if (currentIdeaIndex < ideas.length - 1) {
      setCurrentIdeaIndex(currentIdeaIndex + 1);
    }
  };

  const InfoButton: React.FC<InfoProps> = ({ message }) => {
    const handleClick = () => {
      alert(message);
    };

    return (
      <Button variant="outlined" className="Idea-button" onClick={handleClick}>
        Info
      </Button>
    );
  };

  const Selection: React.FC<VotingProps> = ({ caption, index, infoM }) => (
    <Center>
      <InfoButton message={infoM} />
      <RadioGroup
        value={votes[index].toString()}
        label={caption}
        bg="rgba(0, 0, 0, .3)"
        required
      >
        <Flex gap="md">
          <Image alt="One finger" component={NextImage} src={oneF} h={35} />
          <Radio value="1" onClick={() => updateVotes(index, 1)} color="grape" />
          <Radio value="2" onClick={() => updateVotes(index, 2)} color="grape" />
          <Radio value="3" onClick={() => updateVotes(index, 3)} color="grape" />
          <Radio value="4" onClick={() => updateVotes(index, 4)} color="grape" />
          <Radio value="5" onClick={() => updateVotes(index, 5)} color="grape" />
          <Image alt="Five fingers" component={NextImage} src={fiveF} h={35} />
        </Flex>
      </RadioGroup>
    </Center>
  );

  const updateVotes = (index: number, val: number) => {
    const newVotes = [...votes];
    newVotes[index] = val;
    setVotes(newVotes);
  };

  return (
    <>
      <h2 style={{ textAlign: 'center' }}>
        Idea #{currentIdeaIndex + 1}: {`${idea[0]} (${idea[1]})`}
      </h2>

      {idea[3] && (
        <div style={{ textAlign: 'center' }}>
          <Center>
            <Image
              src={idea[3]}
              alt="" // Empty alt attribute for decorative images
              style={{ width: '300px', marginBottom: '20px' }}
            />
          </Center>
        </div>
      )}
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Center>
          <Stack bg="var(--mantine-color-body)" align="stretch" justify="center" gap="sm">
            <Selection caption="Reason to Buy" index={0} infoM="Based on: Unmet need, Effective solution, and Better than current solutions. [HIGH is GOOD]" />
            <Selection caption="Market Volume" index={1} infoM="Based on: Current market size and Expected growth. [HIGH is GOOD]" />
            <Selection caption="Economic Viability" index={2} infoM="Based on: Margins (value vs. cost), Customers' ability to pay, and Customer stickiness? [HIGH is GOOD]" />
            <Selection caption="Obstacles to Implementation" index={3} infoM="Based on: Product development difficulties and Funding challenges [WANT LOW]" />
            <Selection caption="Time To Revenue" index={4} infoM="Based on: Development time, Time between product and market readiness, and Length of sale cycle [WANT LOW]" />
            <Selection caption="Economic Risks" index={5} infoM="Based on: Competitive threats, 3rd party dependencies, and Barriers to adoption. [WANT LOW]" />
          </Stack>
        </Center>
        <Center>
          <Button className="Idea-button" type="submit">
            Submit
          </Button>
        </Center>
      </form>
    </>
  );
}
