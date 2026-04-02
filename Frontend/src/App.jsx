import { BrowserRouter, Routes, Route } from "react-router-dom"

// Admin Pages
import AdminLogin from "./pages/Admin/AdminLogin"
import AdminRegister from "./pages/Admin/AdminRegister"
import AdminDashboard from "./pages/Admin/AdminDashboard"
import CreateElection from "./pages/Admin/CreateElection"
import ManageVoters from "./pages/Admin/ManageVoters"

// Voter Pages
import VoterLogin from "./pages/Voter/VoterLogin"
import CastVote from "./pages/Voter/CastVote"
import Results from "./pages/Voter/Results"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/create-election" element={<CreateElection />} />
        <Route path="/admin/manage-voters/:electionId" element={<ManageVoters />} />

        {/* Voter Routes */}
        <Route path="/vote/:electionId" element={<VoterLogin />} />
        <Route path="/cast-vote/:electionId" element={<CastVote />} />
        <Route path="/results/:electionId" element={<Results />} />

        {/* Default */}
        <Route path="/" element={<AdminLogin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App