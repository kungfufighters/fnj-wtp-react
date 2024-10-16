'use client';

import React, { useState } from 'react';
import IdeaSubmissionForm from '../ideaSubmission/ideaSubmissionFormNEW.js';
import Voting from './participant';

function App() {
  // State to track if the owner has submitted ideas
  const [submitted, setSubmitted] = useState(false);

  // State to store the submitted ideas
  const [ideas, setIdeas] = useState([]);

  // Function to handle form submission
  const handleFormSubmit = (submittedIdeas) => {
    setIdeas(submittedIdeas); // Save submitted ideas
    setSubmitted(true); // Switch to results page
  };

  return (
    <div className="App">
      {!submitted ? (
        // Show IdeaSubmissionForm when not submitted
        <IdeaSubmissionForm onSubmit={handleFormSubmit} />
      ) : (
        // Show ResultsPage when submitted, passing the ideas
        <Voting ideas={ideas} />
      )}
    </div>
  );
}

export default App;
