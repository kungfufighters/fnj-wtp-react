'use client';

import '@mantine/core/styles.css';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HeaderSimple } from '@/components/Header/Header';
import { Container, TextInput, Button } from '@mantine/core';

export default function GuestInfoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionPin = searchParams.get('sessionPin');

  const [guestInfo, setGuestInfo] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  // Check if user is logged in or sessionPin is missing
  useEffect(() => {
    const isAuthenticated = () => {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('accessToken') !== null;
      }
      return false;
    };

    if (isAuthenticated()) {
      // Redirect logged-in users
      router.push('/');
    } else if (!sessionPin) {
      // Redirect if sessionPin is missing
      router.push('/');
    }
  }, [router, sessionPin]);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setGuestInfo({ ...guestInfo, [field]: event.currentTarget.value });
  };

  const handleSubmit = async () => {
    // Send guest info to the backend
    try {
      const response = await fetch('/api/guests/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guestInfo),
      });
      const data = await response.json();
      if (response.ok) {
        // Store guest identifier (e.g., guest ID) in localStorage
        localStorage.setItem('guest_id', data.guest_id);
        // Navigate to voting session
        router.push(`/voting/${sessionPin}`);
      } else {
        console.error('Error submitting guest info:', data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <HeaderSimple glowIndex={0} />
      <Container size="sm" style={{ marginTop: '2rem' }}>
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
          style={{ marginTop: '1rem' }}
        />
        <TextInput
          label="Email"
          placeholder="Enter your email"
          value={guestInfo.email}
          onChange={handleInputChange('email')}
          required
          style={{ marginTop: '1rem' }}
        />
        <Button onClick={handleSubmit} fullWidth style={{ marginTop: '1.5rem' }}>
          Continue to Voting Session
        </Button>
      </Container>
    </div>
  );
}
