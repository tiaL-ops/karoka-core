
### **Core Flow**

#### **User Roles**
1. **Users**:
   - Can log in and access puzzles.
   - See explanations for each puzzle.
   - Solve puzzles in a code editor.
   - Progress through 10 levels.
   - Have their progress saved.
   - Access a leaderboard to see their ranking.

2. **Admins**:
   - View all users, their emails, and progress in a user-friendly table.
   - Manage questions:
     - Add/edit/delete questions.
     - Organize questions into topics (each topic has levels and questions).
     - Add new topics periodically (e.g., every 4 weeks).

---

### **Database Design**

Here’s how the database structure can look:

#### **Collections/Tables**:
1. **Users**
   - `user_id`: Unique identifier.
   - `email`: User email.
   - `role`: `user` or `admin`.
   - `progress`: Array of completed levels (e.g., `["level_1", "level_2"]`).
   - `score`: User’s leaderboard score.

2. **Questions**
   - `question_id`: Unique identifier.
   - `topic`: Name of the topic (e.g., "Arrays").
   - `level`: Difficulty level or position in sequence (1-10).
   - `title`: Short title of the question.
   - `description`: Explanation and puzzle description.
   - `test_cases`: Array of input-output pairs for validation.
   - `solution`: (Optional) Correct solution for admin reference.

3. **Leaderboard**
   - Fetch data directly from the `Users` collection, sorted by `score`.

#### Relationships:
- A user progresses through questions, with progress saved as `level` identifiers.
- Questions are grouped by `topic` and `level`.

---

### **Key Features**

#### **User Features**
1. **Login System**:
   - Authenticate users using email/password.
   - Identify role (`user` or `admin`).

2. **Puzzle Flow**:
   - Start at Level 1 and progress sequentially through 10 levels.
   - Display an explanation before the puzzle.
   - Use a code editor for solving (Monaco Editor).
   - Submit code and check against test cases.

3. **Progress Tracking**:
   - Save progress after completing each puzzle.
   - Unlock the next level upon success.
   - View progress on a dashboard.

4. **Leaderboard**:
   - Display top users based on scores (calculated by levels completed or speed).

#### **Admin Features**
1. **User Management**:
   - View all users, emails, and progress in a table.
   - Sort or filter by topics, progress, or scores.

2. **Question Management**:
   - Add new topics:
     - Define a topic name (e.g., "Strings").
     - Add levels (1-10) with questions.
   - Add/edit/delete questions:
     - Specify title, description, test cases, and solutions.

3. **Leaderboard Overview**:
   - View the leaderboard for all users.

---

### **Tech Stack Suggestions**

#### **Frontend**:
- **Framework**: React.js (Web) or React Native (Mobile).
- **Code Editor**: Monaco Editor for the puzzle-solving interface.
- **UI Libraries**: Material-UI or Tailwind CSS for a clean, user-friendly design.

#### **Backend**:
- **Framework**: Node.js with Express or Python with Flask/Django.
- **Database**: Firebase Firestore (simpler) or PostgreSQL (more structured).

#### **Authentication**:
- Use Firebase Authentication for:
  - Login and role-based access control.
  - Linking users to progress in the database.

#### **Code Execution**:
- Use Judge0 API for running and validating user-submitted code.

#### **Hosting**:
- Frontend: Vercel (React.js) or Netlify.
- Backend: Heroku (Node.js) or Render.
- Database: Firebase or a managed database like Supabase.

---

### **Feature Development Plan**

#### **1. Authentication**
- Implement login/signup with Firebase Authentication.
- Add role-based access control (admin vs user).

#### **2. User Dashboard**
- Display:
  - Current progress (levels completed).
  - Available levels/questions.
  - Leaderboard.

#### **3. Puzzle Flow**
- Fetch and display:
  - Explanation for the puzzle.
  - Code editor.
  - Submit button to validate code against test cases.
- Save progress upon success.

#### **4. Admin Panel**
- Create an interface to:
  - View all users and their progress.
  - Manage questions:
    - Add/edit/delete topics and questions.
  - View leaderboard.

---


