import React, { useState } from "react";
import { Wheel } from "react-custom-roulette";

const JACKPOT_DATA = [
  { option: "LOSE", style: { backgroundColor: "#222", color: "#ff4d4d", fontWeight: "bold", fontSize: "20px" } },
  { option: "$100", style: { backgroundColor: "#00c853", color: "#fff", fontWeight: "bold", fontSize: "20px" } },
  { option: "$200", style: { backgroundColor: "#ffa000", color: "#fff", fontWeight: "bold", fontSize: "20px" } },
  { option: "$300", style: { backgroundColor: "#d50000", color: "#fff", fontWeight: "bold", fontSize: "20px" } },
  { option: "$400", style: { backgroundColor: "#2979ff", color: "#fff", fontWeight: "bold", fontSize: "20px" } },
  { option: "$500", style: { backgroundColor: "#7b1fa2", color: "#fff", fontWeight: "bold", fontSize: "20px" } },
  { option: "$600", style: { backgroundColor: "#ff6d00", color: "#fff", fontWeight: "bold", fontSize: "20px" } },
  { option: "$1000", style: { backgroundColor: "#FFD700", color: "#000", fontWeight: "bold", fontSize: "22px" } }
];

function RouletteJackpot({ betType, betAmount, isLoggedIn, openLoginModal, onSpinResult, username }) {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const numericBet = typeof betAmount === "string" ? parseFloat(betAmount.replace("$", "")) : betAmount;

  const spinJackpot = async () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    if (isSpinning) return;

    setIsSpinning(true);

    try {
      const response = await fetch("http://localhost:5000/api/play", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          betAmount: numericBet,
          betType,
          selectedField: 1
        })
      });

      const data = await response.json();
      if (data.error) {
        console.error("RouletteJackpot error:", data.error);
        setIsSpinning(false);
        return;
      }

      const newPrizeNumber = JACKPOT_DATA.findIndex(item => item.option === (data.result === "win" ? "$1000" : "LOSE"));
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);

      onSpinResult && onSpinResult(data);
    } catch (error) {
      console.error("Error sending bet to backend:", error);
      setIsSpinning(false);
    }
  };

  const onStopSpinning = () => {
    setMustSpin(false);
    setIsSpinning(false);
  };

  return (
    <div className="roulette-container">
      <div className="roulette-wheel">
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={JACKPOT_DATA}
          radius={500}
          spinDuration={4.5} /* 🔥 Smoothere Animation */
          radiusLineWidth={3}
          radiusLineColor={"#FFD700"}
          onStopSpinning={onStopSpinning}
          outerBorderColor={"#FFD700"}
          outerBorderWidth={6}
          innerRadius={5}
          outerRadius={100} /* 🔥 Kleinere Mitte */
          perpendicularText={true}
        />
        <div className="roulette-pointer"></div>
      </div>
      <button className="spin-button" onClick={spinJackpot}>
        SPIN & WIN
      </button>
    </div>
  );
}

export default RouletteJackpot;
