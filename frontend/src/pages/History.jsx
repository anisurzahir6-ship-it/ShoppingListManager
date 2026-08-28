import "./History.css";

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // ==========================================
  // FETCH PURCHASE HISTORY
  // ==========================================

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");

      console.log("History token exists:", !!token);

      if (!token) {
        alert(
          "You are not logged in. Please login again."
        );

        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "History API response:",
        response.data
      );

      if (Array.isArray(response.data)) {
        setHistory(response.data);
      } else {
        console.error(
          "Unexpected history response:",
          response.data
        );

        setHistory([]);
      }
    } catch (error) {
      console.error(
        "Failed to fetch history:",
        error.response?.data ||
          error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to load purchase history"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD HISTORY
  // ==========================================

  useEffect(() => {
    fetchHistory();
  }, []);

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="history-page">
        <div className="history-header">
          <h1>Purchase History</h1>
        </div>

        <div className="loading-history">
          <p>
            Loading purchase history...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="history-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="history-header">

        <h1>Purchase History</h1>

        <div className="history-actions">

          <button
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Back to Dashboard
          </button>

          <button onClick={logout}>
            Logout
          </button>

        </div>

      </div>

      <hr />

      {/* ======================================
          PURCHASED ITEMS
      ====================================== */}

      <div className="history-section">

        <h2>Purchased Items</h2>

        {history.length === 0 ? (

          <div className="empty-history">
            <p>
              No purchase history found.
            </p>
          </div>

        ) : (

          <div className="history-grid">

            {history.map((record) => (

              <div
                key={record._id}
                className="history-card"
              >

                <h3>
                  {record.itemName}
                </h3>

                <p>
                  Quantity:{" "}
                  {record.quantity}
                </p>

                <p className="history-date">
                  Purchased At:{" "}
                  {new Date(
                    record.purchasedAt
                  ).toLocaleString()}
                </p>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default History;