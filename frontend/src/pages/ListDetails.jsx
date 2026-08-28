import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import API_URL from "../api";

function ListDetails() {
  const { id } = useParams();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchItems = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/lists/${id}/items`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setItems(response.data);
    } catch (error) {
      console.error(
        "Failed to fetch items:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to load items"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [id]);

  return (
    <div>
      <h1>Shopping List Items</h1>

      <Link to="/dashboard">
        ← Back to Dashboard
      </Link>

      <hr />

      {loading ? (
        <p>Loading items...</p>
      ) : items.length === 0 ? (
        <p>
          No items in this shopping list.
        </p>
      ) : (
        <div>
          {items.map((item) => (
            <div key={item._id}>

              <h3>
                {item.name}
              </h3>

              <p>
                Quantity:{" "}
                {item.quantity}{" "}
                {item.unit}
              </p>

              <p>
                Category:{" "}
                {item.category}
              </p>

              <p>
                Purchased:{" "}
                {item.purchased
                  ? "Yes"
                  : "No"}
              </p>

              <hr />

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ListDetails;