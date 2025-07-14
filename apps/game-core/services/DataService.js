/**
 * DataService provides a centralized interface for all game scenes to log
 * events and manage player session data with the backend.
 * This version is specifically tailored for the existing Flask backend.
 */
export default class DataService {
  constructor(apiBaseUrl, getAuthToken) {
    if (!apiBaseUrl) throw new Error("DataService: apiBaseUrl is required.");
    if (typeof getAuthToken !== 'function') throw new Error("DataService: getAuthToken must be a function.");
    
    this.API_BASE_URL = apiBaseUrl;
    this.getAuthToken = getAuthToken;
  }

  async #post(endpoint, body) {
    const token = await this.getAuthToken();
    if (!token) throw new Error("Authentication token not available.");

    const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 
        // Explicitly set the Content-Type header
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      // The body is already stringified before being passed here
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // Try to get more detailed error message from the backend
      const errorData = await response.json().catch(() => ({ error: `Request failed with status: ${response.status}` }));
      console.error('API Error Response:', errorData);
      throw new Error(`API Error: ${errorData.error || response.statusText}`);
    }
    return response.json();
  }

  /**
   * Calls the backend to create a new game session.
   * @returns {Promise<object>} The new session object from the backend.
   */
  async startNewSession() {
    console.log("DataService: Requesting new game session from backend...");
    // The endpoint path is '/game/session/start'
    return this.#post('/game/session/start', {}); // No body needed for this request
  }
  
  /**
   * Logs a code submission attempt.
   * This function now formats the data keys to snake_case for the Flask backend.
   */
  async logCodeAttempt(attemptData) {
    console.log("DataService: Preparing to log code attempt...", attemptData);

    // --- KEY FIX IS HERE ---
    // Create a new object with Python-style snake_case keys
    // to match the Flask backend's expectations.
    const payload = {
      sessionId: attemptData.sessionId,       // Matches data.get('sessionId')
      challengeId: attemptData.challengeId,   // Matches data.get('challengeId')
      submittedCode: attemptData.submittedCode, // Matches data.get('submittedCode')
      isCorrect: attemptData.isCorrect,       // Matches data.get('isCorrect')
      errors: attemptData.errors            // Matches data.get('errors')
    };
    
    // The endpoint is now '/api/game/attempt' as defined in your game.py
    return this.#post('/game/attempt', payload);
  }


  /**
   * (NEWLY ADDED)
   * Logs a generic game event for micro-interactions.
   * @param {object} eventData - The data for the event to be logged.
   * @returns {Promise<object>} The response from the backend.
   */
  async logEvent(eventData) {
    console.log("DataService: Logging generic event...", eventData);
    // This will send the data from PlayScene's `logMicroInteraction` function.
    // The endpoint is assumed to be '/game/event'. You must create this route in your backend.
    return this.#post('/game/event', eventData);
  }




}

