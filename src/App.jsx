import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'


function App() {
  const [count, setCount] = useState(0)
  const [data, setData] = useState(null);
  const Names = ["Alyson Dayan", "Omri Ben Gigi", "Or Shemesh", "Gal Shemesh", "Matan Yaakov Zeharia"];
  const rolesArray = [["Team", "Product Owner","Scrum master"],["Team","QA"],["Team","UI/UX","DBA"],["Team","Team Lead","Technical writer"],["Team", "system Architect", "DevOps"]];

  useEffect(() => {
    fetch('http://localhost:8081/ambient-invisible-intelligence/objects', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // This is the header your Java server is demanding:
        'API-Version': '1.3' 
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(json => setData(json))
    .catch(err => console.error("Error fetching data:", err));
  }, []);

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div >{data ? (<ul>
          {Array.isArray(data) ? data.map((item, index) => (
            <li key={index}>
              <div className="card">
                <h3>{item.alias} <small>({item.type})</small></h3>
                <p><strong>Status:</strong> {item.status} | <strong>Active:</strong> {item.active ? 'Yes' : 'No'}</p>
                <div className="card-details">
                  <p><strong>System ID:</strong> {item.id.systemID}</p>
                  <p><strong>Location:</strong> {item.location ? Object.values(item.location).join(', ') : 'null'}</p>
                </div>
              </div>
            </li>
          )) : <li>
              <div className="card">
                <h3>{data.alias} <small>({data.type})</small></h3>
                <p><strong>Status:</strong> {data.status} | <strong>Active:</strong> {data.active ? 'Yes' : 'No'}</p>
                <div className="card-details">
                  <p><strong>System ID:</strong> {data.id.systemID}</p>
                  <p><strong>Location:</strong> {data.location ? data.location.join(', ') : 'null'}</p>
                </div>
              </div>
            </li>}
        </ul>) : ("Loading...")}</div>
        
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Who We Are</h2>
          <ul>
            {Names.map((name, index) => (
              <li key={index}>
                <strong>{name}</strong>
                <div>
                  {rolesArray[index].map((role, roleIndex) => (
                    <p key={roleIndex}>{role}</p>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
