import React, { useState, useEffect } from "react";

const LocalTime = () => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const options = {
        timezone: "Asia/Kolkata",
        hour : '2-digit',
        minute : '2-digit',
      }
      const currentTime = new Date().toLocaleTimeString([], options);
      setTime(currentTime);
    };

    updateTime(); // Set initial time
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  return (
    <div className="time relative">
      IST {time}
    </div>
  );
};

export default LocalTime;
