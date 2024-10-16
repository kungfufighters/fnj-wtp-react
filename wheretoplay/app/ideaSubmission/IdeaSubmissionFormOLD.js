import React, { useState } from 'react';

const IdeaSubmissionForm = ({ onSubmit }) => {
  const [ideas, setIdeas] = useState([
    { ideaName: '', status: 'pursue', image: null },
  ]);

  const handleChange = (index, event) => {
    const newIdeas = [...ideas];
    const { name, value, files } = event.target;

    if (name === 'image') {
      newIdeas[index][name] = files[0];  // Save the uploaded image as a file
    } else {
      newIdeas[index][name] = value;
    }

    setIdeas(newIdeas);
  };

  // Function to add a new form (capped at 10 ideas)
  const addIdeaForm = () => {
    if (ideas.length < 10) {
      setIdeas([...ideas, { ideaName: '', status: 'pursue', image: null }]);
    }
  };

  // Function to remove the last idea form
  const removeLastIdeaForm = () => {
    if (ideas.length > 1) {
      const newIdeas = ideas.slice(0, ideas.length - 1);
      setIdeas(newIdeas);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(ideas);  // Pass submitted ideas to the parent (App.js)
  };

  return (
    <div>
      <h1>Idea Submission</h1>
      <form onSubmit={handleSubmit}>
        {ideas.map((idea, index) => (
          <div key={index} style={{ marginBottom: '20px' }}>
            <h3>Idea {index + 1}</h3>
            <label>
              Idea Name: 
              <input
                type="text"
                name="ideaName"
                value={idea.ideaName}
                onChange={(e) => handleChange(index, e)}
                required
              />
            </label>
            <br />
            <label>
              Current Status:
              <select
                name="status"
                value={idea.status}
                onChange={(e) => handleChange(index, e)}
              >
                <option value="pursue">Pursue</option>
                <option value="shelf">Shelf</option>
                <option value="check">Check On</option>
              </select>
            </label>
            <br />
            <label>
              Image Upload (optional):
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={(e) => handleChange(index, e)}
              />
            </label>
          </div>
        ))}

        {/* Add Idea button, only shown if fewer than 10 ideas */}
        {ideas.length < 10 && (
          <button type="button" onClick={addIdeaForm}>
            Add Idea
          </button>
        )}

        {/* Remove last Idea button */}
        {ideas.length > 1 && (
          <button type="button" onClick={removeLastIdeaForm} style={{ marginLeft: '10px' }}>
            Remove Last Idea
          </button>
        )}

        <br />
        <button type="submit">Submit Ideas</button>
      </form>
    </div>
  );
};

export default IdeaSubmissionForm;
