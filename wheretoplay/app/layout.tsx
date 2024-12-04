import '@mantine/notifications/styles.css';
import '@mantine/core/styles.css';
import '@mantine/core/styles/UnstyledButton.css';
import '@mantine/dropzone/styles.css';
import '@mantine/core/styles/Button.css';
import '@mantine/core/styles/VisuallyHidden.css';
import '@mantine/core/styles/Notification.css';

import React from 'react';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { theme } from '../theme';
import { Notifications } from '@mantine/notifications';
import HeaderWrapper from '../components/HeaderWrapper/HeaderWrapper'; // Client-side wrapper for HeaderMenu

export const metadata = {
  title: 'Where-to-Play',
  description: 'FundNJ- Where-to-Play application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>
          {/* Pass Header logic to a client component */}
          <HeaderWrapper />
          {children}
          <Notifications position="bottom-left" />
        </MantineProvider>
      </body>
    </html>
  );
}
