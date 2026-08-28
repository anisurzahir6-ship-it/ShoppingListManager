import "./ListItems.css";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function ListItems() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Add item
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("piece");
  const [category, setCategory] = useState("Other");

  // Edit item
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editQuantity, setEditQuantity] = useState(1);
  const [editUnit, setEditUnit] = useState("piece");
  const [editCategory, setEditCategory] = useState("Other");

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ================================
  // FETCH LIST
  // ================================

  const fetchList = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/lists/${id}`,
        { headers }
      );

      setList(response.data);
    } catch (error) {
      console.error("Failed to fetch list:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load shopping list"
      );
    }
  };

  // ================================
  // FETCH ITEMS
  // ================================

  const fetchItems = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/lists/${id}/items`,
        { headers }
      );

      setItems(response.data);
    } catch (error) {
      console.error("Failed to fetch items:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load shopping items"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    fetchItems();
  }, [id]);

  // ================================
  // ADD ITEM
  // ================================

  const addItem = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter an item name");
      return;
    }

    if (Number(quantity) < 1) {
      alert("Quantity must be at least 1");
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/lists/${id}/items`,
        {
          name: name.trim(),
          quantity: Number(quantity),
          unit,
          category,
        },
        { headers }
      );

      setName("");
      setQuantity(1);
      setUnit("piece");
      setCategory("Other");

      fetchItems();
    } catch (error) {
      console.error("Failed to add item:", error);

      alert(
        error.response?.data?.message ||
          "Failed to add item"
      );
    }
  };

  // ================================
  // START EDITING
  // ================================

  const startEditing = (item) => {
    setEditingId(item._id);
    setEditName(item.name);
    setEditQuantity(item.quantity);
    setEditUnit(item.unit);
    setEditCategory(item.category);
  };

  // ================================
  // CANCEL EDIT
  // ================================

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    setEditQuantity(1);
    setEditUnit("piece");
    setEditCategory("Other");
  };

  // ================================
  // UPDATE ITEM
  // ================================

  const updateItem = async (itemId) => {
    if (!editName.trim()) {
      alert("Please enter an item name");
      return;
    }

    if (Number(editQuantity) < 1) {
      alert("Quantity must be at least 1");
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/lists/${id}/items/${itemId}`,
        {
          name: editName.trim(),
          quantity: Number(editQuantity),
          unit: editUnit,
          category: editCategory,
        },
        { headers }
      );

      cancelEditing();
      fetchItems();
    } catch (error) {
      console.error("Failed to update item:", error);

      alert(
        error.response?.data?.message ||
          "Failed to update item"
      );
    }
  };

  // ================================
  // PURCHASE TOGGLE
  // ================================

  const togglePurchased = async (item) => {
    try {
      await axios.put(
        `http://localhost:5000/api/lists/${id}/items/${item._id}`,
        {
          purchased: !item.purchased,
        },
        { headers }
      );

      fetchItems();
    } catch (error) {
      console.error("Failed to update item:", error);

      alert(
        error.response?.data?.message ||
          "Failed to update item"
      );
    }
  };

  // ================================
  // DELETE ITEM
  // ================================

  const deleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/lists/${id}/items/${itemId}`,
        { headers }
      );

      fetchItems();
    } catch (error) {
      console.error("Failed to delete item:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete item"
      );
    }
  };

  // ================================
  // FILTER ITEMS
  // ================================

  const filteredItems = items.filter((item) => {
    const itemName = item.name || "";
    const itemCategory = item.category || "Other";

    const matchesSearch = itemName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" ||
      itemCategory === categoryFilter;

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Purchased" && item.purchased) ||
      (statusFilter === "Remaining" && !item.purchased);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStatus
    );
  });

  // ================================
  // STATISTICS
  // ================================

  const totalItems = items.length;

  const purchasedItems = items.filter(
    (item) => item.purchased
  ).length;

  const remainingItems =
    totalItems - purchasedItems;

  const progress =
    totalItems === 0
      ? 0
      : Math.round(
          (purchasedItems / totalItems) * 100
        );

  // ================================
  // LOADING
  // ================================

  if (loading) {
    return (
      <div className="list-items-loading">
        <div className="loading-spinner"></div>
        <p>Loading your shopping list...</p>
      </div>
    );
  }

  // ================================
  // UI
  // ================================

  return (
    <div className="list-items-page">

      {/* ================= HEADER ================= */}

      <header className="list-items-header">

        <div className="list-title-area">
          <div className="list-icon">🛒</div>

          <div>
            <span className="eyebrow">
              SHOPPING LIST
            </span>

            <h1>
              {list?.name || "Shopping List"}
            </h1>

            {list?.description && (
              <p className="list-description">
                {list.description}
              </p>
            )}
          </div>
        </div>

        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

      </header>

      {/* ================= PROGRESS ================= */}

      <section className="list-progress-section">

        <div className="progress-header">

          <div>
            <span>Shopping Progress</span>

            <strong>
              {purchasedItems} of {totalItems} purchased
            </strong>
          </div>

          <div className="progress-percentage">
            {progress}%
          </div>

        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

      </section>

      {/* ================= STAT CARDS ================= */}

      <section className="item-stat-grid">

        <div className="item-stat-card">
          <div className="stat-icon">🛍️</div>
          <div>
            <span>Total Items</span>
            <strong>{totalItems}</strong>
          </div>
        </div>

        <div className="item-stat-card">
          <div className="stat-icon">✅</div>
          <div>
            <span>Purchased</span>
            <strong>{purchasedItems}</strong>
          </div>
        </div>

        <div className="item-stat-card">
          <div className="stat-icon">⏳</div>
          <div>
            <span>Remaining</span>
            <strong>{remainingItems}</strong>
          </div>
        </div>

      </section>

      {/* ================= ADD ITEM ================= */}

      <section className="add-item-section">

        <div className="section-heading">
          <div>
            <span className="eyebrow">
              QUICK ADD
            </span>

            <h2>Add an Item</h2>
          </div>

          <span className="section-icon">
            ＋
          </span>
        </div>

        <form
          className="add-item-form"
          onSubmit={addItem}
        >

          <div className="form-field item-name-field">
            <label>Item Name</label>

            <input
              type="text"
              placeholder="e.g. Rice, Milk, Apples..."
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />
          </div>

          <div className="form-field">
            <label>Quantity</label>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value)
              }
            />
          </div>

          <div className="form-field">
            <label>Unit</label>

            <select
              value={unit}
              onChange={(e) =>
                setUnit(e.target.value)
              }
            >
              <option value="piece">Piece</option>
              <option value="kg">Kg</option>
              <option value="g">Gram</option>
              <option value="liter">Liter</option>
              <option value="ml">Ml</option>
              <option value="pack">Pack</option>
              <option value="dozen">Dozen</option>
              <option value="bottle">Bottle</option>
            </select>
          </div>

          <div className="form-field">
            <label>Category</label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
            >
              <option value="Other">Other</option>
              <option value="Grains">Grains</option>
              <option value="Vegetables">
                Vegetables
              </option>
              <option value="Fruits">Fruits</option>
              <option value="Meat">Meat</option>
              <option value="Dairy">Dairy</option>
              <option value="Beverages">
                Beverages
              </option>
              <option value="Snacks">Snacks</option>
              <option value="Condiments">
                Condiments
              </option>
            </select>
          </div>

          <button
            className="add-item-button"
            type="submit"
          >
            + Add Item
          </button>

        </form>

      </section>

      {/* ================= ITEMS ================= */}

      <section className="shopping-items-section">

        <div className="section-heading items-heading">

          <div>
            <span className="eyebrow">
              YOUR ITEMS
            </span>

            <h2>Shopping Items</h2>
          </div>

          <span className="item-count">
            {filteredItems.length} shown
          </span>

        </div>

        {/* ================= FILTERS ================= */}

        <div className="item-filters">

          <div className="search-box">

            <span>🔎</span>

            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />

            {searchTerm && (
              <button
                type="button"
                className="clear-search"
                onClick={() =>
                  setSearchTerm("")
                }
              >
                ×
              </button>
            )}

          </div>

          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value)
            }
          >
            <option value="All">
              All Categories
            </option>
            <option value="Grains">Grains</option>
            <option value="Vegetables">
              Vegetables
            </option>
            <option value="Fruits">Fruits</option>
            <option value="Meat">Meat</option>
            <option value="Dairy">Dairy</option>
            <option value="Beverages">
              Beverages
            </option>
            <option value="Snacks">Snacks</option>
            <option value="Condiments">
              Condiments
            </option>
            <option value="Other">Other</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="All">
              All Status
            </option>
            <option value="Remaining">
              Remaining
            </option>
            <option value="Purchased">
              Purchased
            </option>
          </select>

        </div>

        {/* ================= RESULTS ================= */}

        {items.length === 0 ? (

          <div className="empty-items">
            <div className="empty-icon">
              🛒
            </div>

            <h3>Your list is empty</h3>

            <p>
              Add your first shopping item above
              to get started.
            </p>
          </div>

        ) : filteredItems.length === 0 ? (

          <div className="empty-items">
            <div className="empty-icon">
              🔎
            </div>

            <h3>No items found</h3>

            <p>
              Try changing your search or filters.
            </p>

            <button
              className="reset-filter-button"
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("All");
                setStatusFilter("All");
              }}
            >
              Reset Filters
            </button>
          </div>

        ) : (

          <div className="items-grid">

            {filteredItems.map((item) => (

              <div
                key={item._id}
                className={`item-card ${
                  item.purchased
                    ? "purchased-card"
                    : ""
                }`}
              >

                {editingId === item._id ? (

                  /* ================= EDIT ================= */

                  <div className="edit-item-form">

                    <div className="edit-heading">
                      <span>✏️</span>
                      <h3>Edit Item</h3>
                    </div>

                    <div className="form-field">
                      <label>Item Name</label>

                      <input
                        type="text"
                        value={editName}
                        onChange={(e) =>
                          setEditName(
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="edit-form-grid">

                      <div className="form-field">
                        <label>Quantity</label>

                        <input
                          type="number"
                          min="1"
                          value={editQuantity}
                          onChange={(e) =>
                            setEditQuantity(
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="form-field">
                        <label>Unit</label>

                        <select
                          value={editUnit}
                          onChange={(e) =>
                            setEditUnit(
                              e.target.value
                            )
                          }
                        >
                          <option value="piece">
                            Piece
                          </option>
                          <option value="kg">
                            Kg
                          </option>
                          <option value="g">
                            Gram
                          </option>
                          <option value="liter">
                            Liter
                          </option>
                          <option value="ml">
                            Ml
                          </option>
                          <option value="pack">
                            Pack
                          </option>
                          <option value="dozen">
                            Dozen
                          </option>
                          <option value="bottle">
                            Bottle
                          </option>
                        </select>
                      </div>

                    </div>

                    <div className="form-field">
                      <label>Category</label>

                      <select
                        value={editCategory}
                        onChange={(e) =>
                          setEditCategory(
                            e.target.value
                          )
                        }
                      >
                        <option value="Other">
                          Other
                        </option>
                        <option value="Grains">
                          Grains
                        </option>
                        <option value="Vegetables">
                          Vegetables
                        </option>
                        <option value="Fruits">
                          Fruits
                        </option>
                        <option value="Meat">
                          Meat
                        </option>
                        <option value="Dairy">
                          Dairy
                        </option>
                        <option value="Beverages">
                          Beverages
                        </option>
                        <option value="Snacks">
                          Snacks
                        </option>
                        <option value="Condiments">
                          Condiments
                        </option>
                      </select>
                    </div>

                    <div className="edit-item-actions">

                      <button
                        className="save-button"
                        onClick={() =>
                          updateItem(item._id)
                        }
                      >
                        ✓ Save Changes
                      </button>

                      <button
                        className="cancel-button"
                        onClick={cancelEditing}
                      >
                        Cancel
                      </button>

                    </div>

                  </div>

                ) : (

                  /* ================= NORMAL CARD ================= */

                  <>

                    <div className="item-card-top">

                      <div className="item-category-icon">
                        {item.purchased
                          ? "✓"
                          : "🛒"}
                      </div>

                      <span
                        className={`status-badge ${
                          item.purchased
                            ? "purchased-badge"
                            : "remaining-badge"
                        }`}
                      >
                        {item.purchased
                          ? "Purchased"
                          : "Remaining"}
                      </span>

                    </div>

                    <h3 className="item-name">
                      {item.name}
                    </h3>

                    <div className="item-details">

                      <div className="item-detail">
                        <span>Quantity</span>
                        <strong>
                          {item.quantity}{" "}
                          {item.unit}
                        </strong>
                      </div>

                      <div className="item-detail">
                        <span>Category</span>
                        <strong>
                          {item.category ||
                            "Other"}
                        </strong>
                      </div>

                    </div>

                    <div className="item-actions">

                      <button
                        className={
                          item.purchased
                            ? "unpurchase-button"
                            : "purchase-button"
                        }
                        onClick={() =>
                          togglePurchased(item)
                        }
                      >
                        {item.purchased
                          ? "↩ Mark Unpurchased"
                          : "✓ Mark Purchased"}
                      </button>

                      <button
                        className="edit-button"
                        onClick={() =>
                          startEditing(item)
                        }
                      >
                        ✏️ Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() =>
                          deleteItem(item._id)
                        }
                      >
                        🗑 Delete
                      </button>

                    </div>

                  </>

                )}

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}

export default ListItems;