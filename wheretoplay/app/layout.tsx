import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dropzone/styles.css';

import React from 'react';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { theme } from '../theme';
import { Notifications } from '@mantine/notifications';
import { HeaderMenu } from '../components/Header/HeaderMenu';

export const metadata = {
  title: 'Where-to-Play',
  description: 'FundNJ- Where-to-Play application',
};

export default function RootLayout({ children }: { children: any }) {
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
          {/* Add the HeaderMenu here */}
          <HeaderMenu />

          {/* Main application content */}
          {children}

          {/* Notifications component */}
          <Notifications position="bottom-left" />
        </MantineProvider>
      </body>
    </html>
  );
}
