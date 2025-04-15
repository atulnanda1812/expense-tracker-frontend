import React, { useState, useEffect } from "react";
import axios from "axios";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import SelectionScreen from "./components/SelectionScreen";
import ResultScreen from "./components/ResultScreen";
import "./App.css";
import gmailLogo from "./assets/gmail_logo.png";
import appLogo from "./assets/app_logo.png";

const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const initializeAuth = async () => {
            const token = sessionStorage.getItem("accessToken");
            if (token) {
                console.log("✅ Token found, validating...");
                await validateToken(token);
            } else if (location.pathname.startsWith("/oauth2callback")) {
                console.log("🔄 Handling OAuth callback...");
                await handleOAuthCallback();
            } else {
                setLoading(false);
            }
        };

        initializeAuth();
    }, [location.pathname]);

    const validateToken = async (token) => {
        try {
            const { data } = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/refresh_token/`, {
                refresh_token: sessionStorage.getItem("refreshToken"),
            });

            if (data.access_token) {
                console.log("✅ Token refreshed successfully.");
                sessionStorage.setItem("accessToken", data.access_token);
                setUser(data.user);

                if (location.pathname === "/") {
                    console.log("🔀 Redirecting to selection screen...");
                    navigate("/select");
                }
            }
        } catch (error) {
            console.error("❌ Token validation failed, logging out.");
            handleLogout();
        }
        setLoading(false);
    };

    const handleOAuthCallback = async () => {
        const params = new URLSearchParams(location.search);
        const authCode = params.get("code");

        if (!authCode) {
            console.error("❌ Authorization code missing.");
            alert("Login failed. Redirecting to login page.");
            navigate("/");
            return;
        }

        try {
            console.log("🔄 Attempting OAuth callback...");
            const { data } = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/callback/`, {
                code: authCode,
                redirect_uri: process.env.REACT_APP_REDIRECT_URI,
            });

            if (data.access_token) {
                console.log("✅ Login successful. Storing session...");
                sessionStorage.setItem("accessToken", data.access_token);
                sessionStorage.setItem("refreshToken", data.refresh_token);
                setUser(data.user);

                console.log("🔀 Navigating to selection screen...");
                navigate("/select");
            } else {
                console.error("❌ OAuth2 callback response missing token.");
                alert("Login failed. Please try again.");
                navigate("/");
            }
        } catch (error) {
            console.error("❌ OAuth2 callback failed:", error);
            alert("Login failed. Please try again.");
            navigate("/");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = () => {
        const redirectUri = process.env.REACT_APP_REDIRECT_URI;
        const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
        const scope = "openid email profile https://www.googleapis.com/auth/gmail.readonly";
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&access_type=offline&prompt=consent`;
        window.location.href = authUrl;
    };

    const handleLogout = () => {
        sessionStorage.clear();
        setUser(null);
        console.log("✅ User logged out successfully.");
        navigate("/");
    };

    return (
        <div className="app-container">
            {loading ? (
                <div>Loading...</div>
            ) : location.pathname === "/" ? (
                <div className="login-screen">
                    <img src={appLogo} alt="ReimburseMe Logo" className="app-logo" />
                    <h1 className="tagline">Simplified Expense Tracking</h1>
                    <div className="login-section">
                        <span className="login-text">Login with Gmail</span>
                        <button onClick={handleLogin} className="google-login-button">
                            <img src={gmailLogo} alt="Gmail" className="gmail-logo" /> Login with Google
                        </button>
                    </div>
                </div>
            ) : null}
            <Routes>
                <Route path="/select" element={<SelectionScreen />} />
                <Route path="/results" element={<ResultScreen />} />
            </Routes>
        </div>
    );
};

export default App;
