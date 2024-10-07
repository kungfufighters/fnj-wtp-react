'use client';

import React, { useState } from 'react';

import { useForm } from '@mantine/form';

import './Idea.css';

import NextImage from 'next/image';
import { RadioGroup, Radio, Flex, Button, Stack, Center, Image } from '@mantine/core';

import oneF from '../../public/OneFinger.png';
import fiveF from '../../public/FiveFingers.png';

interface GreetingProps {
  caption: string;
}

export default function Voting({ ideas }) {
  const form = useForm({ mode: 'uncontrolled' });
  const [currentIdeaIndex, setCurrentIdeaIndex] = useState(0);

  const idea = ideas[currentIdeaIndex];

  const goToNextIdea = () => {
    if (currentIdeaIndex < ideas.length - 1) {
      setCurrentIdeaIndex(currentIdeaIndex + 1);
    }
  };

  const handleSubmit = (values: typeof form.values) => {
    goToNextIdea();
    console.log(values);
  };

  const Selection: React.FC<GreetingProps> = ({ caption }) => (
        <Center>
          <RadioGroup
            label={caption}
            description="Results will not be visible until you have voted"
            bg="rgba(0, 0, 0, .3)"
            required
          >
              <Flex gap="md">
                  <Image alt="One finger" component={NextImage} src={oneF} h={35} />
                  <Radio value="1" color="grape" />
                  <Radio value="2" color="grape" />
                  <Radio value="3" color="grape" />
                  <Radio value="4" color="grape" />
                  <Radio value="5" color="grape" />
                  <Image alt="Five fingers" component={NextImage} src={fiveF} h={35} />
              </Flex>
          </RadioGroup>
        </Center>
    );

  return (
    <>
        <h2 style={{ textAlign: 'center' }}>
            Idea #{currentIdeaIndex + 1}: {idea[0]}
        </h2>

        {idea[2] && (
        <div style={{ textAlign: 'center' }}>
            <img
              src={idea[2]}
              alt=""// Empty alt attribute for decorative images
              style={{ width: '300px', marginBottom: '20px' }}
            />
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
            <Selection caption="Reason to Buy" />
            <Selection caption="Market Volume" />
            <Selection caption="Economic Viability" />
            <Selection caption="Obstacles to Implementation" />
            <Selection caption="Time To Revenue" />
            <Selection caption="Economic Risks" />
        </Stack>
        </Center>
            <Center>
                <Button className="Idea-button" type="submit">Submit</Button>
            </Center>
      </form>
    </>
  );
}
