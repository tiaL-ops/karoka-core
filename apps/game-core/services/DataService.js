// karoka-core/apps/game-core/services/DataService.js

/**
 * DataService provides a centralized interface for all game scenes to log
 * events and manage player session data with the backend.
 */
export default class DataService {
  constructor(apiBaseUrl, getAuthToken) {
    if (!apiBaseUrl) throw new Error("DataService: apiBaseUrl is required.");
    if (typeof getAuthToken !== 'function') throw new Error("DataService: getAuthToken must be a function.");
    
    this.API_BASE_URL = apiBaseUrl;
    this.getAuthToken = getAuthToken;
  }

  /**
   * Performs an authenticated POST request.
   */
  async #post(endpoint, body) {
    const token = await this.getAuthToken();
    if (!token) throw new Error("Authentication token not available.");

    const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown API error' }));
      throw new Error(`API Error: ${errorData.message || response.statusText}`);
    }
    return response.json();
  }

  /**
   * 1. Starts a new game session for a user.
   * This should be called once when the game loads.
   * @param {string} userId - The Firebase UID of the user.
   * @returns {Promise<object>} The newly created session object from the backend.
   */
  async startNewSession(userId) {
    console.log("DataService: Starting new session for user:", userId);
    return this.#post('/game/session/start', { user_id: userId });
  }
  
  /**
   * 2. Logs a generic event to the `log_events` table.
   * This is a versatile method for tracking various player actions.
   * @param {object} eventData - The event details.
   * @param {string} eventData.sessionId - The current game session ID.
   * @param {string} eventData.eventType - E.g., 'challenge_started', 'documentation_accessed'.
   * @param {object} [eventData.eventDetails] - A JSON object with context-specific data.
   */
  async logEvent(eventData) {
    console.log(`DataService: Logging event '${eventData.eventType}'`, eventData);
    return this.#post('/game/log-event', eventData);
  }

  /**
   * 3. Updates the `checkpoint_data` for the current session.
   * Use this to save puzzle states, inventory, etc.
   * @param {string} sessionId - The current game session ID.
   * @param {object} checkpointData - The new state to be saved.
   */
  async updateCheckpoint(sessionId, checkpointData) {
      console.log("DataService: Updating checkpoint...", checkpointData);
      return this.#post('/game/session/checkpoint', {
          session_id: sessionId,
          checkpoint_data: checkpointData
      });
  }

  /**
   * 4. Logs a code submission attempt.
   * This is a specific type of event log.
   */
  async logCodeAttempt(attemptData) {
    console.log("DataService: Logging code attempt...", attemptData);
    return this.#post('/game/attempt', attemptData);
  }

  /**
   * 5. Handles a request for an LLM-based hint.
   * This could involve multiple backend calls in a real scenario.
   */
  async requestHint(hintData) {
    console.log("DataService: Requesting hint...", hintData);
    // First, log the hint request event
    await this.logEvent({
      sessionId: hintData.sessionId,
      eventType: 'hint_requested',
      eventDetails: {
        challenge_id: hintData.challengeId,
        hint_type: 'llm_dialogue'
      }
    });
    // Then, get the actual hint from the LLM (placeholder)
    // return this.#post('/game/llm/hint', hintData);
    return { hint: "This is a placeholder hint from Karo. Remember to check variable types!" };
  }
}