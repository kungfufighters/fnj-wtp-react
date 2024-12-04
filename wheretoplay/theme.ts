'use client';

import { createTheme } from '@mantine/core';

export const theme = createTheme({
  colors: {
    // Custom colors with shades for Mantine components
    brandRed: ['#fff5f5', '#ffe3e3', '#ffc9c9', '#ffa8a8', '#ff8787', '#ff6b6b', '#fa5252', '#f03e3e', '#e03131', '#C0504D'],
    brandGreen: ['#fff9ec', '#ffeccc', '#ffdca2', '#ffcc73', '#feb249', '#fd9e34', '#f38c00', '#e87d00', '#c06a00', '#E88C43'],
    brandOrange: ['#fff4e6', '#ffe8cc', '#ffd8a8', '#ffc078', '#ffa94d', '#ff922b', '#f08c00', '#e68100', '#d27000', '#E88C43'],
  },
  primaryColor: 'brandGreen', // Set the default primary color
  primaryShade: 5, // Select shade for components like buttons and text

  fontFamily: 'Roboto, sans-serif', // A modern, clean font
  headings: { fontFamily: 'Roboto, sans-serif' }, // Consistent font for headings

  globalStyles: (theme) => ({
    body: {
      backgroundColor: theme.colors.gray[0], // Light gray for a clean background
      color: theme.colors.dark[9], // Dark text for readability
    },
  }),
});
