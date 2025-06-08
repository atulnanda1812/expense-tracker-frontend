import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./ResultScreen.css";
import excelIcon from "../assets/excel-icon.png";
import pdfIcon from "../assets/pdf-icon.png";

const ResultScreen = () => {
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const token = location.state?.token;
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (!token) {
      alert("Login required! Redirecting to login.");
      navigate("/");
      return;
    }

    const fetchFiles = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/fetch_files/`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setFiles(response.data.files);
      } catch (error) {
        console.error("Error fetching files:", error);
        alert("Failed to fetch files. Please try again.");
      }
    };

    fetchFiles();
  }, [token, navigate]);

  // Find files with relevant suffixes or S3 keys
  const expenseReport = files.find(file => file.name.endsWith(".xlsx"));
  const invoicesZip = files.find(file => file.name.endsWith(".zip"));

  const handleLogout = () => {
    sessionStorage.removeItem("accessToken");
    navigate("/");
  };
  const expenseSheetUrl = expenseReport?.url;

  return (
    <div className="result-screen">
      <button className="logout-btn" onClick={handleLogout}>Logout</button>

      <h1 className="title">Expense Report & Attachments</h1>

      <div className="download-section">
       {expenseSheetUrl && (
         <div style={{ marginTop: '20px' }}>
           <p>✅ Expense report generated successfully!</p>
           <a
             href={expenseSheetUrl}
             target="_blank"
             rel="noopener noreferrer"
             style={{
               display: 'inline-block',
               padding: '10px 20px',
               backgroundColor: '#4CAF50',
               color: 'white',
               textDecoration: 'none',
               borderRadius: '5px',
               fontWeight: 'bold'
             }}
           >
             📥 Download Expense Report
           </a>
         </div>
       )}

        {invoicesZip && (
          <div className="download-item">
            <img src={pdfIcon} alt="ZIP Icon" className="icon" />
            <div>
              <h2>All Invoices (ZIP)</h2>
              <a
                href={invoicesZip.url}
                className="download-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                📥 Download All Invoices
              </a>
            </div>
          </div>
        )}

        {!expenseReport && !invoicesZip && (
          <p>No files available for download.</p>
        )}
      </div>
    </div>
  );
};

export default ResultScreen;
