'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from '@mantine/form';
import './Idea.css';
import './Voting.css';
import NextImage from 'next/image';
import { RadioGroup, Radio, Flex, Button, Stack, Center, Image, Modal, Textarea } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
//import { CustomModal } from '../../components/CustomModal/CustomModal';
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
  outlier: number
}

export default function Voting({ ideas }: any) {
  const NUMCATS = 6;
  const TIMERLENGTH = 2;
  const VOTEOPTIONS = 5;
  const form = useForm({ mode: 'uncontrolled' });
  const [userID, setUserID] = useState(-1);
  const [currentIdeaIndex, setCurrentIdeaIndex] = useState(0);
  const [currentOptionIndex, setCurrentOptionIndex] = useState(-1);
  const [isVoted, setIsVoted] = useState(Array.from({ length: NUMCATS }, () => false));
  const [votes, setVotes] = useState(Array.from({ length: NUMCATS }, () => 0));
  const [reasons, setReasons] = useState(Array.from({ length: NUMCATS }, () => ''));
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [modalOpened, modalHandlers] = useDisclosure(false);
  const [currentReasonIndex, setCurrentReasonIndex] = useState(-1);
  const [reasonInput, setReasonInput] = useState('');
  const [curVotes, setCurVotes] =
  useState(Array.from({ length: NUMCATS }, () => Array.from({ length: VOTEOPTIONS }, () => 0)));
  const router = useRouter();

  // Check for mobile device
  const isMobile = useMediaQuery('(max-width: 50em)') ?? false;
  const idea = ideas[currentIdeaIndex];
  const socketRef = useRef<WebSocket | null>(null);

  if (typeof window !== 'undefined' && !localStorage.getItem('accessToken')) {
    router.push('/login');
  }

  const getID = async () => {
    if (typeof window === 'undefined') return;
    const TOKEN = localStorage.getItem('accessToken');
    await axios
        .get('http://localhost:8000/api/query/id/', {
          headers: {
            AUTHORIZATION: `Bearer ${TOKEN}`,
          },
        })
        .then(res => {
            console.log(res);
            setUserID(res.data.id);
        })
        .catch(error => {
          console.log(error);
        });
      };

    if (userID === -1) getID();

// Manage the timer and lock state with a countdown and vote submission
useEffect(() => {
  if (timeRemaining <= 0) return; // Exit early if no countdown is active

  const intervalId = setInterval(() => {
    setTimeRemaining((prev) => prev - 1);

    if (timeRemaining === 1) {
      // Lock this criteria as "voted"
      const newIsVoted = [...isVoted];
      newIsVoted[currentOptionIndex] = true;
      setIsVoted(newIsVoted);

      sendVoteData(currentOptionIndex + 1, votes[currentOptionIndex]); // Send only current vote data
    }
  }, 1000);

  // eslint-disable-next-line consistent-return
  return () => clearInterval(intervalId);
}, [timeRemaining]);

// Function to send vote data through WebSocket
const sendVoteData = (criteria_id: number, vote_score: number) => {
  if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
    const payload = {
      session_id: '12345', // known as "code" in the workspace database
      user_id: userID, // Placeholder
      votes: [
        {
          criteria_id,
          vote_score,
        },
      ],
    };

    console.log('Sending payload to backend:', JSON.stringify(payload, null, 2)); // Indented for clarity
    socketRef.current.send(JSON.stringify(payload));
  } else {
    console.error('WebSocket is not open. Current readyState:', socketRef.current?.readyState);
  }
};

