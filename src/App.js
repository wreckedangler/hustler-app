import React, { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import MainContent from "./components/MainContent";
import LoginModal from "./components/LoginModal";
import WithdrawModal from "./components/WithdrawModal";
import LiveWinFeed from "./components/LiveWinFeed";
import { NotificationProvider } from "./contexts/NotificationContext";
import "./App.css";

function App() {
  // Global state
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [balance, setBalance] = useState(0.0);
  const [displayBalance, setDisplayBalance] = useState(0.0);
  const [defaultWithdrawAddress, setDefaultWithdrawAddress] = useState("");
  const inactivityTimer = useRef(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Token-/Login-Helper-Funktionen
  const getTokenExpiration = (token) => {
    if (!token) return null;
    const [, payload] = token.split(".");
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload.exp * 1000; // In Millisekunden
  };

  const refreshToken = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/refresh-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: localStorage.getItem("refreshToken") }),
      });
      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }
      const data = await response.json();
      localStorage.setItem("token", data.token);
      console.log("🔄 Token successfully refreshed");
      startTokenExpirationWatcher(data.token);
      return data.token;
    } catch (error) {
      console.error("❌ Error refreshing token:", error);
      await handleLogout();
    }
  };

  const startTokenExpirationWatcher = (token) => {
    const expirationTime = getTokenExpiration(token);
    if (!expirationTime) return;
    const timeUntilExpiration = expirationTime - Date.now();
    console.log(`⏳ Token expires in ${timeUntilExpiration / 1000} seconds.`);
    // Refresh token 5 minutes vor Ablauf
    setTimeout(async () => {
      console.log("🔄 Refreshing token before expiration...");
      await refreshToken();
    }, timeUntilExpiration - 5 * 60 * 1000);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await fetch("http://localhost:5000/api/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          console.warn("⚠️ Server-Logout failed, deleting token anyway.");
        }
      } else {
        console.warn("⚠️ No token present, forced logout.");
      }
    } catch (error) {
      console.error("❌ Error during logout request:", error.message);
    } finally {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      closeDropdown();
      console.log("✅ Local logout successful.");
    }
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/check-login", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to check login status");
        }
        const data = await response.json();
        if (data.isLoggedIn) {
          setIsLoggedIn(true);
          setUsername(data.username);
          setBalance(data.balance);
          setDisplayBalance(data.balance);
          console.log("✅ User is logged in:", data.username);
        } else {
          console.log("🚪 User is not logged in");
        }
      } catch (error) {
        console.error("❌ Error checking login status:", error.message);
      }
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    const handleUserActivity = () => {
      console.log("🕹️ User activity detected, resetting timer...");
      resetInactivityTimer();
    };

    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("click", handleUserActivity);
    window.addEventListener("scroll", handleUserActivity);

    startInactivityTimer();

    return () => {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("click", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
      clearTimeout(inactivityTimer.current);
    };
  }, [isLoggedIn]);

  const startInactivityTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      console.log("⏳ User inactive for 30 minutes. Logging out...");
      handleLogout();
    }, 1800000); // 30 Minuten
  };

  const resetInactivityTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    startInactivityTimer();
  };

  const getDefaultWithdrawAddress = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/get-default-withdraw-address", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch default withdraw address");
      }
      const data = await response.json();
      return data.defaultAddress;
    } catch (error) {
      console.error("❌ Error fetching default withdraw address:", error.message);
      return "";
    }
  };

  const saveDefaultWithdrawAddress = async (address) => {
    try {
      const response = await fetch("http://localhost:5000/api/save-default-withdraw-address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ withdrawAddress: address }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Unknown error occurred.");
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  const handleWithdraw = async (address, amount) => {
    try {
      const response = await fetch("http://localhost:5000/api/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ address, amount }),
      });
      if (!response.ok) {
        throw new Error("Failed to process withdrawal");
      }
      const data = await response.json();
      setBalance(data.newBalance);
      setDisplayBalance(data.newBalance);
      console.log("✅ Withdrawal successful");
    } catch (error) {
      console.error("❌ Error during withdrawal:", error.message);
    }
  };

  const openLoginModal = () => {
    setIsLoginModalVisible(true);
    setIsRegisterMode(false);
  };

  const openRegisterModal = () => {
    setIsLoginModalVisible(true);
    setIsRegisterMode(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalVisible(false);
  };

  const openWithdrawModal = async () => {
    const defaultAddress = await getDefaultWithdrawAddress();
    setDefaultWithdrawAddress(defaultAddress);
    setIsWithdrawModalVisible(true);
    setIsDropdownVisible(false);
  };

  const closeWithdrawModal = () => {
    setIsWithdrawModalVisible(false);
  };

  const closeDropdown = () => {
    setIsDropdownVisible(false);
  };

  const animateBalance = (start, end) => {
    const duration = 1000;
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentBalance = start + (end - start) * progress;
      setDisplayBalance(currentBalance);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  };

  return (
    <NotificationProvider>
      <div className="App">
        {/* Fixed Sidebar für LiveWinFeed */}
        <div className="live-feed-container">
          <LiveWinFeed />
        </div>
        <Header
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          username={username}
          displayBalance={displayBalance}
          openLoginModal={openLoginModal}
          openRegisterModal={openRegisterModal}
          balance={balance}
          openWithdrawModal={openWithdrawModal}
          handleLogout={handleLogout}
          submitWithdraw={handleWithdraw}
          isDropdownVisible={isDropdownVisible}
          setIsDropdownVisible={setIsDropdownVisible}
          refreshTrigger={refreshTrigger}
          setRefreshTrigger={setRefreshTrigger}
        />
        <MainContent
          isLoggedIn={isLoggedIn}
          balance={balance}
          setBalance={setBalance}
          displayBalance={displayBalance}
          setDisplayBalance={setDisplayBalance}
          openLoginModal={openLoginModal}
          animateBalance={animateBalance}
          username={username}
          refreshTrigger={refreshTrigger}
          setRefreshTrigger={setRefreshTrigger}
        />
        {isLoginModalVisible && (
          <LoginModal
            isRegisterMode={isRegisterMode}
            closeLoginModal={closeLoginModal}
            setIsLoggedIn={setIsLoggedIn}
            setUsername={setUsername}
            setBalance={setBalance}
            setDisplayBalance={setDisplayBalance}
            openRegisterModal={openRegisterModal}
            startTokenExpirationWatcher={startTokenExpirationWatcher}
          />
        )}
        {isWithdrawModalVisible && (
          <WithdrawModal
            closeModal={closeWithdrawModal}
            submitWithdraw={handleWithdraw}
            availableBalance={balance}
            getDefaultAddress={getDefaultWithdrawAddress}
            saveDefaultAddress={saveDefaultWithdrawAddress}
          />
        )}
      </div>
    </NotificationProvider>
  );
}

export default App;
