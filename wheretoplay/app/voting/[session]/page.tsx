'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from '@mantine/form';
import './Idea.css';
import './Voting.css';
import NextImage from 'next/image';
import { RadioGroup, Radio, Flex, Button, Stack, Center, Image, Modal, Textarea, Tooltip, Badge } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Graph } from '../../../components/Graph/Graph';
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
  notification: string;
  user_ids?: number[];
  lower?: number;
  upper?: number;
  result?: number[];
  outlier?: number;
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
  const [previousVotes, setPreviousVotes] = useState(Array.from({ length: NUMCATS }, () => null)); // Store previous votes
  const [curVotes, setCurVotes] = useState<number[][][]>(
    [Array.from({ length: NUMCATS }, () => Array(VOTEOPTIONS).fill(0))]
  );
  const router = useRouter();
  const [ideas, setIdeas] = useState<Opp[]>([]);
  const [idea, setIdea] = useState(null);
  const [session, setSession] = useState(0);
  const [queryFetched, setQueryFetched] = useState(false);
  const [badgeState, setBadgeState] = useState<{ [key: number]: boolean }>({});

  // Check for mobile device
  const isMobile = useMediaQuery('(max-width: 50em)') ?? false;
  const socketRef = useRef<WebSocket | null>(null);
  const TOKEN = localStorage.getItem('accessToken');
  const RefreshToken = localStorage.getItem('refreshToken');
  const [submittedReasons, setSubmittedReasons] = useState<{ [key: number]: boolean }>({});


  // Check for access token or guest ID
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const guestId = typeof window !== 'undefined' ? localStorage.getItem('guest_id') : null;
  
    if (token || guestId) {
      // Either logged in or guest, no redirection
      setIsLoggedIn(Boolean(token)); // Logged-in user if token is present
      if (guestId) {
        setUserID(parseInt(guestId, 10)); // Set guest user ID
      }
    } else {
      // Save session pin to local storage
      if (typeof window !== 'undefined') {
        localStorage.setItem('sessionPin', params.session);
      }
      router.push('/guestjoin');
    }
  }, [router, params]);

  // Fetch user ID if logged in
  useEffect(() => {
    const getID = async () => {
      const guestId = localStorage.getItem('guest_id');

      if (guestId) {
        setUserID(parseInt(guestId, 10)); // Use guest ID directly
        return;
      }

      if (TOKEN) {
        await axios
          .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/query/id/`, {
            headers: {
              AUTHORIZATION: `Bearer ${TOKEN}`,
            },
          })
          .then((res) => {
            setUserID(res.data.id);
          })
          .catch(async error => {
            console.log(error);
            if (
            axios.isAxiosError(error) &&
            error.response &&
            error.response.status === 401 &&
            RefreshToken
          ) {
            try {
                const refreshResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/token/refresh/`, {
                    refresh: RefreshToken,
                });

                localStorage.setItem('accessToken', refreshResponse.data.access);

                await axios
                .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/query/id/`, {
                  headers: {
                    AUTHORIZATION: `Bearer ${refreshResponse.data.access}`,
                  },
                })
                .then((res) => {
                  setUserID(res.data.id);
                });
            } catch (refreshError) {
                            if (refreshError.response && refreshError.response.status === 401) {
                              console.log('Refresh token expired. Redirecting to login.');
                              localStorage.removeItem('accessToken');
                              localStorage.removeItem('refreshToken');
                              router.push('/login');
                            } else {
                            console.error('An unexpected error occurred:', refreshError);
                          }
                    }
                }
            });
      }
    };
    getID();
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
    const guestId = localStorage.getItem('guest_id');
    const sesh = params.session || localStorage.getItem('sessionPin');
    const requestString = `${process.env.NEXT_PUBLIC_API_BASE_URL}/query/oppvoting?code=${sesh}`;
    setSession(sesh);

    const successlogic = res => {
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
  };

    setSession(sesh);
    await axios
         .get(requestString, {
           headers: {
             AUTHORIZATION: `Bearer ${TOKEN}`,
           },
         })
         .then(successlogic)
         .catch(async error => {
          console.log(error);
          if (
            axios.isAxiosError(error) &&
            error.response &&
            error.response.status === 401 &&
            RefreshToken
          ) {
            try {
                const refreshResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/token/refresh/`, {
                    refresh: RefreshToken,
                });

                localStorage.setItem('accessToken', refreshResponse.data.access);

                await axios
                    .get(requestString, {
                    headers: {
                        AUTHORIZATION: `Bearer ${refreshResponse.data.access}`,
                    },
                    })
                    .then(successlogic);
            } catch (refreshError) {
                            if (refreshError.response && refreshError.response.status === 401) {
                              console.log('Refresh token expired. Redirecting to login.');
                              localStorage.removeItem('accessToken');
                              localStorage.removeItem('refreshToken');
                              router.push('/login');
                            } else {
                            console.error('An unexpected error occurred:', refreshError);
                          }
                    }
                }
            });
  };

  if (!queryFetched && typeof window !== 'undefined') {
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
        ...(localStorage.getItem('guest_id')
          ? { guest_id: parseInt(localStorage.getItem('guest_id')!, 10) }
          : { user_id: userID }),
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
    const newVotes = [...votes];
    newVotes[index] = val;
    setVotes(newVotes);
    if (isVoted[index]) {
      const newPreviousVotes = [...previousVotes];
      newPreviousVotes[index] = votes[currentIdeaIndex][index];
      setPreviousVotes(newPreviousVotes);
    }
    const newIsVoted = [...isVoted];
    newIsVoted[index] = true;
    setIsVoted(newIsVoted);
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
      if (data.notification === 'Outliers by user ID' && data.user_ids && data.criteria_id !== undefined) {
        const isOutlier = data.user_ids.includes(userID); // Check if current user is an outlier
        setBadgeState((prevState) => ({
          ...prevState,
          [data.criteria_id - 1]: isOutlier, // Update badgeState for the current category (0-based index)
        }));
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
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/add/reason/`, {
        opportunity_id: idea[3],
        reason: reasonInput,
        criteria_id: currentReasonIndex + 1,
      }, {
        headers: {
          AUTHORIZATION: `Bearer ${TOKEN}`,
        },
      });
      setSubmittedReasons((prev) => ({
        ...prev,
        [currentReasonIndex]: true,
      }));
    } catch (error) {
        if (
          axios.isAxiosError(error) &&
          error.response &&
          error.response.status === 401 &&
          RefreshToken
        ) {
          try {
              const refreshResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/token/refresh/`, {
                  refresh: RefreshToken,
              });

              localStorage.setItem('accessToken', refreshResponse.data.access);

              const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/add/reason/`, {
                opportunity_id: idea[3],
                reason: reasonInput,
                criteria_id: currentReasonIndex + 1,
              }, {
                headers: {
                  AUTHORIZATION: `Bearer ${refreshResponse.data.access}`,
                },
              });
              setSubmittedReasons((prev) => ({
                ...prev,
                [currentReasonIndex]: true,
              }));
          } catch (refreshError) {
                          if (refreshError.response && refreshError.response.status === 401) {
                            console.log('Refresh token expired. Redirecting to login.');
                            localStorage.removeItem('accessToken');
                            localStorage.removeItem('refreshToken');
                            router.push('/login');
                          } else {
                          console.error('An unexpected error occurred:', refreshError);
                        }
                  }
              }
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

  const Selection: React.FC<VotingProps> = ({ caption, index, infoM }) => {
    const isOutlier = badgeState[index] || false; // Check the badgeState for the current index
    const hasSubmitted = submittedReasons[index] || false; // Check if input has been submitted for this criterion
    const badgeColor = isOutlier ? (hasSubmitted ? "red" : "red") : "green"; // Green if submitted, red otherwise
    const badgeLabel = isOutlier
      ? hasSubmitted
        ? "You are an outlier, and we have received your input."
        : "Click here! You are an outlier."
      : "You are not an outlier.";
  
    const handleBadgeClick = () => {
      if (isOutlier && !hasSubmitted) {
        setCurrentReasonIndex(index); // Set the current criteria as the reason index
        modalHandlers.open(); // Open the modal
      }
    };
  
    return (
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
              description={
                currentIdeaIndex > 0 && votes[currentIdeaIndex - 1][index] > 0
                  ? `You voted ${votes[currentIdeaIndex - 1][index]} for ${ideas[currentIdeaIndex - 1][0]}`
                  : ''
              }
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
                <Tooltip label={badgeLabel} withArrow>
                  <Badge
                    color={badgeColor}
                    size="md"
                    variant="filled"
                    onClick={handleBadgeClick}
                    style={{
                      cursor: isOutlier && !hasSubmitted ? "pointer" : "default",
                      border: hasSubmitted ? "2px solid green" : undefined,
                    }}
                  />
                </Tooltip>
              </Flex>
            </RadioGroup>
          </Flex>
        </Stack>
      </Center>
    );
  };
  
  //console.log("curVotes:", curVotes);
  //console.log("isVoted:", isVoted);

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
