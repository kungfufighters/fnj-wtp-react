"use client";

import { TextInput, PasswordInput, Paper, Group, Button, Title, Container, Center } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // useRouter from Next.js

export default function Login() {
  const router = useRouter(); // Initialize the router for navigation
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters'),
    },
  });

  const handleSubmit = (values: { email: string; password: string }) => {
    console.log('Login details', values);
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log('Form Submitted', values);
      setLoading(false);
      // You would typically redirect or show a success message here
    }, 2000);
  };

  const handleSignupRedirect = () => {
    router.push('/signup'); // Redirect to signup page
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
              {loading ? 'Loggin in...' : 'Log in'}
            </Button>
            <Button variant="subtle" onClick={handleSignupRedirect}>Don't have an account? Sign Up</Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}
