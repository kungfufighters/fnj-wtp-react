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

// Function to handle form submission
const handleFormSubmit = async (submittedIdeas: any, company: string) => {
  try {
    if (typeof window === 'undefined') return;
    const TOKEN = localStorage.getItem('accessToken');
    const response = await axios.post('http://localhost:8000/api/create_workspace/', { name: company }, {
      headers: {
        AUTHORIZATION: `Bearer ${TOKEN}`,
      },
    });

    console.log('Workspace created:', response.data);

    const formattedIdeas = submittedIdeas.map((idea: any[]) => ({
      workspace: response.data.workspace_id,
      name: idea[0],
      customer_segment: idea[1],
      description: idea[2],
      // Remove status because Mark sauid it is unnecessary
      // status: (idea[3] === 'Pursue Now' ? 1 : (idea[3] === 'Keep Open' ? 2 : 3)),
  }));

  for (const idea of formattedIdeas) {
    const responseSub = await axios.post('http://localhost:8000/api/create_opportunity/', idea, {
      headers: {
        AUTHORIZATION: `Bearer ${TOKEN}`,
      },
    });

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
      {!submitted && (
        <IdeaSubmissionForm onSubmit={handleFormSubmit} />
      )}
      {submitted && <h1>Thank you for your submission!</h1>}
    </div>
  );
}

export default App;
