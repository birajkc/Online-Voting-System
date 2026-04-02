import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getAllElections, deleteElection } from "../../api"

export default function AdminDashboard() {
    const [elections, setElections] = useState([])
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("user"))

  useEffect(() => {

    fetchElections()

    // Auto refresh every 60 seconds

    const interval = setInterval(fetchElections, 60000)

    return () => clearInterval(interval)

}, []) 



    const fetchElections = async () => {
        try {
            const res = await getAllElections()
            setElections(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/admin/login")
    }

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this election?")) {
            try {
                await deleteElection(id)
                fetchElections()
            } catch (err) {
                console.error(err)
            }
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.headerTitle}>🗳️ Online Voting System</h2>
                <div style={styles.headerRight}>
                    <span style={styles.welcomeText}>Welcome, {user?.name}</span>
                    <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
                </div>
            </div>

            <div style={styles.content}>
                <div style={styles.topBar}>
                    <h3>My Elections</h3>
                    <button style={styles.createBtn} onClick={() => navigate("/admin/create-election")}>
                        + Create Election
                    </button>
                </div>

                {elections.length === 0 ? (
                    <div style={styles.empty}>
                        <p>No elections yet. Create your first election!</p>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {elections.map(election => (
                            <div key={election._id} style={styles.card}>
                                <h4 style={styles.cardTitle}>{election.title}</h4>
                                <p style={styles.cardDesc}>{election.description}</p>
                                <div style={styles.cardInfo}>
                                    <span style={{
                                        ...styles.badge,
                                        backgroundColor: election.status === "active" ? "#4CAF50" :
                                            election.status === "ended" ? "#f44336" : "#ff9800"
                                    }}>
                                        {election.status === "active" ? "Active" :
                                            election.status === "ended" ? "Ended" : "Upcoming"}
                                    </span>
                                </div>
                                <p style={styles.cardDate}>
                                    🕐 Starts: {new Date(election.startTime).toLocaleString()}
                                </p>
                                <p style={styles.cardDate}>
                                    🕐 Ends: {new Date(election.endTime).toLocaleString()}
                                </p>
                                <div style={styles.cardActions}>
                                    <button
                                        style={styles.copyBtn}
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/vote/${election._id}`)
                                            alert("Voting link copied! Share this with your voters.")
                                        }}
                                    >
                                        🔗 Copy Link
                                    </button>
                                    <button
                                        style={styles.resultsBtn}
                                        onClick={() => navigate(`/results/${election._id}`)}
                                    >
                                        Results
                                    </button>
                                    <button
                                        style={styles.deleteBtn}
                                        onClick={() => handleDelete(election._id)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

const styles = {
    container: { minHeight: "100vh", backgroundColor: "#f0f2f5" },
    header: {
        backgroundColor: "#1a1a2e",
        padding: "15px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    headerTitle: { color: "white", margin: 0 },
    headerRight: { display: "flex", alignItems: "center", gap: "15px" },
    welcomeText: { color: "white", fontSize: "14px" },
    logoutBtn: {
        padding: "8px 16px",
        backgroundColor: "#f44336",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
    },
    content: { padding: "30px" },
    topBar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
    },
    createBtn: {
        padding: "10px 20px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "15px"
    },
    empty: { textAlign: "center", padding: "50px", color: "#666" },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "20px"
    },
    card: {
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    },
    cardTitle: { margin: "0 0 8px 0", color: "#333" },
    cardDesc: { color: "#666", fontSize: "14px", margin: "0 0 10px 0" },
    cardInfo: { display: "flex", gap: "10px", marginBottom: "8px" },
    badge: {
        padding: "5px 12px",
        borderRadius: "20px",
        color: "white",
        fontSize: "13px",
        fontWeight: "bold"
    },
    cardDate: { fontSize: "13px", color: "#888", margin: "0 0 5px 0" },
    cardActions: { display: "flex", gap: "10px", marginTop: "15px" },
    copyBtn: {
        flex: 1,
        padding: "8px",
        backgroundColor: "#2196F3",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
    },
    resultsBtn: {
        flex: 1,
        padding: "8px",
        backgroundColor: "#9c27b0",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
    },
    deleteBtn: {
        padding: "8px 12px",
        backgroundColor: "#f44336",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
    }
}