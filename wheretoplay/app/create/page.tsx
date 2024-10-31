'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import IdeaSubmissionForm from './ideaSubmissionFormNEW';
import axios from 'axios';

function App() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  if (typeof window !== 'undefined' && !localStorage.getItem('accessToken')) {
    router.push('/login');
  }

  // Function to generate a unique 5-digit code
  const generateCode = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  // Function to handle form submission
  const handleFormSubmit = async (submittedIdeas: any, company: string) => {
    try {
      if (typeof window === 'undefined') return;
      const TOKEN = localStorage.getItem('accessToken');
  
      // Generate a unique code for the workspace
      const code = generateCode();
  
      const response = await axios.post(
        'http://localhost:8000/api/create_workspace/',
        { name: company, code }, // Include the code here
        {
          headers: {
            AUTHORIZATION: `Bearer ${TOKEN}`,
          },
        }
      );
  
      console.log('Workspace created:', response.data);
  

      // Prepare ideas to be associated with the created workspace
      const formattedIdeas = submittedIdeas.map((idea: any[]) => ({
        workspace: response.data.workspace_id,
        name: idea[0],
        customer_segment: idea[1],
        description: idea[2],
      }));

      // Send each idea in a separate request
      for (const idea of formattedIdeas) {
        const responseSub = await axios.post(
          'http://localhost:8000/api/create_opportunity/',
          idea,
          {
            headers: {
              AUTHORIZATION: `Bearer ${TOKEN}`,
            },
          }
        );
        console.log('Opportunity created:', responseSub.data);
      }
      
      router.push('/invite');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error creating workspace:', error.response?.data);
      } else {
        console.error('Unexpected error:', error);
      }
    }
  };

  return (
    <div className="App">
      {!submitted && <IdeaSubmissionForm onSubmit={handleFormSubmit} />}
      {submitted && <h1>Thank you for your submission!</h1>}
    </div>
  );
}

export default App;
