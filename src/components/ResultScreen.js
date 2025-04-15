import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./ResultScreen.css"; 
import excelIcon from "../assets/excel-icon.png"; // Excel icon
import pdfIcon from "../assets/pdf-icon.png"; // PDF icon

const ResultScreen = () => {
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const token = location.state?.token;

  useEffect(() => {
    if (!token) {
      alert("Login required! Redirecting to login.");
      navigate("/");
      return;
    }

    const fetchFiles = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/fetch_files/", {
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

  // Find required files
  const expenseReport = files.find(file => file.name.endsWith(".xlsx"));
  const invoicesZip = files.find(file => file.name === "invoices.zip");

  const handleLogout = () => {
    sessionStorage.removeItem("accessToken");
    navigate("/");
  };

  return (
    <div className="result-screen">
      <button className="logout-btn" onClick={handleLogout}>Logout</button>

      <h1 className="title">Expense Report & Attachments</h1>
      
      <div className="download-section">
        {expenseReport && (
          <div className="download-item">
            <img src={excelIcon} alt="Excel Icon" className="icon" />
            <div>
              <h2>Expense Report</h2>
              <a 
                href={`http://127.0.0.1:8000/media/${expenseReport.path}`} 
                className="download-link" 
                download
              >
                📥 Download {expenseReport.name}
              </a>
            </div>
          </div>
        )}

        {invoicesZip && (
          <div className="download-item">
            <img src={pdfIcon} alt="PDF Icon" className="icon" />
            <div>
              <h2>All Invoices (ZIP)</h2>
              <a 
                href={`http://127.0.0.1:8000/media/${invoicesZip.path}`} 
                className="download-link" 
                download
              >
                📥 Download All Invoices
              </a>
            </div>
          </div>
        )}

        {!expenseReport && !invoicesZip && <p>No files available for download.</p>}
      </div>
    </div>
  );
};

export default ResultScreen;
