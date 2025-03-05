import React from "react";
import "./App.css";
import "@carbon/styles/css/styles.css";

const UnauthorizedPage: React.FC = () => {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            textAlign: "center",
        }}>
            <h1>Unauthorized Access</h1>
            <p>You are not authorized to view this content. Please contact your ICM administrator.</p>
        </div>
    );
};

export default UnauthorizedPage;