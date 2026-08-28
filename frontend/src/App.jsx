import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ListItems from "./pages/ListItems";
import History from "./pages/History";
import AIGenerator from "./pages/AIGenerator";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==========================================
            PUBLIC ROUTES
        ========================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* ==========================================
            PROTECTED ROUTES
        ========================================== */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/lists/:id/items"
            element={<ListItems />}
          />

          <Route
            path="/history"
            element={<History />}
          />

          <Route
            path="/ai"
            element={<AIGenerator />}
          />

        </Route>

        {/* ==========================================
            DEFAULT ROUTE
        ========================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        {/* ==========================================
            UNKNOWN ROUTES
        ========================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;