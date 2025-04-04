import React from "react";
import "./App.css";
import "@carbon/styles/css/styles.css";
import { useLocation } from "react-router-dom";

const ErrorPage: React.FC = () => {
    const location = useLocation();
    const errorMessage = location.state?.message || "Something went wrong.Please try again later";
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            textAlign: "center",
        }}>    
            <h2>Error : </h2>
                     
            <p style={{ color: "red", fontWeight: "bold" }}>{errorMessage}</p>
        </div>
    );
};

export default ErrorPage;