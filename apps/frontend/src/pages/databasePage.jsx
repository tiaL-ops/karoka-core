// kk/apps/frontend/src/pages/databasePage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/Auth/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function DatabasePage() {
  const [tables, setTables] = useState([]);
  const [error, setError] = useState("");
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    const fetchTables = async () => {
      if (loading || !currentUser) return;

      try {
        const token = await currentUser.getIdToken();
        const response = await fetch(`${API_BASE_URL}/database/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to fetch tables: ${errorData.error || response.statusText}`);
        }

        const data = await response.json();
        setTables(data);
      } catch (err) {
        console.error("Error fetching tables:", err);
        setError(err.message);
      }
    };

    fetchTables();
  }, [currentUser, loading]);

  if (loading) return <p>Loading authentication...</p>;
  if (!currentUser) return <p>Please log in as an administrator to view this page.</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "20px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>Database Tables (Admin View)</h2>
      {tables.length === 0 ? (
        <p>No tables found or you do not have access.</p>
      ) : (
        <ul>
          {tables.map(table => (
            <li key={table} style={{ margin: "10px 0" }}>
              <Link to={`/database/${table}`} style={{ textDecoration: "none", color: "#007bff", fontSize: "1.1em" }}>
                {table}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}