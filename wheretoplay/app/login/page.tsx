"use client";

import {
  TextInput,
  PasswordInput,
  Paper,
  Group,
  Button,
  Title,
  Container,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : 'Invalid email',
      password: (value) =>
        value.length >= 6 ? null : 'Password must be at least 6 characters',
    },
  });

  // New login logic to handle API call to the Django backend
  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        // Store tokens in localStorage
        localStorage.setItem('accessToken', data.tokens.access);
        localStorage.setItem('refreshToken', data.tokens.refresh);

        // Redirect to the participant view
        router.push('/participantView');
      } else {
        console.error('Login failed:', data.error);
      }
    } catch (err) {
      console.error('Error during login:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupRedirect = () => {
    router.push('/signup');
  };

  return (
    <Container
      size="xs"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Title style={{ textAlign: 'center' }}>Login</Title>
          <TextInput
            label="Email"
            placeholder="your@email.com"
            {...form.getInputProps('email')}
            required
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            {...form.getInputProps('password')}
            required
            mt="md"
          />
          <Group justify="space-between" mt="md">
            <Button type="submit" loading={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </Button>
            <Button variant="subtle" onClick={handleSignupRedirect}>
              Don't have an account? Sign Up
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}
