// kk/apps/frontend/src/pages/tableDataPage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/components/Auth/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function TableDataPage() {
  const { tableName } = useParams();
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { currentUser, loading } = useAuth();

  const fetchData = async (search = "") => {
    if (loading || !currentUser) return;
    setError("");
    try {
      const token = await currentUser.getIdToken();
      let url = `${API_BASE_URL}/database/${tableName}`;
      if (search) {
        // This is a simplified search. In a real app, you'd specify which columns to search.
        // For now, it assumes backend can handle a generic search param or you adapt backend.
        url += `?search=${encodeURIComponent(search)}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch table data: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      setTableData(data);
      if (data.length > 0) {
        setColumns(Object.keys(data[0]));
      } else {
        setColumns([]);
      }
    } catch (err) {
      console.error(`Error fetching data for ${tableName}:`, err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tableName, currentUser, loading]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(searchTerm);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete row with ID: ${id}?`)) return;
    setError("");
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/database/${tableName}?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete row: ${errorData.error || response.statusText}`);
      }
      alert("Row deleted successfully!");
      fetchData(); // Refresh data
    } catch (err) {
      console.error("Error deleting row:", err);
      setError(err.message);
    }
  };

  const handleEdit = (row) => {
    // In a real application, you'd open a modal or navigate to an edit form
    alert(`Editing row: ${JSON.stringify(row)}`);
    // Example: prompt for new name (replace with actual form/modal)
    const newName = prompt("Enter new name:", row.name);
    if (newName !== null) {
      updateRow(row.id, { name: newName }); // Assuming 'id' and 'name' exist
    }
  };

  const updateRow = async (id, updates) => {
    setError("");
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/database/${tableName}?id=${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update row: ${errorData.error || response.statusText}`);
      }
      alert("Row updated successfully!");
      fetchData(); // Refresh data
    } catch (err) {
      console.error("Error updating row:", err);
      setError(err.message);
    }
  };

  const handleExport = async (format) => {
    setError("");
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/database/${tableName}/export/${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to export data: ${errorData.error || response.statusText}`);
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tableName}_export.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      alert(`Data exported successfully to ${format}!`);

    } catch (err) {
      console.error(`Error exporting data for ${tableName}:`, err);
      setError(err.message);
    }
  };


  if (loading) return <p>Loading authentication...</p>;
  if (!currentUser) return <p>Please log in as an administrator to view this page.</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div style={{ maxWidth: "1200px", margin: "20px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>Data for Table: `{tableName}` (Admin View)</h2>

      <div>
        <form onSubmit={handleSearch} style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: "8px", marginRight: "10px", width: "300px" }}
          />
          <button type="submit" style={{ padding: "8px 15px" }}>Search</button>
        </form>
        <div style={{ marginBottom: "20px" }}>
          <button onClick={() => handleExport('csv')} style={{ padding: "8px 15px", marginRight: "10px" }}>Export as CSV</button>
          <button onClick={() => handleExport('pdf')} style={{ padding: "8px 15px" }}>Export as PDF</button>
        </div>
      </div>

      {tableData.length === 0 ? (
        <p>No data found for this table or your search criteria.</p>
      ) : (
        <div style={{ maxHeight: "600px", overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9em" }}>
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                {columns.map(col => (
                  <th key={col} style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>{col}</th>
                ))}
                <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map(col => (
                    <td key={col} style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {typeof row[col] === 'object' && row[col] !== null
                        ? JSON.stringify(row[col]) // Display JSON objects as string
                        : String(row[col])
                      }
                    </td>
                  ))}
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    <button onClick={() => handleEdit(row)} style={{ marginRight: "5px", padding: "5px 10px" }}>Edit</button>
                    <button onClick={() => handleDelete(row.id)} style={{ padding: "5px 10px", backgroundColor: "#dc3545", color: "white", border: "none" }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}