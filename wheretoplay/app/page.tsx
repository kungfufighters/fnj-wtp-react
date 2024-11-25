'use client';

import '@mantine/core/styles.css';
import { useState } from 'react';
import { TextInput, Button, Container, Divider, Image } from '@mantine/core';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [sessionPin, setSessionPin] = useState('');

  // Function to check if user is authenticated
  const isAuthenticated = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token') !== null;
    }
    return false;
  };

  const handleEnterSession = () => {
    if (sessionPin) {
      if (isAuthenticated()) {
        // User is logged in, navigate to voting session
        router.push(`/voting/${sessionPin}`);
      } else {
        // User is not logged in, navigate to guest join page
        router.push(`/guestjoin?sessionPin=${sessionPin}`);
      }
    } else {
      console.error('Session pin is required');
    }
  };

  const handleCreateSession = () => {
    router.push('/create');
    console.log('Creating new session');
  };

  return (
    <div>
      <Container
        size="sm"
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <div style={{ width: '100%', textAlign: 'center' }}>
          {/* Add the logo */}
          <Image
            src="/wtp.png"
            alt="Logo"
            width="auto" // Adjust the width as needed
            height="auto" // Adjust the height as needed
            style={{ margin: '0 auto', marginBottom: '2rem' }} // Center the image and add spacing
          />
          <TextInput
            label="Session Pin"
            placeholder="Enter session pin"
            value={sessionPin}
            onChange={(event) => setSessionPin(event.currentTarget.value)}
            required
          />
          <Button onClick={handleEnterSession} fullWidth style={{ marginTop: '1rem' }}>
            Enter
          </Button>
          <Divider my="lg" label="or" labelPosition="center" />
          <Button onClick={handleCreateSession} fullWidth variant="outline">
            Create a Workspace
          </Button>
        </div>
      </Container>
    </div>
  );
}
