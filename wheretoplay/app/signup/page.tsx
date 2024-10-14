'use client';

import { useState } from 'react';
import { TextInput, PasswordInput, Button, Paper, Group, Stack, Title, Container } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation

export default function Signup() {
    const [loading, setLoading] = useState(false);
    const router = useRouter(); // Initialize router

    // Mantine's form hook to handle form validation and state
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

    // Simulate form submission
    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            console.log('Form Submitted', values);
            setLoading(false);
            // You would typically redirect or show a success message here
        }, 2000);
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

                        {/* Group with buttons aligned left and right */}
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
