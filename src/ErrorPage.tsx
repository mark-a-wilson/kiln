import React from "react";
import "./App.css";
import "@carbon/styles/css/styles.css";

const ErrorPage: React.FC = () => {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            textAlign: "center",
        }}>
            <h1>500 - Server Error</h1>
            <p>Something went wrong. Please try again later.</p>
        </div>
    );
};

export default ErrorPage;