'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from '@mantine/form';
import './Idea.css';
import './Voting.css';
import NextImage from 'next/image';
import { RadioGroup, Radio, Flex, Button, Stack, Center, Image, Modal, Textarea } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Graph } from '../../../components/Graph/Graph';
import { HeaderSimple } from '@/components/Header/Header';
import oneF from '../../../public/OneFinger.png';
import fiveF from '../../../public/FiveFingers.png';

// TypeScript Interfaces
interface VotingProps {
  caption: string;
  index: number;
  infoM: string;
}

interface InfoProps {
  message: string;
}

// result is 1D array with the new votes
// outlier is a number corresponding to the vote category for which they have become an outlier
interface WebSocketMessage {
  result: number[];
  outlier: number;
  criteria_id: number;
  user_id: number;
  median: number;
}

type Opp = {
  name: string;
  customer_segment: string;
  description: string;
  opportunity_id: number;
  reasons: string[];
  imgurl: string;
};

const Voting = ({ params }) => {
  const NUMCATS = 6;
  const TIMERLENGTH = 3;
  const VOTEOPTIONS = 5;
  const form = useForm({ mode: 'uncontrolled' });
  const [userID, setUserID] = useState(-1);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track if the user is logged in
  const [currentIdeaIndex, setCurrentIdeaIndex] = useState(0);
  const [currentOptionIndex, setCurrentOptionIndex] = useState(-1);
  const [isVoted, setIsVoted] = useState(Array.from({ length: NUMCATS }, () => false));
  const [votes, setVotes] = useState<number[][]>([[0, 0, 0, 0, 0, 0]]);
  const [reasons, setReasons] = useState(Array.from({ length: NUMCATS }, () => ''));
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [modalOpened, modalHandlers] = useDisclosure(false);
  const [currentReasonIndex, setCurrentReasonIndex] = useState(-1);
  const [median, setMedian] = useState<number>(0);
  const [reasonInput, setReasonInput] = useState('');
  const [curVotes, setCurVotes] = useState<number[][][]>(
    [Array.from({ length: NUMCATS }, () => Array(VOTEOPTIONS).fill(0))]
  );
  const router = useRouter();
  const [ideas, setIdeas] = useState<Opp[]>([]);
  const [idea, setIdea] = useState(null);
  const [session, setSession] = useState(0);
  const [queryFetched, setQueryFetched] = useState(false);

  // Check for mobile device
  const isMobile = useMediaQuery('(max-width: 50em)') ?? false;
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

        sendVoteData(currentOptionIndex + 1, votes[currentIdeaIndex][currentOptionIndex]);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeRemaining]);

  const getSession = async () => {
    const TOKEN = localStorage.getItem('accessToken');
    const sesh = (await params).session;
    const requestString = `http://localhost:8000/api/query/oppvoting?code=${sesh}`;
    setSession(sesh);
    await axios
         .get(requestString, {
           headers: {
             AUTHORIZATION: `Bearer ${TOKEN}`,
           },
         })
         .then(res => {
             const newIdeas: React.SetStateAction<any[]> = [];
             const newVotes: React.SetStateAction<any[]> = [];
             const newAllVotes: React.SetStateAction<any[]> = [];
             const opportunities = res.data;
             opportunities.forEach((
               opp: {
                 name: any;
                 customer_segment: any;
                 description: any;
                 opportunity_id: any;
                 reasons: any;
                 imgurl: string }) => {
               newIdeas.push([
                 opp.name,
                 opp.customer_segment,
                 opp.description,
                 opp.opportunity_id,
                 opp.reasons,
                 opp.imgurl]);
               newVotes.push([0, 0, 0, 0, 0, 0]);
               newAllVotes.push(Array.from({ length: NUMCATS }, () => Array(VOTEOPTIONS).fill(0)));
             });
             console.log(newIdeas);
             setIdeas(newIdeas);
             setVotes(newVotes);
             setCurVotes(newAllVotes);
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

  const sendVoteData = (criteria_id: number, vote_score: number) => {
    const newVotesAll = [...votes];
    const newVotesOpp = [...votes[currentIdeaIndex]];
    newVotesOpp[criteria_id - 1] = vote_score;
    newVotesAll[currentIdeaIndex] = newVotesOpp;
    setVotes(newVotesAll);
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const payload = {
        opportunity_id: idea[3],
        session_id: session,
        user_id: userID,
        votes: [{ criteria_id, vote_score }],
      };
      socketRef.current.send(JSON.stringify(payload));
    }
  };

  const radioClick = (index: number, val: number) => {
    if (timeRemaining > 0 && index !== currentOptionIndex) return;
    startStopTimer(index);
    updateVotes(index, val);
  };

  const updateVotes = (index: number, val: number) => {
    const newVotesAll = [...votes];
    const newVotesOpp = [...votes[currentIdeaIndex]];
    newVotesOpp[index] = val;
    newVotesAll[currentIdeaIndex] = newVotesOpp;
    setVotes(newVotesAll);
    setCurrentReasonIndex(index);
  };

  const startStopTimer = (index: number) => {
    setTimeRemaining(TIMERLENGTH);
    setCurrentOptionIndex(index);
  };

  const connectWebSocket = () => {
    socketRef.current = new WebSocket(`ws://localhost:8000/ws/vote/${session}/`);
    socketRef.current.onmessage = (event: MessageEvent) => {
      const data: WebSocketMessage = JSON.parse(event.data);
      console.log('Response from server:', data);
      if (data.outlier) {
        setMedian(data.median);
        modalHandlers.open(); // Open the modal if it's an outlier and matches the current user
      } else if (data.result) {
        setCurVotes((prevVotes) => {
          const allVotes = [...prevVotes];
          const newVotes = [...allVotes[currentIdeaIndex]];
          const criteriaIndex = data.criteria_id - 1; // Adjust criteria_id to 0-based index
          newVotes[criteriaIndex] = data.result;
          allVotes[currentIdeaIndex] = newVotes;
          return allVotes;
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
    if (idea) connectWebSocket();
    return () => {
      if (idea) socketRef.current?.close();
    };
  }, [idea]);

  const handleSubmit = () => {
    goToNextIdea();
  };

  const goToNextIdea = () => {
    if (currentIdeaIndex < ideas.length - 1) {
      setIdea(ideas[currentIdeaIndex + 1]);
      setCurrentIdeaIndex(currentIdeaIndex + 1);
    }
    else router.push('/dashboard');
    setCurrentOptionIndex(-1);
    setIsVoted(Array.from({ length: NUMCATS }, () => false));
    setReasons(Array.from({ length: NUMCATS }, () => ''));
    setTimeRemaining(0);
  };


  const goToPreviousIdea = () => {
    if (currentIdeaIndex > 0) {
      setIdea(ideas[currentIdeaIndex - 1]);
      setCurrentIdeaIndex(currentIdeaIndex - 1);
    }
    setCurrentOptionIndex(-1);
    setIsVoted(Array.from({ length: NUMCATS }, () => false));
    setReasons(Array.from({ length: NUMCATS }, () => ''));
    setTimeRemaining(0);
  }

  const isEmpty = (vs : number[]) => {
    for (let i = 0; i < vs.length; i += 1) {
      if (vs[i] > 0) return false;
    }
    return true;
  };

  const handleReasonSubmit = async () => {
    const TOKEN = localStorage.getItem('accessToken');
    const newReasons = [...reasons];
    newReasons[currentReasonIndex] = reasonInput;
    try {
      const response = await axios.post('http://localhost:8000/api/add/reason/', {
        opportunity_id: idea[3],
        reason: reasonInput,
        criteria_id: currentReasonIndex + 1,
      }, {
        headers: {
          AUTHORIZATION: `Bearer ${TOKEN}`,
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      setReasons(newReasons);
      setReasonInput('');
      modalHandlers.close();
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
      <Stack>
        {timeRemaining > 0 && currentOptionIndex === index && (
          <h4 style={{ textAlign: 'center' }}>Time Remaining: {timeRemaining}s</h4>
        )}
        <Flex>
          <InfoButton message={infoM} />
            <RadioGroup
              value={votes[currentIdeaIndex][index].toString()}
              label={caption}
              description={currentIdeaIndex > 0 && votes[currentIdeaIndex - 1][index] > 0 ?
                `You voted ${votes[currentIdeaIndex - 1][index]} for ${ideas[currentIdeaIndex - 1][0]}` : ''}
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

  if (!queryFetched || !idea) {
    return (
        <p>Loading...</p>
    );
  }

  return (
  <>
  <HeaderSimple glowIndex={-1} />
    <h2 style={{ textAlign: 'center' }}>
      Idea #{currentIdeaIndex + 1}: {`${idea[0]} (${idea[1]})`}
    </h2>

    <p style={{ textAlign: 'center', width: '50%', margin: 'auto'}}>
        {idea[2]}
    </p>

    {idea[5] && (
      <div style={{ textAlign: 'center' }}>
        <Center>
          <Image src={idea[5]} alt="" style={{ width: '300px', marginBottom: '20px' }} />
        </Center>
      </div>
    )}
    
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Center>
        <Stack bg="var(--mantine-color-body)" align="stretch" justify="center" gap="sm">
          {categories.map((category, index) => (
            <React.Fragment key={index}>
              <Selection caption={category.caption} index={index} infoM={category.infoM} />
              {votes[currentIdeaIndex][index] > 0 &&
              !isEmpty(curVotes[currentIdeaIndex][index]) && (
                <Graph
                  key={index}
                  graphTitle=""
                  votes={Array.from({ length: VOTEOPTIONS },
                    (_, i) => [i + 1, curVotes[currentIdeaIndex][index][i]])}
                />
              )}
            </React.Fragment>
          ))}
        </Stack>
      </Center>
      <Center>
        {currentIdeaIndex > 0 &&
          <Button className="Idea-button" type="button" onClick={goToPreviousIdea} mx="md">Return</Button>
        }
        <Button className="Idea-button" type="submit">{currentIdeaIndex < ideas.length - 1 ? 'Proceed' : 'Finish'}</Button>
      </Center>
    </form>

    <Modal
      opened={modalOpened}
      onClose={modalHandlers.close}
      title={`You are an outlier. Your vote: ${votes[currentIdeaIndex][currentReasonIndex]}. Median: ${Math.floor((median * 10)) / 10}.`}
      centered
      fullScreen={isMobile}
      transitionProps={{ transition: 'fade', duration: 200 }}
    >
      <Textarea
        placeholder="Please share your valuable input"
        value={reasonInput}
        onChange={(e) => setReasonInput(e.target.value)}
      />
      <Button onClick={handleReasonSubmit} mt="md">Submit Reason</Button>
    </Modal>
  </>
);
};

export default Voting;
