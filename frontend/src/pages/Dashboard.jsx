import "./Dashboard.css";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [lists, setLists] = useState([]);
  const [listStats, setListStats] = useState({});
  const [loading, setLoading] = useState(true);

  const [totalItems, setTotalItems] = useState(0);
  const [purchasedItems, setPurchasedItems] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [listFilter, setListFilter] = useState("All");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editRecurring, setEditRecurring] = useState(false);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // ==========================================
  // FETCH LISTS + ITEMS
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

      let allItems = [];
      const stats = {};

      const itemResponses = await Promise.all(
        fetchedLists.map(async (list) => {
          try {
            const itemResponse = await axios.get(
              `http://localhost:5000/api/lists/${list._id}/items`,
              authHeaders
            );

            const items = Array.isArray(itemResponse.data)
              ? itemResponse.data
              : [];

            stats[list._id] = {
              total: items.length,
              purchased: items.filter(
                (item) => item.purchased === true
              ).length,
            };

            return items;
          } catch (error) {
            console.error(
              `Failed to fetch items for ${list.name}:`,
              error
            );

            stats[list._id] = {
              total: 0,
              purchased: 0,
            };

            return [];
          }
        })
      );

      itemResponses.forEach((items) => {
        allItems = [...allItems, ...items];
      });

      setListStats(stats);
      setTotalItems(allItems.length);

      setPurchasedItems(
        allItems.filter(
          (item) => item.purchased === true
        ).length
      );
    } catch (error) {
      console.error("Failed to fetch lists:", error);

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

      alert("Shopping list created successfully!");

      fetchLists();
    } catch (error) {
      console.error("Failed to create list:", error);

      alert(
        error.response?.data?.message ||
          "Failed to create shopping list"
      );
    }
  };

  // ==========================================
  // EDIT LIST
  // ==========================================

  const startEditing = (list) => {
    setEditingId(list._id);
    setEditName(list.name);
    setEditDescription(list.description || "");
    setEditRecurring(list.isRecurring || false);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
    setEditRecurring(false);
  };

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

      alert("Shopping list updated successfully!");

      cancelEditing();
      fetchLists();
    } catch (error) {
      console.error("Failed to update list:", error);

      alert(
        error.response?.data?.message ||
          "Failed to update shopping list"
      );
    }
  };

  // ==========================================
  // DELETE LIST
  // ==========================================

  const deleteList = async (listId, listName) => {
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

      alert("Shopping list deleted successfully!");

      fetchLists();
    } catch (error) {
      console.error("Failed to delete list:", error);

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

  const filteredLists = useMemo(() => {
    return lists.filter((list) => {
      const term = searchTerm.toLowerCase();

      const matchesSearch =
        list.name
          ?.toLowerCase()
          .includes(term) ||
        list.description
          ?.toLowerCase()
          .includes(term);

      const matchesFilter =
        listFilter === "All" ||
        (listFilter === "Recurring" &&
          list.isRecurring) ||
        (listFilter === "Regular" &&
          !list.isRecurring);

      return matchesSearch && matchesFilter;
    });
  }, [lists, searchTerm, listFilter]);

  // ==========================================
  // HELPERS
  // ==========================================

  const scrollToCreate = () => {
    document
      .getElementById("create-list")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  const scrollToLists = () => {
    document
      .getElementById("shopping-lists")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  const getListProgress = (listId) => {
    const stats = listStats[listId];

    if (!stats || stats.total === 0) {
      return 0;
    }

    return Math.round(
      (stats.purchased / stats.total) * 100
    );
  };

  const getListIcon = (list, index) => {
    if (list.isRecurring) {
      return "🔄";
    }

    const icons = [
      "🛒",
      "🎉",
      "🏠",
      "🥦",
      "🧺",
    ];

    return icons[index % icons.length];
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>

        <p>
          Loading your shopping dashboard...
        </p>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="dashboard-shell">

      {/* ======================================
          SIDEBAR
      ====================================== */}

      <aside className="dashboard-sidebar">

        <div className="sidebar-brand">

          <div className="brand-mark">
            🛒
          </div>

          <div>
            <strong>
              Shop<span>List</span>
            </strong>

            <small>
              Manager
            </small>
          </div>

        </div>

        <nav
          className="sidebar-nav"
          aria-label="Main navigation"
        >

          <button
            className="sidebar-link active"
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className="sidebar-link"
            onClick={scrollToLists}
          >
            <span>▣</span>
            My Lists
          </button>

          <button
            className="sidebar-link"
            onClick={scrollToCreate}
          >
            <span>⊞</span>
            Create List
          </button>

          <button
            className="sidebar-link"
            onClick={() =>
              navigate("/history")
            }
          >
            <span>◷</span>
            History
          </button>

          <button
            className="sidebar-link"
            onClick={() =>
              navigate("/ai")
            }
          >
            <span>✦</span>
            AI Generator
          </button>

        </nav>

        {/* AI CARD */}

        <div className="sidebar-ai">

          <div className="ai-small-title">

            <span>
              AI POWERED
            </span>

            <b>
              ✦
            </b>

          </div>

          <h3>
            Plan your shopping in seconds.
          </h3>

          <p>
            Generate a shopping list from
            your meal plan or selected recipes.
          </p>

          <button
            onClick={() =>
              navigate("/ai")
            }
          >
            Try AI Generator
          </button>

          <div className="ai-basket">
            🥬🥕🍅
          </div>

        </div>

        {/* LOGOUT */}

        <button
          className="sidebar-logout"
          onClick={logout}
        >
          <span>↪</span>
          Logout
        </button>

      </aside>

      {/* ======================================
          MAIN
      ====================================== */}

      <main className="dashboard-main">

        {/* ====================================
            TOP BAR
        ==================================== */}

        <header className="topbar">

          <div className="mobile-brand">

            <div className="brand-mark">
              🛒
            </div>

            <strong>
              Shop<span>List</span>
            </strong>

          </div>

          <div className="global-search">

            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search items or lists..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              aria-label="Search shopping lists"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() =>
                  setSearchTerm("")
                }
              >
                ×
              </button>
            )}

          </div>

          <div className="topbar-actions">

            <button
              className="top-icon"
              aria-label="Notifications"
            >
              ♡
              <i>3</i>
            </button>

            <button
              className="top-icon"
              onClick={() =>
                navigate("/ai")
              }
              aria-label="AI shopping list"
            >
              🛒
              <i>AI</i>
            </button>

            <div className="profile-chip">

              <div className="profile-avatar">
                AZ
              </div>

              <div>
                <strong>
                  Anisur Zahir
                </strong>

                <span>
                  Shopping Planner
                </span>
              </div>

              <span className="profile-chevron">
                ⌄
              </span>

            </div>

          </div>

        </header>

        {/* ====================================
            CONTENT
        ==================================== */}

        <section className="dashboard-content">

          {/* WELCOME */}

          <div className="welcome-row">

            <div>

              <p className="eyebrow">
                YOUR SHOPPING OVERVIEW
              </p>

              <h1>
                Good morning, Anisur! 👋
              </h1>

              <p className="welcome-copy">
                Here's what's happening with
                your shopping lists today.
              </p>

            </div>

            <button
              className="primary-button"
              onClick={scrollToCreate}
            >
              <span>＋</span>
              Create New List
            </button>

          </div>

          {/* ==================================
              STAT CARDS
          ================================== */}

          <div className="stats-grid">

            <article className="stat-card">

              <div className="stat-icon green">
                ▣
              </div>

              <div>

                <span>
                  Total Lists
                </span>

                <strong>
                  {totalLists}
                </strong>

                <small>
                  All your lists
                </small>

              </div>

            </article>

            <article className="stat-card">

              <div className="stat-icon blue">
                ✓
              </div>

              <div>

                <span>
                  Total Items
                </span>

                <strong>
                  {totalItems}
                </strong>

                <small>
                  Across all lists
                </small>

              </div>

            </article>

            <article className="stat-card">

              <div className="stat-icon orange">
                🛒
              </div>

              <div>

                <span>
                  Purchased
                </span>

                <strong>
                  {purchasedItems}
                </strong>

                <small>
                  Items completed
                </small>

              </div>

            </article>

            <article className="stat-card">

              <div className="stat-icon purple">
                ◷
              </div>

              <div>

                <span>
                  Pending
                </span>

                <strong>
                  {remainingItems}
                </strong>

                <small>
                  Items to buy
                </small>

              </div>

            </article>

          </div>

          {/* ==================================
              RECENT + AI
          ================================== */}

          <div className="dashboard-grid">

            {/* RECENT LISTS */}

            <section className="recent-panel panel">

              <div className="panel-heading">

                <div>

                  <p className="eyebrow">
                    YOUR COLLECTION
                  </p>

                  <h2>
                    Recent Lists
                  </h2>

                </div>

                <button
                  className="text-button"
                  onClick={scrollToCreate}
                >
                  + Create New List
                </button>

              </div>

              {lists.length === 0 ? (

                <div className="compact-empty">

                  <span>
                    🛒
                  </span>

                  <h3>
                    No shopping lists yet
                  </h3>

                  <p>
                    Create your first list
                    to get started.
                  </p>

                  <button
                    className="primary-button"
                    onClick={scrollToCreate}
                  >
                    Create Your First List
                  </button>

                </div>

              ) : (

                <div className="recent-list">

                  {lists
                    .slice(0, 4)
                    .map((list, index) => {

                      const progress =
                        getListProgress(
                          list._id
                        );

                      const stats =
                        listStats[
                          list._id
                        ];

                      return (
                        <button
                          className="recent-list-row"
                          key={list._id}
                          onClick={() =>
                            navigate(
                              `/lists/${list._id}/items`
                            )
                          }
                        >

                          <div
                            className={`recent-icon icon-${
                              index % 5
                            }`}
                          >
                            {getListIcon(
                              list,
                              index
                            )}
                          </div>

                          <div className="recent-list-info">

                            <strong>
                              {list.name}
                            </strong>

                            <span>
                              {stats?.total ?? 0}{" "}
                              items

                              {list.isRecurring
                                ? " • Recurring"
                                : ""}
                            </span>

                          </div>

                          <div className="mini-progress">

                            <div>

                              <span>
                                {progress}%
                              </span>

                              <div className="mini-progress-track">

                                <div
                                  style={{
                                    width: `${progress}%`,
                                  }}
                                />

                              </div>

                            </div>

                          </div>

                          <span className="row-arrow">
                            ›
                          </span>

                        </button>
                      );
                    })}

                </div>
              )}

              {lists.length > 0 && (
                <button
                  className="view-all-link"
                  onClick={scrollToLists}
                >
                  View all lists →
                </button>
              )}

            </section>

            {/* AI PANEL */}

            <aside className="ai-panel panel">

              <div className="ai-panel-glow"></div>

              <div className="ai-panel-content">

                <p className="eyebrow purple-text">
                  AI ASSISTANT ✦
                </p>

                <h2>
                  Build your list faster.
                </h2>

                <p>
                  Generate a shopping list
                  from your meal plan or
                  selected recipes.
                </p>

                <button
                  onClick={() =>
                    navigate("/ai")
                  }
                >
                  Generate Shopping List →
                </button>

              </div>

              <div className="ai-illustration">

                <div className="phone">

                  <div className="phone-top"></div>

                  <div className="check-line">
                    ✓ Grocery items
                  </div>

                  <div className="check-line">
                    ✓ Fresh vegetables
                  </div>

                  <div className="check-line">
                    ✓ Dairy & eggs
                  </div>

                  <div className="check-line">
                    ✓ Snacks
                  </div>

                </div>

                <div className="basket-art">
                  🛒
                </div>

              </div>

            </aside>

          </div>

          {/* ==================================
              LOWER GRID
          ================================== */}

          <div className="dashboard-grid lower-grid">

            {/* LISTS AT GLANCE */}

            <section className="glance-panel panel">

              <div className="panel-heading">

                <div>

                  <p className="eyebrow">
                    QUICK ACCESS
                  </p>

                  <h2>
                    Your Lists at a Glance
                  </h2>

                </div>

              </div>

              <div className="glance-grid">

                {lists
                  .slice(0, 3)
                  .map((list, index) => {

                    const progress =
                      getListProgress(
                        list._id
                      );

                    const stats =
                      listStats[
                        list._id
                      ];

                    return (
                      <button
                        className="glance-card"
                        key={list._id}
                        onClick={() =>
                          navigate(
                            `/lists/${list._id}/items`
                          )
                        }
                      >

                        <div
                          className={`glance-image image-${
                            index % 3
                          }`}
                        >
                          {getListIcon(
                            list,
                            index
                          )}
                        </div>

                        <div className="glance-info">

                          <strong>
                            {list.name}
                          </strong>

                          <span>
                            {stats?.total ?? 0}{" "}
                            items
                          </span>

                          <div className="glance-progress">

                            <div
                              style={{
                                width: `${progress}%`,
                              }}
                            ></div>

                          </div>

                          <b>
                            {progress}%
                          </b>

                        </div>

                      </button>
                    );
                  })}

                <button
                  className="create-glance"
                  onClick={scrollToCreate}
                >

                  <span>
                    ＋
                  </span>

                  <strong>
                    Create New List
                  </strong>

                </button>

              </div>

            </section>

            {/* CATEGORIES */}

            <section className="categories-panel panel">

              <div className="panel-heading">

                <div>

                  <p className="eyebrow">
                    SHOPPING CATEGORIES
                  </p>

                  <h2>
                    Popular Categories
                  </h2>

                </div>

              </div>

              <div className="category-grid">

                <div className="category-card">
                  <span>🍎</span>

                  <strong>
                    Fruits &<br />
                    Vegetables
                  </strong>
                </div>

                <div className="category-card">
                  <span>🥛</span>

                  <strong>
                    Dairy &<br />
                    Eggs
                  </strong>
                </div>

                <div className="category-card">
                  <span>🥤</span>

                  <strong>
                    Snacks &<br />
                    Drinks
                  </strong>
                </div>

                <div className="category-card">
                  <span>🏠</span>

                  <strong>
                    Household<br />
                    Essentials
                  </strong>
                </div>

              </div>

            </section>

          </div>

          {/* ==================================
              CREATE LIST
          ================================== */}

          <section
            id="create-list"
            className="create-panel panel"
          >

            <div className="create-panel-heading">

              <div>

                <p className="eyebrow">
                  ORGANIZE YOUR SHOPPING
                </p>

                <h2>
                  Create Shopping List
                </h2>

                <p>
                  Start a fresh list for
                  your next shopping trip.
                </p>

              </div>

              <div className="create-panel-icon">
                ＋
              </div>

            </div>

            <form
              className="create-form"
              onSubmit={createList}
            >

              <div className="form-group">

                <label htmlFor="list-name">
                  List Name
                </label>

                <input
                  id="list-name"
                  type="text"
                  placeholder="e.g. Weekly Groceries"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                />

              </div>

              <div className="form-group">

                <label htmlFor="list-description">
                  Description
                </label>

                <input
                  id="list-description"
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

                <span className="toggle-ui"></span>

                <span>
                  Make this a recurring list
                </span>

              </label>

              <button
                className="primary-button create-submit"
                type="submit"
              >
                Create List
              </button>

            </form>

          </section>

          {/* ==================================
              ALL SHOPPING LISTS
          ================================== */}

          <section
            id="shopping-lists"
            className="lists-panel panel"
          >

            <div className="panel-heading lists-title-row">

              <div>

                <p className="eyebrow">
                  ALL YOUR LISTS
                </p>

                <h2>
                  My Shopping Lists
                </h2>

              </div>

              <span className="list-count">

                {filteredLists.length}{" "}

                {filteredLists.length === 1
                  ? "list"
                  : "lists"}

              </span>

            </div>

            {/* SEARCH */}

            <div className="list-toolbar">

              <div className="list-search">

                <span>
                  ⌕
                </span>

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
                    onClick={() =>
                      setSearchTerm("")
                    }
                  >
                    ×
                  </button>
                )}

              </div>

              {/* FILTER */}

              <div className="filter-buttons">

                {[
                  "All",
                  "Recurring",
                  "Regular",
                ].map((filter) => (

                  <button
                    key={filter}
                    className={
                      listFilter === filter
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setListFilter(filter)
                    }
                  >

                    {filter === "Recurring"
                      ? "↻ "
                      : ""}

                    {filter}

                  </button>

                ))}

              </div>

            </div>

            {/* NO LISTS */}

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
                  className="primary-button"
                  onClick={scrollToCreate}
                >
                  Create Your First List
                </button>

              </div>

            ) : filteredLists.length === 0 ? (

              <div className="empty-lists">

                <div className="empty-icon">
                  ⌕
                </div>

                <h3>
                  No matching lists
                </h3>

                <p>
                  Try a different search
                  or filter.
                </p>

                <button
                  className="secondary-button"
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

                {filteredLists.map(
                  (list, index) => {

                    const progress =
                      getListProgress(
                        list._id
                      );

                    const stats =
                      listStats[
                        list._id
                      ];

                    return (
                      <article
                        className="shopping-list-card"
                        key={list._id}
                      >

                        {/* EDIT MODE */}

                        {editingId === list._id ? (

                          <div className="edit-list-form">

                            <div className="edit-heading">

                              <p className="eyebrow">
                                EDIT LIST
                              </p>

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

                              <span className="toggle-ui"></span>

                              <span>
                                Recurring list
                              </span>

                            </label>

                            <div className="edit-list-actions">

                              <button
                                className="primary-button"
                                onClick={() =>
                                  updateList(
                                    list._id
                                  )
                                }
                              >
                                ✓ Save Changes
                              </button>

                              <button
                                className="secondary-button"
                                onClick={
                                  cancelEditing
                                }
                              >
                                Cancel
                              </button>

                            </div>

                          </div>

                        ) : (

                          /* NORMAL MODE */

                          <>

                            <div className="list-card-top">

                              <div
                                className={`list-card-icon icon-${
                                  index % 5
                                }`}
                              >
                                {getListIcon(
                                  list,
                                  index
                                )}
                              </div>

                              {list.isRecurring && (
                                <span className="recurring-badge">
                                  ↻ Recurring
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

                            {/* PROGRESS */}

                            <div className="card-progress">

                              <div>

                                <span>
                                  Shopping progress
                                </span>

                                <strong>
                                  {progress}%
                                </strong>

                              </div>

                              <div className="card-progress-track">

                                <div
                                  style={{
                                    width: `${progress}%`,
                                  }}
                                ></div>

                              </div>

                              <small>
                                {stats?.purchased ??
                                  0}{" "}
                                of{" "}
                                {stats?.total ??
                                  0}{" "}
                                items purchased
                              </small>

                            </div>

                            <div className="list-card-divider"></div>

                            {/* ACTIONS */}

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
                                  startEditing(
                                    list
                                  )
                                }
                              >
                                ✎
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
                                🗑
                              </button>

                            </div>

                          </>

                        )}

                      </article>
                    );
                  }
                )}

              </div>

            )}

          </section>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;