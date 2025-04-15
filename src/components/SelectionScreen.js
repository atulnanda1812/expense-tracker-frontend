import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./SelectionScreen.css";
import backgroundSelection from "../assets/background-selection.png"; // ✅ Ensure Correct Background

const SelectionScreen = () => {
    const [selectedServices, setSelectedServices] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [accessToken, setAccessToken] = useState(null);
    const [loading, setLoading] = useState(false);  // <-- NEW STATE FOR PROGRESS BAR
    const navigate = useNavigate();

    // ✅ Define available services
    const services = ["Zomato", "Swiggy", "Uber", "Ola", "MakeMyTrip"];

    useEffect(() => {
        const token = sessionStorage.getItem("accessToken");
        if (!token) {
            alert("Access token is missing. Redirecting to login...");
            navigate("/");
        } else {
            setAccessToken(token);
        }
    }, [navigate]);

    // ✅ Handle service selection (Fixes previous undefined function error)
    const handleServiceSelection = (service) => {
        setSelectedServices((prev) =>
            prev.includes(service) ? prev.filter((item) => item !== service) : [...prev, service]
        );
    };

    // ✅ Handle form submission
    const handleProceed = async () => {
        if (!accessToken) {
            alert("Access token is missing. Please log in again.");
            return;
        }
        if (selectedServices.length === 0) {
            alert("Please select at least one service.");
            return;
        }
        if (!startDate || !endDate) {
            alert("Please select both start and end dates.");
            return;
        }
        setLoading(true);  // <-- SHOW PROGRESS BAR

        console.log("Payload being sent to backend:", {
            token: accessToken,
            services: selectedServices,
            dateRange: { start: startDate, end: endDate },
        });

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/handle_token_and_services/`,
                {
                    token: accessToken,
                    services: selectedServices,
                    dateRange: { start: startDate, end: endDate },
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            console.log("Response from server:", response.data);
            if (response.status === 200) {
                alert("Services processed successfully!");
                navigate("/results", { state: { token: accessToken } });
            } else {
                alert(`Error: ${response.data.error || "Unknown error occurred."}`);
            }
        } catch (error) {
            console.error("Error processing services:", error);
            alert("There was an error processing your request. Please try again.");
        }
        setLoading(false);  // <-- HIDE PROGRESS BAR
    };

    // ✅ Logout function (Ensures logout button remains)
    const handleLogout = () => {
        sessionStorage.removeItem("accessToken");
        navigate("/");
    };

    return (
        <div className="selection-screen" style={{ backgroundImage: `url(${backgroundSelection})` }}>
            <div className="selection-container">
                <h2 className="title">Select Services</h2>
                <div className="service-list">
                    {services.map((service) => (
                        <label key={service} className="service-option">
                            <input
                                type="checkbox"
                                checked={selectedServices.includes(service)}
                                onChange={() => handleServiceSelection(service)}
                            />
                            {service}
                        </label>
                    ))}
                </div>

                <div className="date-selection">
                    <label>
                        Start Date:
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </label>
                    <label>
                        End Date:
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </label>
                </div>
                {/* PROGRESS BAR */}
                {loading && (
                    <div className="progress-bar-container">
                        <div className="progress-bar"></div>
                        <p>Processing your request...</p>
                    </div>
                )}


                <button className="proceed-button" onClick={handleProceed}>
                    Proceed
                </button>

                {/* ✅ Logout Button */}
                <button className="logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default SelectionScreen;
