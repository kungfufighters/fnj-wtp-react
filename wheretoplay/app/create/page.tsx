'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import IdeaSubmissionForm from './ideaSubmissionForm';
import { showNotification } from '@mantine/notifications';

function CreateWorkspace() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      // Save notification details in localStorage
      localStorage.setItem(
        'redirectNotification',
        JSON.stringify({
          title: 'Unauthorized',
          message: 'You need to log in to create a workspace.',
          color: 'red',
        })
      );
      router.push('/login');
    } else {
      setIsAuthorized(true);
    }
    setIsLoading(false);
  }, [router]);

  const handleFormSubmit = async (
    submittedIdeas: any[],
    company: string,
    guestCap: number | null,
    madThreshold: number | null
  ) => {
    const TOKEN = localStorage.getItem('accessToken');
    const RefreshToken = localStorage.getItem('refreshToken');
    const threshold = madThreshold || 2; // Default threshold if not provided

    try {
      // Step 1: Create Workspace
      const workspaceResponse = await axios.post(
<<<<<<< HEAD
        'https://wheretoplay-6af95d3b28f7.herokuapp.com/api/create_workspace/',
        { name: company, outlier_threshold: threshold },

=======
        'http://localhost:8000/api/create_workspace/',
        {
          name: company,
          outlier_threshold: threshold,
          guest_cap: guestCap || 0, // Default guest cap to 0 if null
        },
>>>>>>> f643c3a (Added refresh session pin)
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );

      console.log('Workspace created:', workspaceResponse.data);
      const workspaceId = workspaceResponse.data.workspace_id;
      const sessionPin = workspaceResponse.data.code;

      // Step 2: Prepare and Create Opportunities
      const formattedIdeas = submittedIdeas.map((idea: any) => ({
        workspace: workspaceId,
        name: idea.name,
        customer_segment: idea.segment,
        description: idea.description,
        image: idea.media || null, // Optional image field
      }));

      console.log('Submitting opportunities:', formattedIdeas);

      for (const idea of formattedIdeas) {
<<<<<<< HEAD
        const opportunityResponse = await axios.post(
          'https://wheretoplay-6af95d3b28f7.herokuapp.com/api/create_opportunity/',
=======
        await axios.post(
          'http://localhost:8000/api/create_opportunity/',
>>>>>>> f643c3a (Added refresh session pin)
          idea,
          {
            headers: {
              Authorization: `Bearer ${TOKEN}`,
            },
          }
        );
        console.log('Opportunity created:', idea);
      }

      // Step 3: Redirect to the Invite Page
      console.log('All opportunities submitted successfully.');
      router.push(`/invite/${sessionPin}`);
    } catch (error) {
      console.error('Error during form submission:', error);

      // Step 4: Handle Token Refresh if Necessary
      if (axios.isAxiosError(error) && error.response?.status === 401 && RefreshToken) {
        console.log('Access token expired. Attempting to refresh.');

        try {
<<<<<<< HEAD
          const refreshResponse = await axios.post('https://wheretoplay-6af95d3b28f7.herokuapp.com/api/token/refresh/', {
            refresh: RefreshToken,
          });

          const newAccessToken = refreshResponse.data.access;
          localStorage.setItem('accessToken', newAccessToken);
          console.log('Access token refreshed successfully.');

          const retryResponse = await axios.post(
            'https://wheretoplay-6af95d3b28f7.herokuapp.com/api/create_workspace/',
            { name: company },
            {
              headers: {
                Authorization: `Bearer ${newAccessToken}`,
              },
            }
          );

          console.log('Workspace created on retry:', retryResponse.data);

          // Prepare ideas to be associated with the created workspace
          const formattedIdeas = submittedIdeas.map((idea: any[]) => ({
            workspace: retryResponse.data.workspace_id,
            name: idea[0],
            customer_segment: idea[1],
            description: idea[2],
            image: idea[3],
          }));

          // Get the sessionPin from workspaceResponse
          const sessionPin = retryResponse.data.code;

          // Send each idea in a separate request
          for (const idea of formattedIdeas) {
            const opportunityResponse = await axios.post(
              'https://wheretoplay-6af95d3b28f7.herokuapp.com/api/create_opportunity/',
              idea,
              {
                headers: {
                  Authorization: `Bearer ${newAccessToken}`,
                },
              }
            );
            console.log('Opportunity created:', opportunityResponse.data);
          }
          router.push(`/invite/${sessionPin}`);
=======
          // Refresh Token
          const refreshResponse = await axios.post(
            'http://localhost:8000/api/token/refresh/',
            { refresh: RefreshToken }
          );
          const newAccessToken = refreshResponse.data.access;
          localStorage.setItem('accessToken', newAccessToken);

          console.log('Access token refreshed. Retrying submission.');

          // Retry Workspace Creation
          return handleFormSubmit(submittedIdeas, company, guestCap, madThreshold);
>>>>>>> f643c3a (Added refresh session pin)
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          router.push('/login');
        }
      } else {
        console.error('Unexpected error:', error);
        showNotification({
          title: 'Submission Failed',
          message: 'Failed to submit ideas. Please check your input and try again.',
          color: 'red',
        });
      }
    }
  };

  // Prevent rendering the page until authorization is checked
  if (isLoading) {
    return null;
  }

  return isAuthorized ? (
    <div className="CreateWorkspace">
      <IdeaSubmissionForm onSubmit={handleFormSubmit} />
    </div>
  ) : null;
}

export default CreateWorkspace;
