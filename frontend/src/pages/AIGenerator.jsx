import "./AIGenerator.css";

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";

function AIGenerator() {
  const navigate = useNavigate();

  const [mealPlan, setMealPlan] = useState("");
  const [items, setItems] = useState([]);
  const [lists, setLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingLists, setLoadingLists] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingIndex, setAddingIndex] = useState(null);

  const token = localStorage.getItem("token");

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // ==========================================
  // FETCH SHOPPING LISTS
  // ==========================================

  const fetchLists = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/lists`,
        authHeaders
      );

      const fetchedLists = response.data || [];

      setLists(fetchedLists);

      if (fetchedLists.length > 0) {
        setSelectedListId(
          fetchedLists[0]._id
        );
      }
    } catch (error) {
      console.error(
        "Failed to fetch shopping lists:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to load shopping lists"
      );
    } finally {
      setLoadingLists(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchLists();
  }, []);

  // ==========================================
  // GENERATE AI SHOPPING LIST
  // ==========================================

  const generateList = async (e) => {
    e.preventDefault();

    if (!mealPlan.trim()) {
      alert("Please enter a meal plan");
      return;
    }

    try {
      setLoading(true);
      setItems([]);

      const response = await axios.post(
        `${API_URL}/api/ai/generate-list`,
        {
          mealPlan,
        },
        authHeaders
      );

      const generatedItems =
        response.data.shoppingList?.items ||
        [];

      setItems(generatedItems);

      if (generatedItems.length === 0) {
        alert(
          "AI did not generate any shopping items."
        );
      }
    } catch (error) {
      console.error(
        "AI generation failed:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to generate shopping list"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // REMOVE GENERATED ITEM
  // ==========================================

  const removeItem = (indexToRemove) => {
    setItems((currentItems) =>
      currentItems.filter(
        (_, index) =>
          index !== indexToRemove
      )
    );
  };

  // ==========================================
  // UPDATE GENERATED ITEM
  // ==========================================

  const updateItem = (
    index,
    field,
    value
  ) => {
    setItems((currentItems) =>
      currentItems.map(
        (item, itemIndex) => {
          if (itemIndex !== index) {
            return item;
          }

          return {
            ...item,
            [field]:
              field === "quantity"
                ? Number(value)
                : value,
          };
        }
      )
    );
  };

  // ==========================================
  // ADD SINGLE ITEM TO SHOPPING LIST
  // ==========================================

  const addSingleItemToList = async (
    item,
    index
  ) => {
    if (!selectedListId) {
      alert(
        "Please select a shopping list first."
      );
      return;
    }

    if (!item.name?.trim()) {
      alert(
        "Item name cannot be empty."
      );
      return;
    }

    try {
      setAddingIndex(index);

      await axios.post(
        `${API_URL}/api/lists/${selectedListId}/items`,
        {
          name: item.name,
          quantity: Number(item.quantity),
          unit: item.unit,
          category: item.category,
        },
        authHeaders
      );

      alert(
        `${item.name} added to your shopping list!`
      );

      setItems((currentItems) =>
        currentItems.filter(
          (_, itemIndex) =>
            itemIndex !== index
        )
      );
    } catch (error) {
      console.error(
        "Failed to add item:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to add item to shopping list"
      );
    } finally {
      setAddingIndex(null);
    }
  };

  // ==========================================
  // ADD ALL AI ITEMS
  // ==========================================

  const addItemsToList = async () => {
    if (!selectedListId) {
      alert(
        "Please select a shopping list."
      );
      return;
    }

    if (items.length === 0) {
      alert(
        "There are no items to add."
      );
      return;
    }

    try {
      setSaving(true);

      for (const item of items) {
        await axios.post(
          `${API_URL}/api/lists/${selectedListId}/items`,
          {
            name: item.name,
            quantity: Number(item.quantity),
            unit: item.unit,
            category: item.category,
          },
          authHeaders
        );
      }

      alert(
        `${items.length} item(s) added to your shopping list successfully!`
      );

      navigate(
        `/lists/${selectedListId}/items`
      );
    } catch (error) {
      console.error(
        "Failed to add AI items:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to add AI items to shopping list"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // CLEAR GENERATED LIST
  // ==========================================

  const clearGeneratedList = () => {
    if (items.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to clear the generated shopping list?"
    );

    if (confirmed) {
      setItems([]);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="ai-shopping-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="ai-header">

        <div>

          <p className="ai-eyebrow">
            SMART SHOPPING
          </p>

          <h1>
            AI Shopping List Generator
          </h1>

          <p className="ai-subtitle">
            Turn your meal plan into a practical
            grocery list in seconds.
          </p>

        </div>

        <button
          className="ai-back-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Back to Dashboard
        </button>

      </div>

      {/* ======================================
          MEAL PLAN INPUT
      ====================================== */}

      <div className="ai-input-section">

        <div className="ai-section-heading">

          <div>

            <p className="ai-eyebrow">
              STEP 1
            </p>

            <h2>
              Enter Your Meal Plan
            </h2>

          </div>

        </div>

        <form onSubmit={generateList}>

          <textarea
            className="meal-plan-input"
            placeholder="Example: Chicken curry for 4 people with rice, salad, eggs and bread for breakfast..."
            value={mealPlan}
            onChange={(e) =>
              setMealPlan(e.target.value)
            }
          />

          <div className="ai-form-actions">

            <button
              className="ai-generate-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "✨ Generating..."
                : "✨ Generate Shopping List"}
            </button>

            {items.length > 0 && (
              <button
                className="ai-clear-button"
                type="button"
                onClick={
                  clearGeneratedList
                }
              >
                Clear
              </button>
            )}

          </div>

        </form>

      </div>

      {/* ======================================
          GENERATED SHOPPING LIST
      ====================================== */}

      <div className="ai-results-section">

        <div className="ai-results-header">

          <div>

            <p className="ai-eyebrow">
              STEP 2
            </p>

            <h2>
              Generated Shopping List
            </h2>

          </div>

          {items.length > 0 && (
            <span className="ai-item-count">
              {items.length} item
              {items.length !== 1
                ? "s"
                : ""}
            </span>
          )}

        </div>

        {loading ? (

          <div className="ai-empty">

            <div className="ai-loading-icon">
              ✨
            </div>

            <h3>
              Creating your shopping list...
            </h3>

            <p>
              AI is analyzing your meal plan
              and selecting practical groceries.
            </p>

          </div>

        ) : items.length === 0 ? (

          <div className="ai-empty">

            <div className="ai-empty-icon">
              🛒
            </div>

            <h3>
              No shopping list generated yet
            </h3>

            <p>
              Enter your meals above and let AI
              create your grocery list.
            </p>

          </div>

        ) : (

          <div className="ai-results-grid">

            {items.map((item, index) => (

              <div
                key={index}
                className="ai-item-card"
              >

                <div className="ai-item-card-header">

                  <h3>
                    {item.name}
                  </h3>

                  <span className="ai-item-number">
                    #{index + 1}
                  </span>

                </div>

                {/* ITEM NAME */}

                <label>
                  Item Name
                </label>

                <input
                  type="text"
                  value={item.name}
                  onChange={(e) =>
                    updateItem(
                      index,
                      "name",
                      e.target.value
                    )
                  }
                />

                {/* QUANTITY */}

                <label>
                  Quantity
                </label>

                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(
                      index,
                      "quantity",
                      e.target.value
                    )
                  }
                />

                {/* UNIT */}

                <label>
                  Unit
                </label>

                <select
                  value={item.unit}
                  onChange={(e) =>
                    updateItem(
                      index,
                      "unit",
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

                  <option value="can">
                    Can
                  </option>

                </select>

                {/* CATEGORY */}

                <label>
                  Category
                </label>

                <select
                  value={item.category}
                  onChange={(e) =>
                    updateItem(
                      index,
                      "category",
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

                  <option value="Canned goods">
                    Canned goods
                  </option>

                </select>

                {/* ACTIONS */}

                <div className="ai-item-actions">

                  <button
                    className="ai-add-single-button"
                    type="button"
                    onClick={() =>
                      addSingleItemToList(
                        item,
                        index
                      )
                    }
                    disabled={
                      addingIndex === index ||
                      saving
                    }
                  >
                    {addingIndex === index
                      ? "Adding..."
                      : "＋ Add to List"}
                  </button>

                  <button
                    className="ai-remove-button"
                    type="button"
                    onClick={() =>
                      removeItem(index)
                    }
                    disabled={
                      addingIndex === index ||
                      saving
                    }
                  >
                    Remove
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      {/* ======================================
          ADD TO EXISTING SHOPPING LIST
      ====================================== */}

      {items.length > 0 && (

        <div className="ai-input-section">

          <div className="ai-section-heading">

            <div>

              <p className="ai-eyebrow">
                STEP 3
              </p>

              <h2>
                Add to Your Shopping List
              </h2>

              <p className="ai-section-description">
                Choose where you want to save
                these generated items.
              </p>

            </div>

          </div>

          {loadingLists ? (

            <div className="ai-empty">

              <p>
                Loading your shopping lists...
              </p>

            </div>

          ) : lists.length === 0 ? (

            <div className="ai-empty">

              <div className="ai-empty-icon">
                📋
              </div>

              <h3>
                You don't have any shopping
                lists yet.
              </h3>

              <p>
                Create a shopping list first,
                then return here.
              </p>

              <button
                className="ai-generate-button"
                onClick={() =>
                  navigate("/dashboard")
                }
              >
                + Create Shopping List
              </button>

            </div>

          ) : (

            <div className="ai-save-section">

              <label>
                Select Shopping List
              </label>

              <select
                className="ai-list-select"
                value={selectedListId}
                onChange={(e) =>
                  setSelectedListId(
                    e.target.value
                  )
                }
              >

                {lists.map((list) => (

                  <option
                    key={list._id}
                    value={list._id}
                  >
                    {list.name}
                  </option>

                ))}

              </select>

              <button
                className="ai-save-button"
                onClick={addItemsToList}
                disabled={saving}
              >
                {saving
                  ? "Adding Items..."
                  : `＋ Add All ${items.length} Items to List`}
              </button>

            </div>

          )}

        </div>

      )}

    </div>
  );
}

export default AIGenerator;