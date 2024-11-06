"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from '@mantine/form';
import './Idea.css';
import './Voting.css';
import NextImage from 'next/image';
import { RadioGroup, Radio, Flex, Button, Stack, Center, Image, Modal, Textarea } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import axios from 'axios';
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

// result is 1 2D array with the new votes
// outlier is a number corresponding to the vote category for which they have become an outlier
interface WebSocketMessage {
  result: number[][];
  outlier: number;
  criteria_id: number;
  user_id: number;
}

export default function Voting({ ideas }: any) {
  const NUMCATS = 6;
  const TIMERLENGTH = 2;
  const VOTEOPTIONS = 5;
  const form = useForm({ mode: 'uncontrolled' });
  const [userID, setUserID] = useState(-1);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track if the user is logged in
  const [currentIdeaIndex, setCurrentIdeaIndex] = useState(0);
  const [currentOptionIndex, setCurrentOptionIndex] = useState(-1);
  const [isVoted, setIsVoted] = useState(Array.from({ length: NUMCATS }, () => false));
  const [votes, setVotes] = useState(Array.from({ length: NUMCATS }, () => 0));
  const [reasons, setReasons] = useState(Array.from({ length: NUMCATS }, () => ''));
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [modalOpened, modalHandlers] = useDisclosure(false);
  const [currentReasonIndex, setCurrentReasonIndex] = useState(-1);
  const [reasonInput, setReasonInput] = useState('');
  const [curVotes, setCurVotes] = useState(
    Array.from({ length: NUMCATS }, () => Array(VOTEOPTIONS).fill(0))
  );
  const router = useRouter();

  // Check for mobile device
  const isMobile = useMediaQuery('(max-width: 50em)') ?? false;
  const idea = ideas[currentIdeaIndex];
  const socketRef = useRef<WebSocket | null>(null);

  // Check for access token on the client side
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      setIsLoggedIn(true);
    } else {
      router.push('/login'); // Redirect if not logged in
    }
  }, [router]);

  // Fetch user ID if logged in
  useEffect(() => {
    const getID = async () => {
      const TOKEN = localStorage.getItem('accessToken');
      await axios
        .get('http://localhost:8000/api/query/id/', {
          headers: {
            AUTHORIZATION: `Bearer ${TOKEN}`,
          },
        })
        .then((res) => {
          setUserID(res.data.id);
        })
        .catch((error) => {
          console.log(error);
        });
    };

    if (isLoggedIn && userID === -1) {
      getID();
    }
  }, [isLoggedIn, userID]);

  // Manage the timer and lock state with a countdown and vote submission
  useEffect(() => {
    if (timeRemaining <= 0) return; // Exit early if no countdown is active

    const intervalId = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);

      if (timeRemaining === 1) {
        const newIsVoted = [...isVoted];
        newIsVoted[currentOptionIndex] = true;
        setIsVoted(newIsVoted);

        sendVoteData(currentOptionIndex + 1, votes[currentOptionIndex]);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeRemaining]);

  const sendVoteData = (criteria_id: number, vote_score: number) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const payload = {
        session_id: '12345',
        user_id: userID,
        votes: [{ criteria_id, vote_score }],
      };
      socketRef.current.send(JSON.stringify(payload));
    }
  };

  const radioClick = (index: number, val: number) => {
    if (isVoted[index]) return;
    startStopTimer(index);
    updateVotes(index, val);
  };

  const updateVotes = (index: number, val: number) => {
    const newVotes = [...votes];
    newVotes[index] = val;
    setVotes(newVotes);
    setCurrentReasonIndex(index);
  };

  const startStopTimer = (index: number) => {
    setTimeRemaining(TIMERLENGTH);
    setCurrentOptionIndex(index);
  };

  const connectWebSocket = () => {
    socketRef.current = new WebSocket('ws://localhost:8000/ws/vote/');
    socketRef.current.onmessage = (event: MessageEvent) => {
      const data: WebSocketMessage = JSON.parse(event.data);
      console.log('Response from server:', data);
      if (data.outlier) {
        modalHandlers.open(); // Open the modal if it's an outlier and matches the current user
      } else if (data.result) {
        setCurVotes((prevVotes) => {
          const newVotes = [...prevVotes];
          const criteriaIndex = data.criteria_id - 1; // Adjust criteria_id to 0-based index
          newVotes[criteriaIndex] = data.result;
          return newVotes;
        });
    }
    };
    
    socketRef.current.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
    };

    socketRef.current.onclose = (event: CloseEvent) => {
      console.log('WebSocket connection closed:', event);
    };
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      socketRef.current?.close();
    };
  }, []);

  const handleSubmit = () => {
    goToNextIdea();
  };

  const goToNextIdea = () => {
    if (currentIdeaIndex < ideas.length - 1) {
      setCurrentIdeaIndex(currentIdeaIndex + 1);
    }
    setCurrentOptionIndex(-1);
    setIsVoted(Array.from({ length: NUMCATS }, () => false));
    setVotes(Array.from({ length: NUMCATS }, () => 0));
    setReasons(Array.from({ length: NUMCATS }, () => ''));
    setTimeRemaining(0);
  };

  const handleReasonSubmit = () => {
    const newReasons = [...reasons];
    newReasons[currentReasonIndex] = reasonInput;
    setReasons(newReasons);
    setReasonInput('');
    modalHandlers.close();
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
      <Stack>
        {timeRemaining > 0 && currentOptionIndex === index && (
          <h4 style={{ textAlign: 'center' }}>Time Remaining: {timeRemaining}s</h4>
        )}
        <Flex>
          <InfoButton message={infoM} />
          <RadioGroup
            value={votes[index].toString()}
            label={caption}
            className={timeRemaining > 0 && currentOptionIndex !== index ? 'Disabled' : ''}
            bg="rgba(0, 0, 0, .3)"
            required
          >
            <Flex gap="md">
              <Image alt="One finger" component={NextImage} src={oneF} h={35} />
              <Radio value="1" onClick={() => radioClick(index, 1)} color="grape" />
              <Radio value="2" onClick={() => radioClick(index, 2)} color="grape" />
              <Radio value="3" onClick={() => radioClick(index, 3)} color="grape" />
              <Radio value="4" onClick={() => radioClick(index, 4)} color="grape" />
              <Radio value="5" onClick={() => radioClick(index, 5)} color="grape" />
              <Image alt="Five fingers" component={NextImage} src={fiveF} h={35} />
            </Flex>
          </RadioGroup>
        </Flex>
      </Stack>
    </Center>
  );
  console.log("curVotes:", curVotes);
  console.log("isVoted:", isVoted);

  const categories = [
    { caption: "Reason to Buy", infoM: "Based on: Unmet need, Effective solution, and Better than current solutions. [HIGH is GOOD]" },
    { caption: "Market Volume", infoM: "Based on: Current market size and Expected growth. [HIGH is GOOD]" },
    { caption: "Economic Viability", infoM: "Based on: Margins (value vs. cost), Customers' ability to pay, and Customer stickiness? [HIGH is GOOD]" },
    { caption: "Obstacles to Implementation", infoM: "Based on: Product development difficulties and Funding challenges [WANT LOW]" },
    { caption: "Time To Revenue", infoM: "Based on: Development time, Time between product and market readiness, and Length of sale cycle (e.g. hospitals and schools take a long time) [WANT LOW]" },
    { caption: "Economic Risks", infoM: "Based on: Competitive threats, 3rd party dependencies, and Barriers to adoption. [WANT LOW]" }
  ];

  return (
  <>
    <h2 style={{ textAlign: 'center' }}>
      Idea #{currentIdeaIndex + 1}: {`${idea[0]} (${idea[1]})`}
    </h2>

    {idea[3] && (
      <div style={{ textAlign: 'center' }}>
        <Center>
          <Image src={idea[3]} alt="" style={{ width: '300px', marginBottom: '20px' }} />
        </Center>
      </div>
    )}
    
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Center>
        <Stack bg="var(--mantine-color-body)" align="stretch" justify="center" gap="sm">
          {categories.map((category, index) => (
            <React.Fragment key={index}>
              <Selection caption={category.caption} index={index} infoM={category.infoM} />
              {isVoted[index] && (
                <Graph
                  key={index}
                  graphTitle=""
                  votes={Array.from({ length: VOTEOPTIONS }, (_, i) => [i + 1, curVotes[index][i]])}
                />
              )}
            </React.Fragment>
          ))}
        </Stack>
      </Center>
      <Center>
        <Button className="Idea-button" type="submit">Submit</Button>
      </Center>
    </form>

    <Modal
      opened={modalOpened}
      onClose={modalHandlers.close}
      title="Enter your reason"
      centered
      fullScreen={isMobile}
      transitionProps={{ transition: 'fade', duration: 200 }}
    >
      <Textarea
        placeholder="Explain your reasoning for your vote here"
        value={reasonInput}
        onChange={(e) => setReasonInput(e.target.value)}
      />
      <Button onClick={handleReasonSubmit} mt="md">Submit Reason</Button>
    </Modal>
  </>
);
}
