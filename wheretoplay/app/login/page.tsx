// app/login/page.tsx or pages/login.tsx
"use client"; // Only for app directory to handle client-side logic
import { TextInput, PasswordInput, Paper, Group, Button, Title, Container } from '@mantine/core';
import { useForm } from '@mantine/form';

export default function Login() {
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
    // Perform login operation (API call)
  };

  return (
    <Container size={420} my={40}>
      <Title style={{ textAlign: 'center' }}>Login</Title>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
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
            <Button type="submit">Login</Button>
        </Group>
        </form>
      </Paper>
    </Container>
  );
}