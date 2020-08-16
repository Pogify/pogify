import React from 'react';
import {Link} from 'react-router-dom'
import styled from 'styled-components'

const Button = styled.button`
    border: 1px solid black;
    padding: 10px 30px;
    border-radius: 25px;
    font-size: 1.3rem;
    cursor: pointer;
    margin: 5px;
    transition: background-color 0.5s, color 0.5s;
    :hover {
        background-color: black;
        color: white;
    } 
`;

class Home extends React.Component {
    
    render() {
        return (
        <div style={{height: '100vh', width: '100vw', display: "flex", justifyContent: "center", alignItems: "center", backgroundImage: "linear-gradient(to right, #7f53ac 0, #657ced 100%)"}}>
            <div style={{background: 'white', color: "black", mixBlendMode: "screen", padding: '2rem', borderRadius: '12.5px', boxShadow: '10px 5px 5px black'}}>
                <h1 style={{textAlign: 'center', fontSize: '5em', letterSpacing: '7px', margin: 0, fontWeight: 'bold'}}>POGIFY</h1>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <Link to="/session/">
                        <Button>I am a viewer</Button>
                    </Link>
                    <Link to="/create">
                        <Button style={{marignLeft: '10px'}}>I am a streamer</Button>
                    </Link>
                </div>
                
            </div>
        </div>
        )
    }
}

export default Home;