"use client";

import { useState } from 'react';
import { TextInput, PasswordInput, Button, Paper, Group, Stack, Title, Container } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import axios from 'axios';

export default function Signup() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null); // To handle errors
    const router = useRouter(); // Initialize router

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

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('http://localhost:8000/api/signup/', {
                email: values.email,
                password: values.password,
                password2: values.confirmPassword, // Send confirm password field as well
                username: values.email, // Assuming username is the same as email in the backend
            });

            if (response.status === 201) {
                // Save JWT to localStorage
                const { access, refresh } = response.data.tokens;
                localStorage.setItem('accessToken', access);
                localStorage.setItem('refreshToken', refresh);

                // Redirect to dashboard or login page
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

                        {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}

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
