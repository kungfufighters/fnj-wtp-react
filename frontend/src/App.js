import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <nav>
          <p><strong>Owner - Idea Submission</strong></p>
        </nav>
      </header>

      <form>
        <div className="Idea-vert">
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
          <div className="Idea-horz">
          <p>Image Upload (Optional) </p>
            <button
                    aria-label="add image"
                  >
                    {' '}
                    <img
                      src="https://img.icons8.com/upload.png"
                      alt="buttonpng"
                      border="0"
                    />
            </button>
          </div>
          <div className="Idea-horz">
          <p>Add a new idea</p>
            <button
                    aria-label="add idea"
                  >
                    {' '}
                    <img
                      src="https://img.icons8.com/plus.png"
                      alt="buttonpng"
                      border="0"
                    />
            </button>
          </div>
          <button className="Idea-button" type="submit">Submit Idea(s)</button>
        </div>
      </form>
    </div>
  );
}

export default App;
