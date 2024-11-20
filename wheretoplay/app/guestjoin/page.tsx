'use client';

import '@mantine/core/styles.css';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TextInput, Button, Container } from '@mantine/core';

export default function GuestJoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionPin = searchParams.get('sessionPin'); // Extract session pin from query parameters

  const [guestInfo, setGuestInfo] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  const handleInputChange = (field) => (event) => {
    setGuestInfo({ ...guestInfo, [field]: event.target.value });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/guests/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ ...guestInfo, sessionPin }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('guest_id', data.guest_id);
        router.push(`/voting/${sessionPin}`);
      } else {
        alert(data.error || 'Failed to join the session. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };


  return (
    <div>
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
