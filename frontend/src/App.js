import './App.css'

import React, { useState } from "react"

function App() {
  const [file, setFile] = useState()
  const [ideas, setIdeas] = useState(1)

  function addImage(e) {
    setFile(URL.createObjectURL(e.target.files[0]))
  }

  function addIdea(e) {
    setIdeas(ideas + 1)
  }

  function IdeaForm(key) {
    return (
      <>
        <div className="Idea-vert Idea-vert-item">
            <label className="Idea-label" name="ideaL">Idea Name</label>
            <input className="Idea-text" name="idea" />
        </div>
        <div className="Idea-vert Idea-vert-item">
          <label className="Idea-label" name="statusL">Current Status</label>
          <select className="Idea-text" name="status">
            <option value="pursueNow">Pursue Now</option>
            <option value="keepOpen">Keep Open</option>
            <option value="shelve">Shelve</option>
          </select>
        </div>
        <label htmlFor="files" className="Idea-button Idea-vert-item-small">Select Image</label>
        <input id="files"
                className="Hide"
                type="file"
                aria-label="add image"
                onChange={addImage}
              >
        </input>
        {file && <img alt="idea logo" className="Idea-vert-item-small" src={file} />}
      </>
    )
  }

  return (
    <div className="App">
      <header className="App-header">
        <nav>
          <p><strong>Owner - Idea Submission</strong></p>
        </nav>
      </header>

      <form>
        <div className="Idea-vert">
        {[...Array(ideas)].map((_, i) =>
            <div key={i}>
              <IdeaForm key={i}/>
            </div>
        )}
        {ideas < 10 && <button htmlFor="ideas" className="Idea-button Idea-vert-item-small" onClick={addIdea} type="button">
          Add Idea
        </button>}
        <button className="Idea-button Idea-vert-item-small" type="submit">Submit Idea(s)</button>
        </div>
      </form>
    </div>
  );
}

export default App;