// Update the radioClick function to start the countdown on each selection
const radioClick = (index: number, val: number) => {
  if (isVoted[index]) return; // Skip if this criteria has already been voted on
  startStopTimer(index);
  updateVotes(index, val); // Update the vote with the selected value
};

  const updateVotes = (index: number, val: number) => {
    const newVotes = [...votes];
    newVotes[index] = val;
    setVotes(newVotes);
    setCurrentReasonIndex(index); // Track which option is requesting a reason

    // Disable modals for now
    //modalHandlers.open();
  };

  const startStopTimer = (index: number) => {
    setTimeRemaining(TIMERLENGTH);
    setCurrentOptionIndex(index);
  };

  const connectWebSocket = () => {
    socketRef.current = new WebSocket('ws://localhost:8000/ws/vote/');

    socketRef.current.onopen = () => {
      console.log('WebSocket connection opened');
    };

    // Message from server, either a vote update or an outlier notification
    socketRef.current.onmessage = (event: MessageEvent) => {
      const data: WebSocketMessage = JSON.parse(event.data);
      console.log('Response from server!');

      if (data.outlier === -1) console.log('not an outlier');
      else console.log(`outlier for catgory ${data.outlier}`);

      console.log(data.result);
      setCurVotes(data.result);
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
    setReasonInput(''); // Clear input
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
        {timeRemaining > 0 && currentOptionIndex === index &&
        <h4 style={{ textAlign: 'center' }}>
          Time Remaining: {timeRemaining}s
        </h4>}
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
                alt=""
                style={{ width: '300px', marginBottom: '20px' }}
              />
            </Center>
        </div>
        )}
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Center>
        <Stack
          bg="var(--mantine-color-body)"
          align="stretch"
          justify="center"
          gap="sm"
            >
            <Selection caption="Reason to Buy" index={0} infoM="Based on: Unmet need, Effective solution, and Better than current solutions. [HIGH is GOOD]" />
            {isVoted[0] && <Graph key="0" graphTitle="" votes={[[1, curVotes[0][0]], [2, curVotes[0][1]], [3, curVotes[0][2]], [4, curVotes[0][3]], [5, curVotes[0][4]]]} />}

            <Selection caption="Market Volume" index={1} infoM="Based on: Current market size and Expected growth. [HIGH is GOOD]" />
            {isVoted[1] && <Graph key="1" graphTitle="" votes={[[1, curVotes[1][0]], [2, curVotes[1][1]], [3, curVotes[1][2]], [4, curVotes[1][3]], [5, curVotes[1][4]]]} />}

            <Selection caption="Economic Viability" index={2} infoM="Based on: Margins (value vs. cost), Customers' ability to pay, and Customer stickiness? [HIGH is GOOD]" />
            {isVoted[2] && <Graph key="2" graphTitle="" votes={[[1, curVotes[2][0]], [2, curVotes[2][1]], [3, curVotes[2][2]], [4, curVotes[2][3]], [5, curVotes[2][4]]]} />}

            <Selection caption="Obstacles to Implementation" index={3} infoM="Based on: Product development difficulties and Funding challenges [WANT LOW]" />
            {isVoted[3] && <Graph key="3" graphTitle="" votes={[[1, curVotes[3][0]], [2, curVotes[3][1]], [3, curVotes[3][2]], [4, curVotes[3][3]], [5, curVotes[3][4]]]} />}

            <Selection caption="Time To Revenue" index={4} infoM="Based on: Development time, Time between product and market readiness, and Length of sale cycle (e.g. hospitals and schools take a long time) [WANT LOW]" />
            {isVoted[4] && <Graph key="4" graphTitle="" votes={[[1, curVotes[4][0]], [2, curVotes[4][1]], [3, curVotes[4][2]], [4, curVotes[4][3]], [5, curVotes[4][4]]]} />}

            <Selection caption="Economic Risks" index={5} infoM="Based on: Competitive threats, 3rd party dependencies, and Barriers to adoption. [WANT LOW]" />
            {isVoted[5] && <Graph key="5" graphTitle="" votes={[[1, curVotes[5][0]], [2, curVotes[5][1]], [3, curVotes[5][2]], [4, curVotes[5][3]], [5, curVotes[5][4]]]} />}
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