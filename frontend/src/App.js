import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;
console.log(API_URL)
function HomePage() {
    return (
        <div>
            <h1>Home Page</h1>
            <nav>
                <Link to="/tree">Tree Algorithm</Link> | 
                <Link to="/2dgraph">2D Graph Algorithm</Link> | 
                <Link to="/linkedlist">Linked List Algorithm</Link>
            </nav>
        </div>
    );
}

function TreePage() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch(`${API_URL}/api/tree`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => setMessage(data.message))
            .catch(error => console.error('Error fetching tree data:', error));
    }, []);
    

    return <h1>{message}</h1>;
}

function GraphPage() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch(`${API_URL}/api/2dgraph`)
            .then(response => response.json())
            .then(data => setMessage(data.message));
    }, []);

    return <h1>{message}</h1>;
}

function LinkedListPage() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch(`${API_URL}/api/linkedlist`)
            .then(response => response.json())
            .then(data => setMessage(data.message));
    }, []);

    return <h1>{message}</h1>;
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/tree" element={<TreePage />} />
                <Route path="/2dgraph" element={<GraphPage />} />
                <Route path="/linkedlist" element={<LinkedListPage />} />
            </Routes>
        </Router>
    );
}

export default App;
