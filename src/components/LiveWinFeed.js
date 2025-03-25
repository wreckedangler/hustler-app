import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const LiveWinFeed = () => {
  const [wins, setWins] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    socketRef.current.on("newWin", (winData) => {
      setWins((prevWins) => [winData, ...prevWins].slice(0, 12));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const getColor = (amount) => {
    if (amount < 100) return "green";
    if (amount < 500) return "blue";
    if (amount < 1000) return "orange";
    if (amount < 10000) return "red";
    return "violet";
  };

  return (
    <div className="live-win-feed">
      <h4>Live wins</h4>
      <div className="win-feed-messages">
        {wins.map((win, index) => (
          <div
            key={index}
            className="win-message"
            style={{ color: getColor(win.amount), fontWeight: "bold" }}
          >
            <strong>{win.username}</strong> won {win.amount} USDT
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveWinFeed;
