'use client';

import '@mantine/core/styles.css';
import { useState } from 'react';
import { TextInput, Button, Container, Divider } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { HeaderSimple } from '@/components/Header/Header';

export default function HomePage() {
  const router = useRouter();
  const [sessionPin, setSessionPin] = useState('');

  // Function to check if user is authenticated
  const isAuthenticated = () => {
    // Check if token exists in localStorage or cookies
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('access_token')) return true;
      return false;
    }
    return false;
  };

  if (typeof window !== 'undefined' && !localStorage.getItem('accessToken')) {
    router.push('/login');
  }

  const handleEnterSession = () => {
    if (sessionPin) {
      if (isAuthenticated()) {
        // User is logged in, navigate to voting page
        router.push(`/voting/${sessionPin}`);
      } else {
        // User is not logged in, navigate to guest info page
        //  router.push(`/guest-info?sessionPin=${sessionPin}`);
        router.push(`/voting/${sessionPin}`);
      }
    } else {
      console.error('Session pin is required');
    }
  };

  const handleCreateSession = () => {
    // Handle create session logic here
    router.push('/create');
    console.log('Creating new session');
  };

  return (
    <div>
      <HeaderSimple glowIndex={0} />
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
