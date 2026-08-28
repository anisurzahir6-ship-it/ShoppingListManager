import "./Dashboard.css";

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dashboard statistics
  const [totalItems, setTotalItems] = useState(0);
  const [purchasedItems, setPurchasedItems] = useState(0);

  // List search/filter
  const [searchTerm, setSearchTerm] = useState("");
  const [listFilter, setListFilter] = useState("All");

  // Create list
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);

  // Edit list
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] =
    useState("");
  const [editRecurring, setEditRecurring] =
    useState(false);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // ==========================================
  // FETCH LISTS
  // ==========================================

  const fetchLists = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/lists",
        authHeaders
      );

      const fetchedLists = Array.isArray(response.data)
        ? response.data
        : [];

      setLists(fetchedLists);

      // ========================================
      // FETCH ITEMS FOR STATISTICS
      // ========================================

      let allItems = [];

      try {
        const itemResponses = await Promise.all(
          fetchedLists.map(async (list) => {
            try {
              const itemResponse =
                await axios.get(
                  `http://localhost:5000/api/lists/${list._id}/items`,
                  authHeaders
                );

              return Array.isArray(itemResponse.data)
                ? itemResponse.data
                : [];
            } catch (error) {
              console.error(
                `Failed to fetch items for ${list.name}:`,
                error
              );

              return [];
            }
          })
        );

        itemResponses.forEach((listItems) => {
          allItems = [
            ...allItems,
            ...listItems,
          ];
        });

        setTotalItems(allItems.length);

        setPurchasedItems(
          allItems.filter(
            (item) => item.purchased === true
          ).length
        );
      } catch (error) {
        console.error(
          "Failed to calculate statistics:",
          error
        );

        setTotalItems(0);
        setPurchasedItems(0);
      }
    } catch (error) {
      console.error(
        "Failed to fetch lists:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to load shopping lists"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  // ==========================================
  // CREATE LIST
  // ==========================================

  const createList = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter a list name");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/lists",
        {
          name,
          description,
          isRecurring,
        },
        authHeaders
      );

      setName("");
      setDescription("");
      setIsRecurring(false);

      alert(
        "Shopping list created successfully!"
      );

      fetchLists();
    } catch (error) {
      console.error(
        "Failed to create list:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to create shopping list"
      );
    }
  };

  // ==========================================
  // START EDITING
  // ==========================================

  const startEditing = (list) => {
    setEditingId(list._id);
    setEditName(list.name);
    setEditDescription(
      list.description || ""
    );
    setEditRecurring(
      list.isRecurring || false
    );
  };

  // ==========================================
  // CANCEL EDIT
  // ==========================================

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
    setEditRecurring(false);
  };

  // ==========================================
  // UPDATE LIST
  // ==========================================

  const updateList = async (listId) => {
    if (!editName.trim()) {
      alert("Please enter a list name");
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/lists/${listId}`,
        {
          name: editName,
          description: editDescription,
          isRecurring: editRecurring,
        },
        authHeaders
      );

      alert(
        "Shopping list updated successfully!"
      );

      cancelEditing();
      fetchLists();
    } catch (error) {
      console.error(
        "Failed to update list:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update shopping list"
      );
    }
  };

  // ==========================================
  // DELETE LIST
  // ==========================================

  const deleteList = async (
    listId,
    listName
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${listName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/lists/${listId}`,
        authHeaders
      );

      alert(
        "Shopping list deleted successfully!"
      );

      fetchLists();
    } catch (error) {
      console.error(
        "Failed to delete list:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete shopping list"
      );
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // ==========================================
  // STATISTICS
  // ==========================================

  const totalLists = lists.length;

  const recurringLists = lists.filter(
    (list) => list.isRecurring === true
  ).length;

  const remainingItems = Math.max(
    totalItems - purchasedItems,
    0
  );

  const purchaseProgress =
    totalItems > 0
      ? Math.round(
          (purchasedItems / totalItems) * 100
        )
      : 0;

  // ==========================================
  // FILTER LISTS
  // ==========================================

  const filteredLists = lists.filter((list) => {
    const matchesSearch =
      list.name
        ?.toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        ) ||
      list.description
        ?.toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        );

    const matchesFilter =
      listFilter === "All" ||
      (listFilter === "Recurring" &&
        list.isRecurring) ||
      (listFilter === "Regular" &&
        !list.isRecurring);

    return (
      matchesSearch && matchesFilter
    );
  });

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your shopping dashboard...</p>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="dashboard-page">

      {/* ======================================
          TOP HEADER
      ====================================== */}

      <header className="dashboard-header">

        <div className="brand-section">

          <div className="brand-icon">
            🛒
          </div>

          <div>
            <h1>
              Shopping List Manager
            </h1>

            <p>
              Plan smarter. Shop easier.
            </p>
          </div>

        </div>

        <nav className="dashboard-actions">

          <button
            className="primary-nav-button"
            onClick={() =>
              navigate("/ai")
            }
          >
            ✨ AI Shopping List
          </button>

          <button
            onClick={() =>
              navigate("/history")
            }
          >
            🕘 Purchase History
          </button>

          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>

        </nav>

      </header>

      {/* ======================================
          WELCOME BANNER
      ====================================== */}

      <section className="welcome-banner">

        <div>

          <span className="welcome-label">
            YOUR SHOPPING OVERVIEW
          </span>

          <h2>
            Ready for your next
            shopping trip?
          </h2>

          <p>
            Manage your lists, track purchases,
            and let AI help you plan your groceries.
          </p>

        </div>

        <button
          className="banner-button"
          onClick={() =>
            document
              .getElementById(
                "create-list"
              )
              ?.scrollIntoView({
                behavior: "smooth",
              })
          }
        >
          + Create New List
        </button>

      </section>

      {/* ======================================
          STATISTICS
      ====================================== */}

      <section className="dashboard-stats">

        <div className="stat-card">

          <div className="stat-icon">
            📋
          </div>

          <div>
            <span>Total Lists</span>
            <strong>{totalLists}</strong>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon">
            🛍️
          </div>

          <div>
            <span>Total Items</span>
            <strong>{totalItems}</strong>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon">
            ✅
          </div>

          <div>
            <span>Purchased</span>
            <strong>{purchasedItems}</strong>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon">
            ⏳
          </div>

          <div>
            <span>Remaining</span>
            <strong>{remainingItems}</strong>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon">
            🔄
          </div>

          <div>
            <span>Recurring</span>
            <strong>{recurringLists}</strong>
          </div>

        </div>

      </section>

      {/* ======================================
          PROGRESS
      ====================================== */}

      <section className="progress-section">

        <div className="progress-header">

          <div>
            <h3>
              Shopping Progress
            </h3>

            <p>
              {purchasedItems} of{" "}
              {totalItems} items purchased
            </p>
          </div>

          <strong>
            {purchaseProgress}%
          </strong>

        </div>

        <div className="progress-bar">

          <div
            className="progress-fill"
            style={{
              width: `${purchaseProgress}%`,
            }}
          ></div>

        </div>

      </section>

      {/* ======================================
          CREATE LIST
      ====================================== */}

      <section
        id="create-list"
        className="create-list-section"
      >

        <div className="section-heading">

          <div>
            <span>
              ORGANIZE YOUR SHOPPING
            </span>

            <h2>
              Create Shopping List
            </h2>
          </div>

          <div className="section-icon">
            📝
          </div>

        </div>

        <form
          className="create-list-form"
          onSubmit={createList}
        >

          <div className="form-group">

            <label>
              List Name
            </label>

            <input
              type="text"
              placeholder="e.g. Weekly Grocery"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

          </div>

          <div className="form-group">

            <label>
              Description
            </label>

            <input
              type="text"
              placeholder="What is this list for?"
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
            />

          </div>

          <div className="recurring-option">

            <label className="toggle-label">

              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) =>
                  setIsRecurring(
                    e.target.checked
                  )
                }
              />

              <span className="toggle-slider"></span>

              <span>
                Make this a recurring list
              </span>

            </label>

          </div>

          <button
            className="create-button"
            type="submit"
          >
            Create List
          </button>

        </form>

      </section>

      {/* ======================================
          SHOPPING LISTS
      ====================================== */}

      <section className="shopping-lists-section">

        <div className="lists-heading">

          <div>
            <span>
              YOUR COLLECTION
            </span>

            <h2>
              My Shopping Lists
            </h2>
          </div>

          <span className="list-count">
            {filteredLists.length} list
            {filteredLists.length !== 1
              ? "s"
              : ""}
          </span>

        </div>

        {/* Search/filter */}

        <div className="list-toolbar">

          <div className="search-box">

            <span>🔍</span>

            <input
              type="text"
              placeholder="Search shopping lists..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
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

          <div className="filter-buttons">

            <button
              className={
                listFilter === "All"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setListFilter("All")
              }
            >
              All
            </button>

            <button
              className={
                listFilter === "Recurring"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setListFilter("Recurring")
              }
            >
              🔄 Recurring
            </button>

            <button
              className={
                listFilter === "Regular"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setListFilter("Regular")
              }
            >
              Regular
            </button>

          </div>

        </div>

        {/* Lists */}

        {lists.length === 0 ? (

          <div className="empty-lists">

            <div className="empty-icon">
              🛒
            </div>

            <h3>
              No shopping lists yet
            </h3>

            <p>
              Create your first shopping
              list to get started.
            </p>

            <button
              onClick={() =>
                document
                  .getElementById(
                    "create-list"
                  )
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              Create Your First List
            </button>

          </div>

        ) : filteredLists.length === 0 ? (

          <div className="empty-lists">

            <div className="empty-icon">
              🔎
            </div>

            <h3>
              No matching lists
            </h3>

            <p>
              Try a different search or filter.
            </p>

            <button
              onClick={() => {
                setSearchTerm("");
                setListFilter("All");
              }}
            >
              Clear Filters
            </button>

          </div>

        ) : (

          <div className="shopping-lists-grid">

            {filteredLists.map((list) => (

              <article
                key={list._id}
                className="shopping-list-card"
              >

                {editingId === list._id ? (

                  /* ==================================
                     EDIT MODE
                  ================================== */

                  <div className="edit-list-form">

                    <div className="edit-heading">
                      <span>
                        EDIT LIST
                      </span>

                      <h3>
                        Update Shopping List
                      </h3>
                    </div>

                    <div className="form-group">

                      <label>
                        List Name
                      </label>

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

                    <div className="form-group">

                      <label>
                        Description
                      </label>

                      <input
                        type="text"
                        value={
                          editDescription
                        }
                        onChange={(e) =>
                          setEditDescription(
                            e.target.value
                          )
                        }
                      />

                    </div>

                    <label className="toggle-label">

                      <input
                        type="checkbox"
                        checked={
                          editRecurring
                        }
                        onChange={(e) =>
                          setEditRecurring(
                            e.target.checked
                          )
                        }
                      />

                      <span className="toggle-slider"></span>

                      <span>
                        Recurring list
                      </span>

                    </label>

                    <div className="edit-list-actions">

                      <button
                        className="save-button"
                        onClick={() =>
                          updateList(
                            list._id
                          )
                        }
                      >
                        ✓ Save Changes
                      </button>

                      <button
                        className="cancel-button"
                        onClick={
                          cancelEditing
                        }
                      >
                        Cancel
                      </button>

                    </div>

                  </div>

                ) : (

                  /* ==================================
                     NORMAL MODE
                  ================================== */

                  <>

                    <div className="list-card-top">

                      <div className="list-card-icon">
                        🛒
                      </div>

                      {list.isRecurring && (
                        <span className="recurring-badge">
                          🔄 Recurring
                        </span>
                      )}

                    </div>

                    <h3>
                      {list.name}
                    </h3>

                    <p className="list-description">
                      {list.description ||
                        "No description provided."}
                    </p>

                    <div className="list-card-divider"></div>

                    <div className="list-card-actions">

                      <button
                        className="view-button"
                        onClick={() =>
                          navigate(
                            `/lists/${list._id}/items`
                          )
                        }
                      >
                        View Items →
                      </button>

                      <button
                        className="icon-button"
                        title="Edit list"
                        onClick={() =>
                          startEditing(list)
                        }
                      >
                        ✏️
                      </button>

                      <button
                        className="icon-button delete-button"
                        title="Delete list"
                        onClick={() =>
                          deleteList(
                            list._id,
                            list.name
                          )
                        }
                      >
                        🗑️
                      </button>

                    </div>

                  </>

                )}

              </article>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}

export default Dashboard;