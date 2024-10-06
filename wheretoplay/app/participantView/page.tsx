"use client";

import React, { FC } from 'react';

import { useForm } from '@mantine/form';

import { RadioGroup, Radio, Flex, Group, Button, Stack, Center } from '@mantine/core';

export default function Demo() {
  const form = useForm({ mode: 'uncontrolled' });

  const handleSubmit = (values: typeof form.values) => {
    console.log(values);
  };

  const Selection: FC<Props> = ({caption}) => {
    return (
        <RadioGroup
        label={caption}
        description="Results will not be visible until you have voted"
        required
        >
            <Flex  gap="md">
                <Radio value="1" label="1" />
                <Radio value="2" label="2" />
                <Radio value="3" label="3" />
                <Radio value="4" label="4" />
                <Radio value="5" label="5" />
            </Flex>
        </RadioGroup>
    )
  }

  return (
    <>
      {/* Supply handle submit as a single argument to receive validated values */}
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Center>
        <Stack
            bg="var(--mantine-color-body)"
            align="stretch"
            justify="center"
            gap="md"
            >
            <Selection caption="Reason to Buy" />
            <Selection caption="Market Volume" />
            <Selection caption="Economic Viability" />
            <Selection caption="Obstacles to Implementation" />
            <Selection caption="Time To Revenue" />
            <Selection caption="Economic Risks" />
            <Group justify="space-between" mt="md">
                <Button type="submit">Finalize Votes</Button>
            </Group>
        </Stack>
        </Center>
       </form>
    </>
  );
}