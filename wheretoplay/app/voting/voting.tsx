'use client';

import React, { useState, useEffect } from 'react';

import { useForm } from '@mantine/form';

import './Idea.css';
import './Voting.css';

import NextImage from 'next/image';
import { RadioGroup, Radio, Flex, Button, Stack, Center, Image } from '@mantine/core';
import { Graph } from '../../components/Graph/Graph';
import oneF from '../../public/OneFinger.png';
import fiveF from '../../public/FiveFingers.png';

interface VotingProps {
  caption: string;
  index: number;
  infoM: string;
}

interface InfoProps {
  message: string;
}

export default function Voting({ ideas } : any) {
  const NUMCATS = 6; // 6 different categories that are voted on
  const TIMERLENGTH = 5; // 5 second timer for vote lock in countdown

  const form = useForm({ mode: 'uncontrolled' });
  const [currentIdeaIndex, setCurrentIdeaIndex] = useState(0);
  const [currentOptionIndex, setCurrentOptionIndex] = useState(-1);
  const [isVoted, setIsVoted] = useState(Array.from({ length: NUMCATS }, () => false));
  const [votes, setVotes] = useState(Array.from({ length: NUMCATS }, () => 0));
  const [timeRemaining, setTimeRemaining] = useState(0);

  const idea = ideas[currentIdeaIndex];

  // Progress to the next idea
  const goToNextIdea = () => {
    if (currentIdeaIndex < ideas.length - 1) {
      setCurrentIdeaIndex(currentIdeaIndex + 1);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (timeRemaining === 1) {
        const newIsVoted = [...isVoted];
        newIsVoted[currentOptionIndex] = true;
        setIsVoted(newIsVoted);
      }
      setTimeRemaining((prev) => prev - 1);
    }, 1000); // Decrement time remaining every second

    return () => clearInterval(intervalId);
  }, [timeRemaining]);

  // Here is where data will be sent through the sockets, it is called every time a radio
  // button on the voting screen is clicked. {index} refers to the index of the option. For
  // example {index}=0 refers to REASON TO BUY. {val} is the response value, 1-5. When user
  // authorization comes in we can also associate the user with this item, which should be
  // everything we need to have our database managed appropriately.
  const radioClick = (index : number, val : number) => {
    // If the timer is ongoing for a different option, prohibit any activity
    if (timeRemaining > 0 && index !== currentOptionIndex) return;
    if (!isVoted[index]) startStopTimer(index);
    updateVotes(index, val);
    // TODO: Implement socket for multi-user collaboration
  };

  // Updates votes according to the click
  const updateVotes = (index : number, val : number) => {
    const newVotes = [...votes];
    newVotes[index] = val;
    setVotes(newVotes);
  };

  // Starts or stops the timer for displaying vote results after entering/changing a vote
  const startStopTimer = (index : number) => {
    setTimeRemaining(TIMERLENGTH);
    setCurrentOptionIndex(index);
  };

  const handleSubmit = (values: typeof form.values) => {
    goToNextIdea();
    console.log(values);
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
                alt=""// Empty alt attribute for decorative images
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
            {isVoted[0]
            && <div><Graph key="0" graphTitle="" votes={[[1, 1], [2, 2], [3, 3], [4, 2], [5, 1]]} />
             <label className="reason-label">Reason:</label>
             <input type="text" className="reason-text" name="reason" />
               </div>}

            <Selection caption="Market Volume" index={1} infoM="Based on: Current market size and Expected growth. [HIGH is GOOD]" />
            {isVoted[1] && <div><Graph key="1" graphTitle="" votes={[[1, 1], [2, 2], [3, 3], [4, 2], [5, 1]]} />
            <label className="reason-label">Reason:</label>
            <input type="text" className="reason-text" name="reason" />
                           </div>}

            <Selection caption="Economic Viability" index={2} infoM="Based on: Margins (value vs. cost), Customers' ability to pay, and Customer stickiness? [HIGH is GOOD]" />
            {isVoted[2] && <div> <Graph key="2" graphTitle="" votes={[[1, 1], [2, 2], [3, 3], [4, 2], [5, 1]]} />
            <label className="reason-label">Reason:</label>
            <input type="text" className="reason-text" name="reason" />
                           </div>}

            <Selection caption="Obstacles to Implementation" index={3} infoM="Based on: Product development difficutlies' and Funding challenges [WANT LOW]" />
            {isVoted[3] && <div> <Graph key="3" graphTitle="" votes={[[1, 1], [2, 2], [3, 3], [4, 2], [5, 1]]} />
             <label className="reason-label">Reason:</label>
             <input type="text" className="reason-text" name="reason" />
                           </div>}

            <Selection caption="Time To Revenue" index={4} infoM="Based on: Development time, Time between product and market readiness, and Length of sale cycle (e.g. hospitals and schools take a long time) [WANT LOW]" />
            {isVoted[4] && <div><Graph key="4" graphTitle="" votes={[[1, 1], [2, 2], [3, 3], [4, 2], [5, 1]]} />
            <label className="reason-label">Reason:</label>
            <input type="text" className="reason-text" name="reason" />
                           </div>}

            <Selection caption="Economic Risks" index={5} infoM="Based on: Competitive threats, 3rd party dependencies, and Barriers to adoption. [WANT LOW]" />
            {isVoted[5] && <div><Graph key="5" graphTitle="" votes={[[1, 1], [2, 2], [3, 3], [4, 2], [5, 1]]} />
            <label className="reason-label">Reason:</label>
            <input type="text" className="reason-text" name="reason" />
                           </div>}
        </Stack>
        </Center>
            <Center>
                <Button className="Idea-button" type="submit">Submit</Button>
            </Center>
      </form>
    </>
  );
}
