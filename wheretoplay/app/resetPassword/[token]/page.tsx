'use client';

import { Stack, PasswordInput, Button, Center } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { showNotification } from '@mantine/notifications';

const ResetPassword = ({ params } : any ) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const router = useRouter();

    const form = useForm({
        initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: '',
        },

        validate: {
            newPassword: (value) =>
                value.length >= 6 ? null : 'Password must be at least 6 characters long',
            confirmNewPassword: (value, values) =>
                value === values.newPassword ? null : 'Passwords do not match',
        },
    });

    const updatePassword = async (values: { newPassword: string, confirmNewPassword: string }) => {
        setLoading(true);
        try {
            const tok = (await params).token;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reset_password/`, {
                newPassword: values.newPassword,
                confirmNewPassword: values.confirmNewPassword,
                token: tok,
            });

            if (response.status === 200) {
                form.reset();
                showNotification({
                    title: 'Success',
                    message: 'Password reset. Hang tight...',
                    color: 'green',
                });
                await new Promise(resolve => { setTimeout(resolve, 2000); });
                router.push('/login');
            }
        } catch (err : any) {
            if (err.response && err.response.data && err.response.data.error)
                showNotification({
                    title: 'Error',
                    message: err.response.data.error,
                    color: 'red',
                });
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const changePasswordForm = () =>
        <form onSubmit={form.onSubmit((values) => updatePassword(values))}>
            <Center>
                <Stack style={{ width: '350px' }} mt="md">
                    <PasswordInput
                      label="New Password"
                      placeholder="Your new password"
                      withAsterisk
                      {...form.getInputProps('newPassword')}
                            />
                    <PasswordInput
                      label="Password"
                      placeholder="Confirm your new password"
                      withAsterisk
                      {...form.getInputProps('confirmNewPassword')}
                            />
                    {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
                    <Button type="submit" loading={loading}>
                        {loading ? 'Changing Password...' : 'Change Password'}
                    </Button>
                </Stack>
            </Center>
        </form>;

    return (
        <>
            {changePasswordForm()}
        </>
    );
};

export default ResetPassword;
