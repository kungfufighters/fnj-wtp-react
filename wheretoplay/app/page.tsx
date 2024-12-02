'use client';

import { useState } from 'react';
import { 
  TextInput, 
  Button, 
  Container, 
  Divider, 
  Image, 
  Title, 
  Text, 
  Paper, 
  Stack, 
  Group, 
  Box 
} from '@mantine/core';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [sessionPin, setSessionPin] = useState('');

  // Function to check if user is authenticated
  const isAuthenticated = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken') !== null;
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
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '90vh', padding: '3rem 0' }}>
      <Container size="sm">
        {/* Logo Section */}
        <Image
          src="/wtp-nobg.png"
          alt="Logo"
          style={{
            maxWidth: '450px',
            margin: '2rem auto',
            display: 'block',
          }}
        />

        {/* Title and Description */}
        <Box mt="lg" mb="xl" style={{ textAlign: 'center' }}>
          <Title order={1} style={{ color: '#495057', fontWeight: '700' }}>
            Welcome to Where-to-Play!
          </Title>
          <Text size="lg" color="dimmed" mt="sm">
            Join a session by entering a session pin, or create a new workspace to get started.
          </Text>
        </Box>

        {/* Input Section */}
        <Paper withBorder shadow="lg" radius="md" p="xl">
          <Stack spacing="lg">
            <TextInput
              label="Session Pin"
              placeholder="Enter session pin"
              value={sessionPin}
              onChange={(event) => setSessionPin(event.currentTarget.value)}
              required
              size="md"
              styles={{
                label: { fontSize: '1rem', fontWeight: 600, color: '#495057' },
                input: { fontSize: '1rem' },
              }}
            />

            <Button
              onClick={handleEnterSession}
              fullWidth
              size="lg"
              style={{ backgroundColor: '#E88C43', color: '#fff', fontWeight: 600 }}
            >
              Join Session
            </Button>

            <Divider label="or" labelPosition="center" color="gray" />

            <Button
              onClick={handleCreateSession}
              fullWidth
              size="lg"
              variant="outline"
              style={{
                color: '#E88C43',
                borderColor: '#E88C43',
                fontWeight: 600,
              }}
            >
              Create a Workspace
            </Button>
          </Stack>
        </Paper>

        {/* Footer Section */}
        {/* <Group position="center" mt="xl">
          <Text size="sm" color="dimmed">
            Need help? <a href="/support" style={{ color: '#E88C43', fontWeight: 500 }}>Contact Support</a>
          </Text>
        </Group> */}
      </Container>
    </div>
  );
}
