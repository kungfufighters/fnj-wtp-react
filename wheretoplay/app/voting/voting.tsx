'use client';

import React, { useState } from 'react';

import { useForm } from '@mantine/form';

import './Idea.css';

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
  const NUMCATS = 6;
  const form = useForm({ mode: 'uncontrolled' });
  const [currentIdeaIndex, setCurrentIdeaIndex] = useState(0);
  const [isVoteArray, setIsVoteArray] = useState(Array.from({ length: NUMCATS }, () => true));
  const [votes, setVotes] = useState(Array.from({ length: NUMCATS }, () => 0));

  const idea = ideas[currentIdeaIndex];

  const timeIDS : NodeJS.Timeout[] = Array.from({ length: NUMCATS }, () => setTimeout(() => {}, 1));

  // Progress to the next idea
  const goToNextIdea = () => {
    if (currentIdeaIndex < ideas.length - 1) {
      setCurrentIdeaIndex(currentIdeaIndex + 1);
    }
  };

  const radioClick = (index : number, val : number) => {
    startStopTimer(index);
    updateVotes(index, val);
  };

  // Updates votes according to the click
  const updateVotes = (index : number, val : number) => {
    const newVotes = [...votes];
    newVotes[index] = val;
    setVotes(newVotes);
  };

  // Starts or stops the timer for displaying vote results after entering/changing a vote
  const startStopTimer = (index : number) => {
    clearTimeout(timeIDS[index]);
    timeIDS[index] = setTimeout(() => {
      const newIsVoteArray = [...isVoteArray];
      newIsVoteArray[index] = false;
      setIsVoteArray(newIsVoteArray);
    }, 5000);
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
          <InfoButton message={infoM} />
          <RadioGroup
            value={votes[index].toString()}
            label={caption}
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
            {!isVoteArray[0]
            && <div><Graph key="0" graphTitle="" votes={[[1, 1], [2, 2], [3, 3], [4, 2], [5, 1]]} />
             <label className="reason-label">Reason:</label>
             <input type="text" className="reason-text" name="reason" />
               </div>}

            <Selection caption="Market Volume" index={1} infoM="Based on: Current market size and Expected growth. [HIGH is GOOD]" />
            {!isVoteArray[1] && <div><Graph key="1" graphTitle="" votes={[[1, 1], [2, 2], [3, 3], [4, 2], [5, 1]]} />
            <label className="reason-label">Reason:</label>
            <input type="text" className="reason-text" name="reason" />
                                </div>}

            <Selection caption="Economic Viability" index={2} infoM="Based on: Margins (value vs. cost), Customers' ability to pay, and Customer stickiness? [HIGH is GOOD]" />
            {!isVoteArray[2] && <div> <Graph key="2" graphTitle="" votes={[[1, 1], [2, 2], [3, 3], [4, 2], [5, 1]]} />
            <label className="reason-label">Reason:</label>
            <input type="text" className="reason-text" name="reason" />
                                </div>}

            <Selection caption="Obstacles to Implementation" index={3} infoM="Based on: Product development difficutlies' and Funding challenges [WANT LOW]" />
            {!isVoteArray[3] && <div> <Graph key="3" graphTitle="" votes={[[1, 1], [2, 2], [3, 3], [4, 2], [5, 1]]} />
             <label className="reason-label">Reason:</label>
             <input type="text" className="reason-text" name="reason" />
                                </div>}

            <Selection caption="Time To Revenue" index={4} infoM="Based on: Development time, Time between product and market readiness, and Length of sale cycle (e.g. hospitals and schools take a long time) [WANT LOW]" />
            {!isVoteArray[4] && <div><Graph key="4" graphTitle="" votes={[[1, 1], [2, 2], [3, 3], [4, 2], [5, 1]]} />
            <label className="reason-label">Reason:</label>
            <input type="text" className="reason-text" name="reason" />
                                </div>}

            <Selection caption="Economic Risks" index={5} infoM="Based on: Competitive threats, 3rd party dependencies, and Barriers to adoption. [WANT LOW]" />
            {!isVoteArray[5] && <div><Graph key="5" graphTitle="" votes={[[1, 1], [2, 2], [3, 3], [4, 2], [5, 1]]} />
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
