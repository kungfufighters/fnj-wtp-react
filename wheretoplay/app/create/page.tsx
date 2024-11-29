'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import IdeaSubmissionForm from './ideaSubmissionFormNEW';
import { HeaderSimple } from '@/components/Header/Header';

function CreateWorkspace() {
  const router = useRouter();
  const [submitted] = useState(false);

  if (typeof window !== 'undefined' && !localStorage.getItem('accessToken')) {
    router.push('/login');
  }

  const handleFormSubmit = async (submittedIdeas: any, company: string,
    thresholdSensitivity: string) => {
    const TOKEN = localStorage.getItem('accessToken');
    const RefreshToken = localStorage.getItem('refreshToken'); //Get Refresh Token
    let threshold = 2;

    if (thresholdSensitivity !== 'Standard') threshold = (thresholdSensitivity === 'Sensitive') ? 1 : 3;

    //Try Using Access Token
    try {
      const workspaceResponse = await axios.post(
        'https://wheretoplay-6af95d3b28f7.herokuapp.com/api/create_workspace/',
        { name: company, outlier_threshold: threshold },

        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );

      console.log('Workspace created:', workspaceResponse.data);

      // Prepare ideas to be associated with the created workspace
      const formattedIdeas = submittedIdeas.map((idea: any[]) => ({
        workspace: workspaceResponse.data.workspace_id,
        name: idea[0],
        customer_segment: idea[1],
        description: idea[2],
        image: idea[3],
      }));

      // Get the sessionPin from workspaceResponse
      const sessionPin = workspaceResponse.data.code;

      // Send each idea in a separate request
      for (const idea of formattedIdeas) {
        const opportunityResponse = await axios.post(
          'https://wheretoplay-6af95d3b28f7.herokuapp.com/api/create_opportunity/',
          idea,
          {
            headers: {
              Authorization: `Bearer ${TOKEN}`,
            },
          }
        );
        console.log('Opportunity created:', opportunityResponse.data);
      }

      // Redirect to the invite page with the sessionPin
      router.push(`/invite/${sessionPin}`);
    } catch (error) {
      // Check 401 unauthorized and RefreshToken existence
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.status === 401 &&
        RefreshToken
      ) {
        console.log('Access token expired. Attempting to refresh.');

        //Refresh Token and Try again
        try {
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
        } catch (refreshError) {
          if (axios.isAxiosError(refreshError)) {
            console.error(
              'Failed to refresh token:',
              refreshError.response?.data || refreshError.message
            );

            if (refreshError.response && refreshError.response.status === 401) {
              console.log('Refresh token expired. Redirecting to login.');
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              router.push('/login');
            }
          } else {
            console.error('An unexpected error occurred:', refreshError);
          }
        }
      } else {
        const axiosError = error as AxiosError;
        console.error(
          'Error creating opportunity, Refresh Token might be missing:',
          axiosError.response?.data || axiosError.message
        );
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        router.push('/login');
      }
    }
  };

  return (
    <div className="CreateWorkspace">
      <HeaderSimple glowIndex={2}/>
      {!submitted && <IdeaSubmissionForm onSubmit={handleFormSubmit} />}
      {submitted && <h1>Thank you for your submission!</h1>}
    </div>
  );
}

export default CreateWorkspace;
