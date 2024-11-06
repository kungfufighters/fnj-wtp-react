'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import IdeaSubmissionForm from './ideaSubmissionFormNEW';
import axios from 'axios';

function CreateWorkspace() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  if (typeof window !== 'undefined' && !localStorage.getItem('accessToken')) {
    router.push('/login');
  }

  const handleFormSubmit = async (submittedIdeas: any, company: string) => {
    try {
      if (typeof window === 'undefined') return;
      const TOKEN = localStorage.getItem('accessToken');
  
      const workspaceResponse = await axios.post(
        'http://localhost:8000/api/create_workspace/',
        { name: company },
        {
          headers: {
            AUTHORIZATION: `Bearer ${TOKEN}`,
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
          'http://localhost:8000/api/create_opportunity/',
          idea,
          {
            headers: {
              AUTHORIZATION: `Bearer ${TOKEN}`,
            },
          }
        );
        console.log('Opportunity created:', opportunityResponse.data);
      }
  
      // Redirect to the invite page with the sessionPin
      router.push(`/invite/${sessionPin}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error creating workspace:', error.response?.data);
      } else {
        console.error('Unexpected error:', error);
      }
    }
  };

  return (
    <div className="CreateWorkspace">
      {!submitted && <IdeaSubmissionForm onSubmit={handleFormSubmit} />}
      {submitted && <h1>Thank you for your submission!</h1>}
    </div>
  );
}

export default CreateWorkspace;
