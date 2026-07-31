import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import PolicyList from "./pages/PolicyList";
import PolicyForm from "./pages/PolicyForm";
import PolicyDetails from "./pages/PolicyDetails";
import ClaimForm from "./pages/ClaimForm";
import ClaimReviewList from "./pages/ClaimReviewList";
import ClaimStatus from "./pages/ClaimStatus";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/policies"
            element={
              <ProtectedRoute allowedRoles={["admin", "agent"]}>
                <PolicyList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/policies/new"
            element={
              <ProtectedRoute allowedRoles={["admin", "agent"]}>
                <PolicyForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/policies/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "agent", "customer"]}>
                <PolicyDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/policies/:policyId/claims/new"
            element={
              <ProtectedRoute allowedRoles={["admin", "agent", "customer"]}>
                <ClaimForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/claims"
            element={
              <ProtectedRoute allowedRoles={["admin", "agent"]}>
                <ClaimReviewList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/claims/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "agent", "customer"]}>
                <ClaimStatus />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/policies" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;