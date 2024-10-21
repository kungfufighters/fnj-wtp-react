'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation.js';
import IdeaSubmissionForm from './ideaSubmissionFormNEW.js';

// import ResultsPage from './ResultsPage';

function App() {
  const router = useRouter();
  // State to track if the owner has submitted ideas
  const [submitted, setSubmitted] = useState(false);

  // State to store the submitted ideas
  //const [ideas, setIdeas] = useState([]);

  // Function to handle form submission
  const handleFormSubmit = (submittedIdeas : any) => {
    //setIdeas(submittedIdeas); // Save submitted ideas
    console.log(submittedIdeas);
    router.push('/invite');
    setSubmitted(true); // Switch to results page
  };

  return (
    <div className="App">
      {!submitted && (
        <IdeaSubmissionForm onSubmit={handleFormSubmit} />
      )}
    </div>
  );

  /* Old versiont that had idea submission form go right to results
  return (
    <div className="App">
      {!submitted ? (
        // Show IdeaSubmissionForm when not submitted
        <IdeaSubmissionForm onSubmit={handleFormSubmit} />
      ) : (
        // Show ResultsPage when submitted, passing the ideas
        <ResultsPage ideas={ideas} />
      )}
    </div>
  );
  */
}

export default App;
