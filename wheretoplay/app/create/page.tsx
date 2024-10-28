'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import IdeaSubmissionForm from './ideaSubmissionFormNEW';
import axios from 'axios';


function App() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

// Function to handle form submission
const handleFormSubmit = async (submittedIdeas: any) => {

  const formattedIdeas = submittedIdeas.map((idea: any[]) => ({
        name: idea[0],
        customer_segment: idea[1],
        description: idea[2],
        status: (idea[3] === 'Pursue Now' ? 1 : (idea[3] === 'Keep Open' ? 2 : 3)),
    }));
try {
    // Assuming you want to submit each idea individually
    for (const idea of formattedIdeas) {
      const response = await axios.post('http://localhost:8000/api/create_opportunity/', idea, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Opportunity created:', response.data);
    }

    router.push('/invite');
    setSubmitted(true); // Switch to results page
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error creating opportunity:', error.response?.data);
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
