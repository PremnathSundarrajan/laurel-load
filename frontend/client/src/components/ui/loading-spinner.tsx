import React from "react";
import "./loading-spinner.css";

const LoadingSpinner: React.FC<{ text?: string }> = ({ text = "LOADING" }) => (
  <div className="loading-spinner-overlay">
    <div className="loading-spinner">
      {[...Array(12)].map((_, i) => (
        <div key={i} className={`spinner-segment spinner-segment-${i + 1}`}></div>
      ))}
    </div>
    <div className="loading-spinner-text">{text}</div>
  </div>
);

export default LoadingSpinner;
