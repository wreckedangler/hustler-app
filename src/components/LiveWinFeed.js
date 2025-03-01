import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const LiveWinFeed = () => {
  const [wins, setWins] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    // Verbindung zum Socket.IO-Server (URL ggf. anpassen)
    socketRef.current = io("http://localhost:5000");

    // Auf das "newWin"-Event hören, das vom Server gesendet wird
    socketRef.current.on("newWin", (winData) => {
      // Beispiel-Payload: { username: "User123", amount: 50 }
      setWins((prevWins) => [winData, ...prevWins].slice(0, 50)); // Behalte maximal 50 Nachrichten
    });

    // Aufräumen, wenn das Component unmontiert wird
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="live-win-feed">
      <h4>Live Gewinne</h4>
      <div className="win-feed-messages">
        {wins.map((win, index) => (
          <div key={index} className="win-message">
            <strong>{win.username}</strong> gewann {win.amount}$
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveWinFeed;
