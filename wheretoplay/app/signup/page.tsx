"use client";

import { useState, useEffect } from 'react';
import { TextInput, PasswordInput, Button, Paper, Group, Stack, Title, Container, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Signup() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAlreadyLoggedIn, setIsAlreadyLoggedIn] = useState(false); // New state for redirect message
    const router = useRouter();

    const form = useForm({
        initialValues: {
            email: '',
            password: '',
            confirmPassword: '',
        },

        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
            password: (value) =>
                value.length >= 6 ? null : 'Password must be at least 6 characters long',
            confirmPassword: (value, values) =>
                value === values.password ? null : 'Passwords do not match',
        },
    });

    // Redirect if the user is already logged in
    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            setIsAlreadyLoggedIn(true); // Show redirecting message
            setTimeout(() => {
                router.push('/dashboard');
            }, 1000); // 1-second delay before redirecting
        }
    }, [router]);

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('http://localhost:8000/api/signup/', {
                email: values.email,
                password: values.password,
                password2: values.confirmPassword,
                username: values.email,
            });

            if (response.status === 201) {
                // Save JWT to localStorage
                const { access, refresh } = response.data.tokens;
                localStorage.setItem('accessToken', access);
                localStorage.setItem('refreshToken', refresh);

                // Redirect to dashboard
                router.push('/dashboard');
            }
        } catch (error) {
            console.error(error);
            if (axios.isAxiosError(error) && error.response) {
                setError(error.response.data.message || 'Something went wrong');
            } else {
                setError('An error occurred during registration');
            }
        } finally {
            setLoading(false);
        }
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
            <Paper withBorder shadow="md" p={30} radius="md" style={{ width: '100%', maxWidth: 400 }}>
                <Title align="center" order={2}>
                    Sign Up
                </Title>

                <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
                    <Stack spacing="md">
                        <TextInput
                            label="Email"
                            placeholder="you@example.com"
                            withAsterisk
                            {...form.getInputProps('email')}
                        />

                        <PasswordInput
                            label="Password"
                            placeholder="Your password"
                            withAsterisk
                            {...form.getInputProps('password')}
                        />

                        <PasswordInput
                            label="Confirm Password"
                            placeholder="Confirm your password"
                            withAsterisk
                            {...form.getInputProps('confirmPassword')}
                        />

                        {error && <p style={{ color: 'red' }}>{error}</p>}

                        <Group justify="space-between" mt="md">
                            <Button type="submit" loading={loading}>
                                {loading ? 'Signing Up...' : 'Sign Up'}
                            </Button>

                            <Button variant="subtle" onClick={() => router.push('/login')}>
                                Have an account? Log in
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Paper>
        </Container>
    );
}
