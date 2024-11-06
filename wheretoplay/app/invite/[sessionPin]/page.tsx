"use client";

import '@mantine/core/styles.css';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { HeaderSimple } from '@/components/Header/Header';
import { Container, TextInput, Button } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { QRCodeCanvas } from 'qrcode.react';

type WorkspaceData = {
  name: string;
  url_link: string;
};

export default function InvitePage() {
  const pathname = usePathname();
  const sessionPin = pathname.split('/').pop(); // Extract sessionPin from the URL path
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData>({ name: '', url_link: '' });
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!sessionPin) return;

    const fetchWorkspaceData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/query/workspace_by_code/?code=${sessionPin}`, {
          headers: {
            'Content-Type': 'application/json'
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch workspace data');
        }

        const data = await response.json();
        setWorkspaceData(data); // Set workspace data from the response

      } catch (error: any) {
        console.error('Error:', error);
        showNotification({
          title: 'Error',
          message: 'Workspace data was not fetched correctly. ' + (error.message || 'An unknown error occurred.'),
          color: 'red',
        });
      }
    };

    fetchWorkspaceData();
  }, [sessionPin]);

  const handleSendEmail = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/send_invite_email/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: email,
          session_pin: sessionPin,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        showNotification({
          title: 'Success',
          message: 'Invite email sent successfully',
          color: 'green',
        });
      } else {
        showNotification({
          title: 'Error',
          message: data.error,
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <HeaderSimple />
      <Container size="sm" style={{ marginTop: '2rem' }}>
        <h1>Invite Collaborators</h1>
        <p>Workspace: {workspaceData.name || 'N/A'}</p>
        
        {/* Display Invite Link */}
        <p>Invite Link:</p>
        <a href={workspaceData.url_link || '#'}>{workspaceData.url_link || 'N/A'}</a>

        {/* Display QR Code */}
        {workspaceData.url_link && (
          <div style={{ marginTop: '1rem' }}>
            <p>Scan the QR code to join:</p>
            <QRCodeCanvas value={workspaceData.url_link} />
          </div>
        )}

        {/* Email Invitation */}
        <TextInput
          label="Send Invite via Email"
          placeholder="Enter email address"
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
          style={{ marginTop: '1rem' }}
        />
        <Button onClick={handleSendEmail} style={{ marginTop: '1rem' }}>
          Send Invite
        </Button>
      </Container>
    </div>
  );
}
