'use client';

import '@mantine/core/styles.css';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  TextInput,
  Button,
  Container,
  Paper,
  Group,
  Title,
  Divider,
  Text,
} from '@mantine/core';

export default function GuestJoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionPinFromParams = searchParams.get('sessionPin');
  const [sessionPin, setSessionPin] = useState('');
  
  useEffect(() => {
    const pin = sessionPinFromParams || localStorage.getItem('sessionPin');
    setSessionPin(pin);
  }, [sessionPinFromParams]);

  const [guestInfo, setGuestInfo] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  const handleInputChange = (field) => (event) => {
    setGuestInfo({ ...guestInfo, [field]: event.target.value });
  };

  const handleGuestSubmit = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/guests/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...guestInfo, sessionPin }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('guest_id', data.guest_id);
        router.push(`/voting/${sessionPin}`);
      } else {
        alert(data.error || 'Failed to join the session. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const redirectToLogin = () => {
    localStorage.setItem(
      'redirectNotification',
      JSON.stringify({
        title: 'Redirected to Login',
        message: 'Log in to access the voting session.',
        color: 'blue',
      })
    );
    router.push(`/login?redirect=/voting/${sessionPin}`);
  };

  const redirectToSignup = () => {
    localStorage.setItem(
      'redirectNotification',
      JSON.stringify({
        title: 'Redirected to Sign Up',
        message: 'Create an account to access the voting session.',
        color: 'blue',
      })
    );
    router.push(`/signup?redirect=/voting/${sessionPin}`);
  };

  return (
    <Container size="sm" style={{ marginTop: '2rem' }}>
      <Paper withBorder shadow="md" p="xl" radius="md">
        <Title align="center" order={2} mb="lg">
          Join Voting Session
        </Title>
        <Text align="center" size="sm" color="dimmed" mb="xl">
          Enter your details to continue as a guest or log in if you already
          have an account.
        </Text>
        <form onSubmit={(e) => e.preventDefault()}>
          <TextInput
            label="First Name"
            placeholder="Enter your first name"
            value={guestInfo.first_name}
            onChange={handleInputChange('first_name')}
            required
          />
          <TextInput
            label="Last Name"
            placeholder="Enter your last name"
            value={guestInfo.last_name}
            onChange={handleInputChange('last_name')}
            required
            mt="md"
          />
          <TextInput
            label="Email"
            placeholder="Enter your email"
            value={guestInfo.email}
            onChange={handleInputChange('email')}
            required
            mt="md"
          />
          <Button
            onClick={handleGuestSubmit}
            fullWidth
            mt="xl"
            variant="gradient"
            gradient={{ from: 'teal', to: 'blue', deg: 60 }}
          >
            Continue as Guest
          </Button>
        </form>
        <Divider my="lg" label="OR" labelPosition="center" />
        <Group grow>
          <Button variant="default" onClick={redirectToLogin}>
            Log In
          </Button>
          <Button onClick={redirectToSignup}>Sign Up</Button>
        </Group>
      </Paper>
    </Container>
  );
}
