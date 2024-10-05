import React, { useEffect, useState } from 'react';

function App() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        const apiUrl = process.env.REACT_APP_API_URL;  // Use the env variable
        console.log('API URL:', apiUrl);  // Log it to check if it's loaded correctly

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => setMessage(data.message))
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
                setMessage('Failed to fetch data from the backend');
            });
    }, []);

    return (
        <div>
            <h1>{message}</h1>
        </div>
    );
}

export default App;
