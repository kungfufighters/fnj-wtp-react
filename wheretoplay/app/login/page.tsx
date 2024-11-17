"use client";

import {
  TextInput,
  PasswordInput,
  Paper,
  Group,
  Button,
  Title,
  Container,
  Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);  // Used to block initial render
  const [loginLoading, setLoginLoading] = useState(false);
  const [isAlreadyLoggedIn, setIsAlreadyLoggedIn] = useState(false); // New state to handle message display

  // Redirect if the user is already logged in
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      setIsAlreadyLoggedIn(true); // Show redirecting message
      setTimeout(() => {
        router.push('/');
      }, 500);
    } else {
      setIsLoading(false);  // Allow rendering of the login form if not logged in
    }
  }, [router]);

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

  // Login logic to handle API call to the Django backend
  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoginLoading(true);
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

        // Redirect to the dashboard
        router.push('/');
      } else {
        console.error('Login failed:', data.error);
      }
    } catch (err) {
      console.error('Error during login:', err);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignupRedirect = () => {
    router.push('/signup');
  };

  // Display a "redirecting" message if already logged in
  if (isAlreadyLoggedIn) {
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
        <Text>You are already logged in, redirecting...</Text>
      </Container>
    );
  }

  // Show the login form if the user is not logged in and loading has completed
  if (isLoading) {
    return null;
  }

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
            <Button type="submit" loading={loginLoading} mt="md">
              {loginLoading ? 'Logging in...' : 'Log in'}
            </Button>
          <Group justify="space-between" mt="md">
            <Button variant="subtle" onClick={handleSignupRedirect}>
              Don't have an account?
            </Button>
            <Button variant="subtle" onClick={() => router.push('/forgotPassword')}>
              Forgot Password?
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}
