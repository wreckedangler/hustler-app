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
      animateEP(displayEp, data.ep, displayLevel, data.level);
    } catch (error) {
      console.error("Error fetching level data:", error);
    }
  };

  // Eine Hilfsfunktion, die displayEp von startValue zu endValue über duration (in ms) animiert.
  // Sie animiert nur, wenn endValue >= startValue; andernfalls wird sofort der Zielwert gesetzt.
  const simpleAnimate = (startValue, endValue, duration = 1000) => {
    return new Promise((resolve) => {
      // Falls endValue kleiner als startValue ist, einfach setzen.
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

  // Hauptfunktion zur Animation von EP und Level-Up.
  // Ablauf:
  //  • Wenn targetEP < 100: einfache Animation von displayEp zu targetEP.
  //  • Wenn targetEP ≥ 100:
  //      1. (Phase 1) Falls displayEp < 100, animiere von displayEp bis 100.
  //      2. Sobald 100 erreicht ist, _sofort_ (ohne Animation) wird displayEp auf 0 gesetzt
  //         und das Level (displayLevel) wird auf targetLevel aktualisiert.
  //      3. (Phase 2) Falls ein Überschuss existiert (targetEP – 100 > 0), animiere von 0 bis zum Überschuss.
  const animateEP = async (currentEP, targetEP, currentLevel, targetLevel) => {
    // Kein Level-Up nötig:
    if (targetEP < 100) {
      await simpleAnimate(currentEP, targetEP, 1000);
      // Stelle sicher, dass das Level aus der DB übernommen wird.
      flushSync(() => {
        setDisplayLevel(targetLevel);
      });
      return;
    }
    // Level-Up nötig:
    // Phase 1: Von currentEP bis 100 animieren (falls currentEP < 100)
    if (currentEP < 100) {
      await simpleAnimate(currentEP, 100, 1000);
    }
    // Sobald 100 erreicht ist, sofort das Level aktualisieren und den Balken _ohne Animation_ auf 0 setzen.
    flushSync(() => {
      setDisplayLevel(targetLevel);
      setDisplayEp(0); // Hier wird der Balken _sofort_ auf 0 gesetzt, ohne animiert rückwärts zu fahren.
    });
    // Berechne den Überschuss (Rest-EP)
    const remainder = targetEP - 100;
    // Phase 2: Falls Rest vorhanden, animiere von 0 bis remainder
    if (remainder > 0) {
      await simpleAnimate(0, remainder, 1000);
    }
  };

  // Bei jedem Trigger (Login, Spielende etc.) die DB-Daten abrufen
  useEffect(() => {
    console.log("Refresh trigger activated:", refreshTrigger);
    fetchLevelData();
  }, [isLoggedIn, refreshTrigger]);

  // Berechne den Füllstand in Prozent für den EP-Balken (immer 0-100)
  const epPercentage = Math.min((displayEp / 100) * 100, 100);

  return (
    <div className="user-info">
      {isLoggedIn && (
        <div className="user-content">
          <span className="user-name">{username}</span>
          <div className="level-container">
            <span className="user-level">LV {displayLevel}</span>
            <div className="ep-bar">
              <div className="ep-fill" style={{ width: `${epPercentage}%` }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserInfo;
