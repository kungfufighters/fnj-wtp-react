'use client';

import React, { useState } from 'react';
import {
  Button,
  Container,
  Group,
  Textarea,
  Title,
  Paper,
  Image,
  Text,
  rem,
  Accordion,
  NumberInput,
} from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconUpload, IconPhoto, IconX } from '@tabler/icons-react';
import axios from 'axios';

interface Idea {
  name: string;
  segment: string;
  description: string;
  media: string | null;
}

interface IdeaFormProps {
  index: number;
  idea: Idea;
  updateIdea: (index: number, updatedIdea: Idea) => void;
}

interface IdeaSubmissionFormProps {
  onSubmit: (
    ideas: Idea[],
    company: string,
    guestCap: number | null,
    madThreshold: number | null
  ) => void;
}

const IdeaForm: React.FC<IdeaFormProps> = ({ index, idea, updateIdea }) => {
  const handleMediaUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'where_to_play_preset');

    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dfijf9w4l/image/upload',
        formData
      );
      const mediaUrl = response.data.secure_url;
      updateIdea(index, { ...idea, media: mediaUrl });
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
    }
  };

  return (
    <Paper withBorder shadow="sm" p="md" radius="md" mt="lg">
      <div style={{ marginBottom: '1rem' }}>
        <Textarea
          label="Product/Service"
          placeholder="Enter the name of the idea"
          value={idea.name}
          autosize
          minRows={2}
          onChange={(e) => updateIdea(index, { ...idea, name: e.target.value })}
          required
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <Textarea
          label="Customer Segment"
          placeholder="Enter the customer segment"
          value={idea.segment}
          autosize
          minRows={2}
          onChange={(e) => updateIdea(index, { ...idea, segment: e.target.value })}
          required
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <Textarea
          label="Description"
          placeholder="Enter the description"
          value={idea.description}
          autosize
          minRows={3}
          onChange={(e) => updateIdea(index, { ...idea, description: e.target.value })}
          required
        />
      </div>
      <Dropzone
        onDrop={(files) => handleMediaUpload(files[0])}
        onReject={(files) => console.log('rejected files', files)}
        maxSize={5 * 1024 ** 2}
        accept={IMAGE_MIME_TYPE}
      >
        <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
          <Dropzone.Accept>
            <IconUpload
              style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-blue-6)' }}
              stroke={1.5}
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX
              style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-red-6)' }}
              stroke={1.5}
            />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconPhoto
              style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-dimmed)' }}
              stroke={1.5}
            />
          </Dropzone.Idle>

          <div>
            <Text size="xl" inline>
              Drag image here or click to select a file
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              File should not exceed 5mb
            </Text>
          </div>
        </Group>
      </Dropzone>
      {idea.media && (
        <div style={{ marginTop: '1rem' }}>
          <Image
            src={idea.media}
            alt={`Uploaded media for idea ${index + 1}`}
            radius="md"
          />
        </div>
      )}
    </Paper>
  );
};

const IdeaSubmissionForm: React.FC<IdeaSubmissionFormProps> = ({ onSubmit }) => {
  const [ideas, setIdeas] = useState<Idea[]>([{ name: '', segment: '', description: '', media: null }]);
  const [company, setCompany] = useState('');
  const [guestCap, setGuestCap] = useState<number | null>(null);
  const [madThreshold, setMadThreshold] = useState<number | null>(null);

  const addIdea = () => {
    setIdeas([...ideas, { name: '', segment: '', description: '', media: null }]);
  };

  const removeIdea = () => {
    setIdeas(ideas.slice(0, -1));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(ideas, company, guestCap, madThreshold);
  };

  const updateIdea = (index: number, updatedIdea: Idea) => {
    const updatedIdeas = [...ideas];
    updatedIdeas[index] = updatedIdea;
    setIdeas(updatedIdeas);
  };

  return (
    <Container size="sm">
      <Title style={{ textAlign: 'center' }} mt="xl">
        Validate a Startup
      </Title>
      <form onSubmit={handleSubmit}>
        <Paper withBorder shadow="md" p="md" radius="md" mt="lg">
          <div style={{ marginBottom: '1rem' }}>
            <Textarea
              label="Company Name"
              placeholder="Enter your company name"
              value={company}
              autosize
              minRows={2}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
          </div>
        </Paper>
        {ideas.map((idea, index) => (
          <IdeaForm key={index} index={index} idea={idea} updateIdea={updateIdea} />
        ))}
        <Group justify="space-between" mt="lg">
          {ideas.length < 10 && (
            <Button onClick={addIdea} variant="outline">
              Add Idea
            </Button>
          )}
          {ideas.length > 1 && (
            <Button onClick={removeIdea} color="red" variant="outline">
              Remove Idea
            </Button>
          )}
        </Group>
        <Accordion mt="lg">
          <Accordion.Item value="advanced">
            <Accordion.Control>Advanced Options</Accordion.Control>
            <Accordion.Panel>
              <NumberInput
                label="Guest Cap"
                placeholder="Maximum number of guests"
                value={guestCap}
                onChange={setGuestCap}
                min={1}
              />
              <NumberInput
                label="MAD Threshold"
                placeholder="Set MAD outlier threshold"
                value={madThreshold}
                onChange={setMadThreshold}
                min={0}
                step={0.1}
              />
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
        <Group align="center" mt="xl">
          <Button type="submit">Submit Idea(s)</Button>
        </Group>
      </form>
    </Container>
  );
};

export default IdeaSubmissionForm;
