import React, { useEffect, useState } from "react";
import { flushSync } from "react-dom"; // Erzwingt sofortige State-Updates

function UserInfo({ isLoggedIn, username, refreshTrigger }) {
  // DB-Werte (Quelle der Wahrheit)
  const [dbLevel, setDbLevel] = useState(1);
  const [dbEp, setDbEp] = useState(0);

  // Anzeigezustand (wird animiert)
  const [displayLevel, setDisplayLevel] = useState(1);
  const [displayEp, setDisplayEp] = useState(0);

  // Ruft die aktuellen Werte aus der DB ab
  const fetchLevelData = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await fetch("http://localhost:5000/api/get-level", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Error fetching level data:", data.error);
        return;
      }
      console.log("DB data received:", data);
      // Speichere DB-Werte
      setDbLevel(data.level);
      setDbEp(data.ep);
      // Starte die Animation von dem aktuell angezeigten Wert zu den DB-Werten.
      // Wichtig: Hier wird displayEp (aktueller Wert) mit data.ep (Zielwert) und data.level (Ziel-Level) übergeben.
      animateEP(displayEp, data.ep, data.level);
    } catch (error) {
      console.error("Error fetching level data:", error);
    }
  };

  // Hilfsfunktion: Animiert displayEp von startValue zu endValue über die angegebene Dauer (in ms).
  // Sollte endValue kleiner als startValue sein, wird sofort der Zielwert gesetzt.
  const simpleAnimate = (startValue, endValue, duration = 1000) => {
    return new Promise((resolve) => {
      if (endValue < startValue) {
        setDisplayEp(endValue);
        resolve();
        return;
      }
      const startTime = performance.now();
      const step = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentValue = Math.round(startValue + (endValue - startValue) * progress);
        setDisplayEp(currentValue);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(step);
    });
  };

  // Animiert den EP-Balken und passt ggf. den Level an.
  // Bei einem Level-Up wird zunächst der Balken bis 100 animiert, dann Level aktualisiert und EP zurückgesetzt,
  // bevor der Rest der EP animiert wird.
  const animateEP = async (currentEP, targetEP, targetLevel) => {
    // Kein Level-Up nötig: Einfach von currentEP zu targetEP animieren.
    if (targetEP < 100) {
      await simpleAnimate(currentEP, targetEP, 1000);
      flushSync(() => {
        setDisplayLevel(targetLevel);
      });
      return;
    }
    // Level-Up: Zuerst EP-Balken bis 100 animieren (falls noch nicht voll)
    if (currentEP < 100) {
      await simpleAnimate(currentEP, 100, 1000);
    }
    // Sobald 100 erreicht ist, sofort Level aktualisieren und den EP-Balken ohne Rückwärts-Animation auf 0 setzen.
    flushSync(() => {
      setDisplayLevel(targetLevel);
      setDisplayEp(0);
    });
    // Berechne den Überschuss (Rest-EP, die über 100 hinausgehen)
    const remainder = targetEP - 100;
    // Falls noch Rest vorhanden ist, animiere diesen vom Startwert 0 bis zum Rest
    if (remainder > 0) {
      await simpleAnimate(0, remainder, 1000);
    }
  };

  // Bei jedem Trigger (z.B. Login, Spielende) werden die DB-Daten abgerufen.
  useEffect(() => {
    console.log("Refresh trigger activated:", refreshTrigger);
    fetchLevelData();
  }, [isLoggedIn, refreshTrigger]);

  // Berechne den Füllstand in Prozent für den EP-Balken (immer zwischen 0 und 100)
  const epPercentage = Math.min((displayEp / 100) * 100, 100);

  return (
    <div className="user-info">
      {isLoggedIn && (
        <div className="user-content">
          
          <div className="level-container">
            <span className="user-level">LV {displayLevel}</span>
            <div className="ep-bar">
              <div className="ep-fill" style={{ width: `${epPercentage}%` }}></div>
            </div>
          </div>
          <span className="user-name">{username}</span>
        </div>
      )}
    </div>
  );
}

export default UserInfo;
