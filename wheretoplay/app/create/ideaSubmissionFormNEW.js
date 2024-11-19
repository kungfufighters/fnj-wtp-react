import './Idea.css'

import React, { useState } from "react"
import { RadioGroup, Radio, Collapse, Flex, Center, Button } from '@mantine/core';
import axios from "axios";

const IdeaSubmissionForm = ({ onSubmit }) => {
  const [ideas, setIdeas] = useState([["", "", "", null]])
  const [company, setCompany] = useState("")
  const [thresholdSensitivity, setThresholdSensitivity] = useState("Standard")
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)

  function changeCompany(e) {
    setCompany(e.target.value)
  }

  function addIdea(e) {
    setIdeas([...ideas, ["", "", "", null]])
  }

  function removeIdea(e) {
    let newIdeas = [...ideas]
    newIdeas.pop()
    setIdeas(newIdeas)
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(ideas, company, thresholdSensitivity);  // Pass submitted ideas to the parent (App.js)
  };

  function IdeaForm({i, name, seg, desc, stat, source}) {
    i = parseInt(i)
    const [idea, setIdea] = useState(name)
    const [segment, setSegment] = useState(seg)
    const [description, setDescription] = useState(desc)
    const [status, setStatus] = useState(stat)
    const [img, setImg] = useState(source)


    function changeIdea(e) {
      setIdea(e.target.value)
      let newIdeas = ideas
      newIdeas[i][0] = e.target.value
      setIdeas(newIdeas)
    }


    function changeSegment(e) {
      setSegment(e.target.value)
      let newIdeas = ideas
      newIdeas[i][1] = e.target.value
      setIdeas(newIdeas)
    }


    function changeDescription(e) {

      setDescription(e.target.value)
      let newIdeas = ideas
      newIdeas[i][2] = e.target.value
      setIdeas(newIdeas)
    }


   /**
    * function changeStatus(e) {

      setStatus(e.target.value)
      let newIdeas = ideas
      newIdeas[i][3] = e.target.value
      setIdeas(newIdeas)
    }
    **/

    function changeImage(e, i) {
          const file = e.target.files[0];
          if (!file) return;
          setImg(URL.createObjectURL(file));
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", "where_to_play_preset");

          axios
            .post("https://api.cloudinary.com/v1_1/dfijf9w4l/image/upload", formData)
            .then((response) => {
              const imageUrl = response.data.secure_url;
              let newIdeas = [...ideas];
              newIdeas[i][3] = imageUrl;
              setIdeas(newIdeas);
            })
            .catch((error) => {
              console.error("Error uploading to Cloudinary:", error);
            });
    }


    // Code for the current status dropdown that we decided to remove
    /*
    <div className="Idea-vert Idea-vert-item">
                <label className="Idea-label" htmlFor="statusL">Current Status</label>
                <select className="Idea-text" name="status" value={status} onChange={changeStatus}>
                    <option value="pursueNow">Pursue Now</option>
                    <option value="keepOpen">Keep Open</option>
                    <option value="shelve">Shelve</option>
                </select>
            </div>
    */

    return (
        <>
            <div className="Idea-vert Idea-vert-item">
                <label className="Idea-label" htmlFor="idea">Product/Service</label>
                <input type="text" className="Idea-text" name="idea" id="idea" value={idea} onChange={changeIdea}/>
            </div>
            <div className="Idea-vert Idea-vert-item">
                <label className="Idea-label" htmlFor="segment">Customer Segment</label>
                <input type="text" className="Idea-text" name="segment" id="segment" value={segment} onChange={changeSegment}/>
            </div>
            <div className="Idea-vert Idea-vert-item">
                <label className="Idea-label" htmlFor="description">Description</label>
                <textarea className="Idea-text" name="description" id="description" value={description}
                          onChange={changeDescription}></textarea>
            </div>
            <div className="Idea-vert">
                <label htmlFor={"files" + i} className="Idea-button Idea-vert-item">Select Image</label>
                <input id={"files" + i}
                       className="Hide Idea-vert-item"
                       type="file"
                       aria-label="add image"
                       onChange={(e) => changeImage(e, i)}
                >
                </input>
            </div>
            {img && <img alt={"idea " + i + " logo"} className="Idea-vert-item Square" src={img}/>}
        </>
    )
  }

    return (
        <div className="Idea">
            <form onSubmit={handleSubmit}>
                <div className="Idea-vert">
                  <div className="Idea-vert Idea-vert-item">
                    <label className="Idea-label" htmlFor="company">Company Name</label>
                    <input type="text" className="Idea-text" name="company" id="company" value={company} onChange={changeCompany} />
                  </div>
          {ideas.map((idea, i) => (
            <div key={i}>
              <IdeaForm i={i} name={ideas[i][0]} seg={ideas[i][1]} desc={ideas[i][2]} source={ideas[i][3]}/>
            </div>
          ))}
          <Center>
              <button className="Idea-button" type="button" onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}>{showAdvancedSettings ? "Close" : "Open"} Advanced Settings</button>
          </Center>
          <Collapse in={showAdvancedSettings}>
            <RadioGroup
                value={thresholdSensitivity}
                label={"Choose outlier sensitivity"}
                description={"More sensitive means it is more easier to be an outlier"}
                required
              >
              <Center>
                <Flex gap="md">
                  <Radio label="Sensitive" value="Sensitive" onClick={() => setThresholdSensitivity("Sensitive")} color="grape" />
                  <Radio label="Standard" value="Standard" onClick={() => setThresholdSensitivity("Standard")} color="grape" />
                  <Radio label="Insensitive" value="Insensitive" onClick={() => setThresholdSensitivity("Insensitive")} color="grape" />
                </Flex>
              </Center>
            </RadioGroup>
          </Collapse>
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
