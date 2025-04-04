import React from "react";
import { Loading } from "@carbon/react"; // Ensure you have Carbon's Loading component

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, message = "Loading..." }) => {
  if (!isLoading) return null; // Don't render if not loading

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <Loading active small={false} withOverlay={false} /> 
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
