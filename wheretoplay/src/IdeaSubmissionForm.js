import './Idea.css'

import React, { useState } from "react"

const IdeaSubmissionForm = ({ onSubmit }) => {
  const [ideas, setIdeas] = useState([["", "Pursue Now", null]])

  function addIdea(e) {
    setIdeas([...ideas, ["", "Pursue Now", null]])
  }

  function removeIdea(e) {
    let newIdeas = [...ideas]
    newIdeas.pop()
    setIdeas(newIdeas)
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(ideas);  // Pass submitted ideas to the parent (App.js)
  };

  function IdeaForm({i, name, stat, source}) {
    i = parseInt(i)
    const [idea, setIdea] = useState(name)
    const [status, setStatus] = useState(stat)
    const [img, setImg] = useState(source)


    function changeIdea(e) {
      setIdea(e.target.value)
      let newIdeas = ideas
      newIdeas[i][0] = e.target.value
      setIdeas(newIdeas)
    }

    function changeStatus(e) {
      setStatus(e.target.value)
      let newIdeas = ideas
      newIdeas[i][1] = e.target.value
      setIdeas(newIdeas)
    }

    function changeImage(e) {
      const file = e.target.files[0]
      setImg(URL.createObjectURL(file))
      let newIdeas = ideas
      newIdeas[i][2] = URL.createObjectURL(file)
      setIdeas(newIdeas)
    }

    return (
      <>
        <div className="Idea-vert Idea-vert-item">
            <label className="Idea-label" name="ideaL" >Idea Name</label>
            <input type="text" className="Idea-text" name="idea" value={idea} onChange={changeIdea}/>
        </div>
        <div className="Idea-vert Idea-vert-item">
          <label className="Idea-label" name="statusL">Current Status</label>
          <select className="Idea-text" name="status" value={status} onChange={changeStatus}>
            <option value="pursueNow">Pursue Now</option>
            <option value="keepOpen">Keep Open</option>
            <option value="shelve">Shelve</option>
          </select>
        </div>
        <div className="Idea-vert">
          <label htmlFor={"files" + i} className="Idea-button Idea-vert-item">Select Image</label>
          <input id={"files" + i}
                  className="Hide Idea-vert-item"
                  type="file"
                  aria-label="add image"
                  onChange={changeImage}
                >
          </input>
        </div>
        {img && <img alt={"idea " + i + " logo"} className="Idea-vert-item Square" src={img} />}
      </>
    )
  }

  return (
    <div className="Idea">
      <header className="Idea-header">
        <nav>
          <p><strong>Owner - Idea Submission</strong></p>
        </nav>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="Idea-vert">
          {ideas.map((idea, i) => (
            <div key={i}>
              <IdeaForm i={i} name={ideas[i][0]} stat={ideas[i][1]} source={ideas[i][2]}/>
            </div>
          ))}
          {ideas.length <= 10 && <button htmlFor="ideasAdd" className="Idea-button Idea-vert-item" onClick={addIdea} type="button">
            Add Idea
          </button>}
          {ideas.length > 1 && <button htmlFor="ideasSub" className="Idea-button Idea-vert-item" onClick={removeIdea} type="button">
            Remove Idea
          </button>}
          <button className="Idea-button Idea-vert-item" type="submit">Submit Idea(s)</button>
        </div>
      </form>
    </div>
  );
}

export default IdeaSubmissionForm;
