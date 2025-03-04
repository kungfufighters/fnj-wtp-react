'use client';

import {
    TextInput,
    Paper,
    Button,
    Title,
    Container,
  } from '@mantine/core';
  import { useForm } from '@mantine/form';
  import { useState } from 'react';
  import axios from 'axios';
import { showNotification } from '@mantine/notifications';

export default function Forgot() {
    const [loading, setLoading] = useState<boolean>(false);
    const form = useForm({
        initialValues: {
          email: '',
        },
      });

    const sendResetPasswordEmail = async (values: { email: string }) => {
        setLoading(true);
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/send_reset_email/`, {
                email: values.email,
            });

            if (response.status === 200) {
                form.reset();
                showNotification({
                    title: 'Success!',
                    message: 'Check your email for a reset password link',
                    color: 'green',
                })
            }
        } catch (err : any) {
            if (err.response && err.response.data && err.response.data.error)
                showNotification({
                    title: 'Error',
                    message: err.response.data.error,
                    color: 'red',
                })
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
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
                <form onSubmit={form.onSubmit((values) => sendResetPasswordEmail(values))}>
                <Title style={{ textAlign: 'center' }}>Reset Password</Title>
                <TextInput
                  label="Email"
                  placeholder="your@email.com"
                  {...form.getInputProps('email')}
                  required
                />
                    <Button type="submit" loading={loading} mt="md">
                    {loading ? 'Sending Email...' : 'Send Email'}
                    </Button>
                </form>
            </Paper>
            </Container>
        </>
      );
}
