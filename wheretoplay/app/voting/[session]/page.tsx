'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from '@mantine/form';

import NextImage from 'next/image';
import { RadioGroup, Radio, Flex, Button, Stack, Center, Image, Modal, Textarea, Tooltip, Badge } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { showNotification } from '@mantine/notifications';
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
  criteria_id: number;
  idea_index: number;
  user_id: number;
  user_ids: number[];
  guest_id: number;
  guest_ids: number[];
  result: number[];
}

type Opp = {
  name: string;
  customer_segment: string;
  description: string;
  opportunity_id: number;
  reasons: string[];
  imgurl: string;
};

type Vote = {
  score: number;
  isOutlier: boolean;
  hasSubmitted: boolean;
};

const Voting = ({ params } : any) => {
  const NUMCATS = 6;
  const TIMERLENGTH = 3;
  const VOTEOPTIONS = 5;
  const CATEGORIES = [
    { caption: 'Reason to Buy', infoM: 'Based on: Unmet need, Effective solution, and Better than current solutions. [HIGH is GOOD]' },
    { caption: 'Market Volume', infoM: 'Based on: Current market size and Expected growth. [HIGH is GOOD]' },
    { caption: 'Economic Viability', infoM: 'Based on: Margins (value vs. cost), Customers ability to pay, and Customer stickiness? [HIGH is GOOD]' },
    { caption: 'Obstacles to Implementation', infoM: 'Based on: Product development difficulties and Funding challenges [WANT LOW]' },
    { caption: 'Time To Revenue', infoM: 'Based on: Development time, Time between product and market readiness, and Length of sale cycle (e.g. hospitals and schools take a long time) [WANT LOW]' },
    { caption: 'Economic Risks', infoM: 'Based on: Competitive threats, 3rd party dependencies, and Barriers to adoption. [WANT LOW]' },
  ];
  const form = useForm({ mode: 'uncontrolled' });
  const [userID, setUserID] = useState(-1);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track if the user is logged in
  const [currentIdeaIndex, setCurrentIdeaIndex] = useState(0);
  const [currentOptionIndex, setCurrentOptionIndex] = useState(-1);
  const [isVoted, setIsVoted] = useState(Array.from({ length: NUMCATS }, () => false));
  const [votes, setVotes] = useState<Vote[][]>(
    [[
      { score: 0, isOutlier: false, hasSubmitted: false },
      { score: 0, isOutlier: false, hasSubmitted: false },
      { score: 0, isOutlier: false, hasSubmitted: false },
      { score: 0, isOutlier: false, hasSubmitted: false },
      { score: 0, isOutlier: false, hasSubmitted: false },
      { score: 0, isOutlier: false, hasSubmitted: false },
    ]]);
  const [reasons, setReasons] = useState(Array.from({ length: NUMCATS }, () => ''));
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [modalOpened, modalHandlers] = useDisclosure(false);
  const [currentReasonIndex, setCurrentReasonIndex] = useState(-1);
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

  // Check for mobile device
  const isMobile = useMediaQuery('(max-width: 50em)') ?? false;
  const socketRef = useRef<WebSocket | null>(null);
  const TOKEN = localStorage.getItem('accessToken');
  const RefreshToken = localStorage.getItem('refreshToken');

  // Check for access token or guest ID
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const guestId = typeof window !== 'undefined' ? localStorage.getItem('guest_id') : null;
  
    if (token || guestId) {
      // Either logged in or guest, no redirection
      setIsLoggedIn(Boolean(token)); // Logged-in user if token is present
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
            } catch (refreshError : any) {
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
        sendVoteData(currentOptionIndex + 1, votes[currentIdeaIndex][currentOptionIndex].score);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeRemaining]);

  const getSession = async () => {
    const TOKEN = localStorage.getItem('accessToken'); // User token for authentication
    const RefreshToken = localStorage.getItem('refreshToken'); // Refresh token for re-authentication
    const guestId = localStorage.getItem('guest_id'); // Guest ID if the user is a guest
    const sesh = params.session || localStorage.getItem('sessionPin'); // Session PIN from params or localStorage
    const requestString = `${process.env.NEXT_PUBLIC_API_BASE_URL}/query/oppvoting?code=${sesh}`;

    try {
      // Define headers based on whether the user is authenticated or a guest
      const headers = guestId
        ? {} // Guests don't use Authorization headers
        : { AUTHORIZATION: `Bearer ${TOKEN}` }; // Add Authorization header for authenticated users

      // Send request to fetch session data
      const response = await axios.get(requestString, { headers });

      // Handle success logic (populate session data)
      const newIdeas = [];
      const newVotes = [];
      const newAllVotes = [];
      const opportunities = response.data;

      opportunities.forEach((opp) => {
        newIdeas.push([
          opp.name,
          opp.customer_segment,
          opp.description,
          opp.opportunity_id,
          opp.reasons,
          opp.imgurl,
        ]);
        newVotes.push([
          { score: 0, isOutlier: false, hasSubmitted: false },
          { score: 0, isOutlier: false, hasSubmitted: false },
          { score: 0, isOutlier: false, hasSubmitted: false },
          { score: 0, isOutlier: false, hasSubmitted: false },
          { score: 0, isOutlier: false, hasSubmitted: false },
          { score: 0, isOutlier: false, hasSubmitted: false },
        ]);
        newAllVotes.push(Array.from({ length: NUMCATS }, () => Array(VOTEOPTIONS).fill(0)));
      });

      setIdeas(newIdeas);
      setVotes(newVotes);
      setCurVotes(newAllVotes);
      setIdea(newIdeas[currentIdeaIndex]);
      setSession(sesh);

    } catch (error) {
      // Error handling
      console.error('Error fetching session data:', error);

      if (axios.isAxiosError(error) && error.response && error.response.status === 401 && RefreshToken) {
        try {
          // Attempt to refresh the token
          const refreshResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/token/refresh/`,
            { refresh: RefreshToken }
          );

          // Save the new access token
          localStorage.setItem('accessToken', refreshResponse.data.access);

          // Retry the request with the refreshed token
          const response = await axios.get(requestString, {
            headers: { AUTHORIZATION: `Bearer ${refreshResponse.data.access}` },
          });

          // Handle success logic again (populate session data)
          const newIdeas = [];
          const newVotes = [];
          const newAllVotes = [];
          const opportunities = response.data;

          opportunities.forEach((opp) => {
            newIdeas.push([
              opp.name,
              opp.customer_segment,
              opp.description,
              opp.opportunity_id,
              opp.reasons,
              opp.imgurl,
            ]);
            newVotes.push([
              { score: 0, isOutlier: false, hasSubmitted: false },
              { score: 0, isOutlier: false, hasSubmitted: false },
              { score: 0, isOutlier: false, hasSubmitted: false },
              { score: 0, isOutlier: false, hasSubmitted: false },
              { score: 0, isOutlier: false, hasSubmitted: false },
              { score: 0, isOutlier: false, hasSubmitted: false },
            ]);
            newAllVotes.push(Array.from({ length: NUMCATS }, () => Array(VOTEOPTIONS).fill(0)));
          });

          setIdeas(newIdeas);
          setVotes(newVotes);
          setCurVotes(newAllVotes);
          setIdea(newIdeas[currentIdeaIndex]);
          setSession(sesh);
        } catch (refreshError) {
          // If refresh token is invalid or expired, redirect to login
          if (refreshError.response && refreshError.response.status === 401) {
            console.log('Refresh token expired. Redirecting to login.');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            router.push('/login');
          } else {
            console.error('Unexpected error while refreshing token:', refreshError);
          }
        }
      } else {
        // If not a 401 or refresh token isn't available, handle other errors
        alert('Failed to fetch session data. Please try again.');
      }
    }
  };

  if (!queryFetched && typeof window !== 'undefined') {
    getSession();
    setQueryFetched(true);
  }

  const sendVoteData = (criteria_id: number, vote_score: number) => {
    const newVotesAll = [...votes];
    const newVotesOpp = [...votes[currentIdeaIndex]];
    newVotesOpp[criteria_id - 1].score = vote_score;
    newVotesAll[currentIdeaIndex] = newVotesOpp;
    setVotes(newVotesAll);

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const payload = {
        opportunity_id: idea[3],
        idea_index: currentIdeaIndex,
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
    newVotesOpp[index].score = val;
    newVotesAll[currentIdeaIndex] = newVotesOpp;
    setVotes(newVotesAll);
    setCurrentReasonIndex(index);
  };

  const startStopTimer = (index: number) => {
    setTimeRemaining(TIMERLENGTH);
    setCurrentOptionIndex(index);
  };

  const connectWebSocket = () => {
    // USE WSS in prod and WS in DEV
    // socketRef.current = new WebSocket(`wss://wheretoplay-6af95d3b28f7.herokuapp.com/ws/vote/${session}/`);
    socketRef.current = new WebSocket(`ws://localhost:8000/ws/vote/${session}/`);
    socketRef.current.onmessage = (event: MessageEvent) => {
      const data: WebSocketMessage = JSON.parse(event.data);
      // console.log('Response from server:', data);
      const isOutlier = localStorage.getItem('guest_id') ? data.guest_ids && data.guest_ids.includes(userID) : data.user_ids && data.user_ids.includes(userID); // Check if current user/guest is an outlier
      const newVotesAll = [...votes];
      const newVotesOpp = [...votes[data.idea_index]];
      newVotesOpp[data.criteria_id - 1].isOutlier = isOutlier;
      if (isOutlier) {
        let forceOpen = false;
        // Open instantly after vote if this user was the outlier
        if (data.user_id === userID || data.guest_id === userID) {
          setCurrentReasonIndex(data.criteria_id - 1);
          modalHandlers.open(); // Open the modal if it's an outlier and matches the current user
          forceOpen = true;
        }
        // Show a notification if there is an outlier on a different opportunity than the one being viewed
        if (data.idea_index !== currentIdeaIndex) {
          showNotification({
            title: 'You are now an outlier',
            message: `Add a justification for ${CATEGORIES[data.criteria_id - 1].caption} on ${ideas[data.idea_index][0]}`,
            color: 'red',
          });
        } else if (!forceOpen) {
          showNotification({
            title: 'You are now an outlier',
            message: `Add a justification for ${CATEGORIES[data.criteria_id - 1].caption} by clicking the red button`,
            color: 'red',
          });
        }

        newVotesOpp[data.criteria_id - 1].hasSubmitted = false;
        newVotesAll[data.idea_index] = newVotesOpp;
        setVotes(newVotesAll);
      }
      setCurVotes((prevVotes) => {
        const allVotes = [...prevVotes];
        const newVotes = [...allVotes[data.idea_index]];
        const criteriaIndex = data.criteria_id - 1; // Adjust criteria_id to 0-based index
        newVotes[criteriaIndex] = data.result;
        allVotes[data.idea_index] = newVotes;
        return allVotes;
      });
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

  const canProceed = () => {
    // Cannot proceed if there is a timer currently running
    if (timeRemaining > 0) return false;

    // Cannot proceed if there is an unfilled vote or there is an outlier vote without a reason
    for (let i = 0; i < NUMCATS; i += 1) {
      const vote = votes[currentIdeaIndex][i];
      if (vote.score === 0 || (vote.isOutlier && !vote.hasSubmitted)) return false;
    }

    // If trying to finish cannot proceed if there are retroactive outliers from an earlier page without submitted reasons
    if (currentIdeaIndex + 1 === ideas.length) {
      for (let oppIndex = 0; oppIndex < currentIdeaIndex; oppIndex += 1) {
        for (let i = 0; i < NUMCATS; i += 1) {
          const vote = votes[oppIndex][i];
          if (vote.isOutlier && !vote.hasSubmitted) return false;
        }
      }
    }

    // Otherwise, no pending votes or outliers, so can proceed
    return true;
  };

  const handleSubmit = () => {
    goToNextIdea();
  };

  const goToNextIdea = () => {
    if (timeRemaining > 0) return;
    if (!canProceed()) {
      alert('You must submit all votes and give reasons for all of your outlier votes');
      return;
    }

    if (currentIdeaIndex < ideas.length - 1) {
      setIdea(ideas[currentIdeaIndex + 1]);
      setCurrentIdeaIndex(currentIdeaIndex + 1);
    }
    else router.push('/dashboard/opportunities');
    setCurrentOptionIndex(-1);
    setIsVoted(Array.from({ length: NUMCATS }, () => false));
    setReasons(Array.from({ length: NUMCATS }, () => ''));
    setTimeRemaining(0);
  };

  const goToPreviousIdea = () => {
    if (timeRemaining > 0) return;
    if (currentIdeaIndex > 0) {
      setIdea(ideas[currentIdeaIndex - 1]);
      setCurrentIdeaIndex(currentIdeaIndex - 1);
    }
    setCurrentOptionIndex(-1);
    setIsVoted(Array.from({ length: NUMCATS }, () => false));
    setReasons(Array.from({ length: NUMCATS }, () => ''));
    setTimeRemaining(0);
  };

  const isEmpty = (vs : number[]) => {
    for (let i = 0; i < vs.length; i += 1) {
      if (vs[i] > 0) return false;
    }
    return true;
  };

  const handleReasonSubmit = async () => {
    const headers = localStorage.getItem('guest_id')
        ? {} // Guests don't use Authorization headers
        : { AUTHORIZATION: `Bearer ${TOKEN}` }; // Add Authorization header for authenticated users

    const newReasons = [...reasons];
    newReasons[currentReasonIndex] = reasonInput;
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/add/reason/`, {
        opportunity_id: idea[3],
        reason: reasonInput,
        criteria_id: currentReasonIndex + 1,
        user_id: userID,
      }, {
        headers,
      });
      const newVotesAll = [...votes];
        const newVotesOpp = [...votes[currentIdeaIndex]];
        newVotesOpp[currentReasonIndex].hasSubmitted = true;
        newVotesAll[currentIdeaIndex] = newVotesOpp;
        setVotes(newVotesAll);
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
              const newVotesAll = [...votes];
              const newVotesOpp = [...votes[currentIdeaIndex]];
              newVotesOpp[data.criteria_id - 1].hasSubmitted = true;
              newVotesAll[currentReasonIndex] = newVotesOpp;
              setVotes(newVotesAll);
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
    const { isOutlier } = votes[currentIdeaIndex][index]; // Check the badgeState for the current index
    const { hasSubmitted } = votes[currentIdeaIndex][index]; // Check if input has been submitted for this criterion
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
            <h4 style={{ textAlign: 'center' }}>Vote Locks In: {timeRemaining}s</h4>
          )}
          <Flex>
            <InfoButton message={infoM} />
            <RadioGroup
              value={votes[currentIdeaIndex][index].score.toString()}
              label={caption}
              description={
                currentIdeaIndex > 0 && votes[currentIdeaIndex - 1][index].score > 0
                  ? `You voted ${votes[currentIdeaIndex - 1][index].score} for ${ideas[currentIdeaIndex - 1][0]}`
                  : ''
              }
              style={{ opacity: timeRemaining > 0 && currentOptionIndex !== index ? 0.5 : 1 }}
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

  if (!queryFetched || !idea) {
    return (
        <p>Loading...</p>
    );
  }

  return (
  <>
    <h2 style={{ textAlign: 'center' }}>
      Opportunity #{currentIdeaIndex + 1}: {`${idea[0]} (${idea[1]})`}
    </h2>

    <p style={{ textAlign: 'center', width: '50%', margin: 'auto' }}>
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
          {CATEGORIES.map((category, index) => (
            <React.Fragment key={index}>
              <Selection caption={category.caption} index={index} infoM={category.infoM} />
              {votes[currentIdeaIndex][index].score > 0 &&
              !isEmpty(curVotes[currentIdeaIndex][index]) &&
              (timeRemaining === 0 || currentOptionIndex !== index) && (
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
          <Button mt="md" className="Idea-button" type="button" onClick={goToPreviousIdea} disabled={timeRemaining > 0} mx="md">Return</Button>
        }
        <Button mt="md" className="Idea-button" type="submit" data-disabled={!canProceed()}>{currentIdeaIndex < ideas.length - 1 ? 'Proceed' : 'Finish'}</Button>
      </Center>
    </form>

    {votes[currentIdeaIndex][currentReasonIndex] &&
      <Modal
        opened={modalOpened}
        onClose={modalHandlers.close}
        title={`You are an outlier. Your vote: ${votes[currentIdeaIndex][currentReasonIndex].score}.`}
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
    }
  </>
);
};

export default Voting;
