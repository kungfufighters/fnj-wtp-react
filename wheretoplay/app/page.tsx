'use client';

import '@mantine/core/styles.css';

import { useState } from 'react';
import { TextInput, Button, Container, Divider } from '@mantine/core';
import { useRouter } from 'next/navigation'; // useRouter from Next.js
import { HeaderSimple } from '@/components/Header/Header';

export default function HomePage() {
  const router = useRouter();
  const [sessionPin, setSessionPin] = useState('');

  const handleEnterSession = () => {
    // Handle session enter logic here
    router.push('/voting');
    console.log('Entered session pin:', sessionPin);
  };

  const handleCreateSession = () => {
    // Handle create session logic here
    router.push('/create');
    console.log('Creating new session');
  };

  return (
    <div>
      <HeaderSimple/>
    <Container size="sm" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: '100%' }}>
        {/* Session Pin Input */}
        <TextInput
          label="Session Pin"
          placeholder="Enter session pin"
          value={sessionPin}
          onChange={(event) => setSessionPin(event.currentTarget.value)}
          required
        />

        {/* Enter Button */}
        <Button
          onClick={handleEnterSession}
          fullWidth
          style={{ marginTop: '1rem' }}
        >
          Enter
        </Button>

        {/* Divider */}
        <Divider my="lg" label="or" labelPosition="center" />

        {/* Create Session Button */}
        <Button
          onClick={handleCreateSession}
          fullWidth
          variant="outline"
        >
          Create Session
        </Button>
      </div>
    </Container>
    </div>
  );
}