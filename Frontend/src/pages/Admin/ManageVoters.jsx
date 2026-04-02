import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { addVoters, getElection } from "../../api"

export default function ManageVoters() {
    const { electionId } = useParams()
    const navigate = useNavigate()
    const [election, setElection] = useState(null)
    const [voters, setVoters] = useState([
        { name: "", verificationId: "", email: "", phone: "" }
    ])
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    useEffect(() => {
        fetchElection()
    }, [])

    const fetchElection = async () => {
        try {
            const res = await getElection(electionId)
            setElection(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const addRow = () => {
        setVoters([...voters, { name: "", verificationId: "", email: "", phone: "" }])
    }

    const removeRow = (index) => {
        setVoters(voters.filter((_, i) => i !== index))
    }

    const updateVoter = (index, field, value) => {
        const updated = [...voters]
        updated[index][field] = value
        setVoters(updated)
    }

    const handleSubmit = async () => {
        try {
            const validVoters = voters.filter(v => v.name && v.verificationId)
            if (validVoters.length === 0) {
                return setError("Please add at least one voter with name and ID")
            }
            await addVoters({ electionId, voters: validVoters })
            setSuccess(`${validVoters.length} voters added successfully!`)
            setVoters([{ name: "", verificationId: "", email: "", phone: "" }])
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add voters")
        }
    }

    const copyLink = () => {
        const link = `${window.location.origin}/vote/${electionId}`
        navigator.clipboard.writeText(link)
        alert("Voting link copied! Share this with your voters.")
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.headerTitle}>👥 Manage Voters</h2>
                <button style={styles.backBtn} onClick={() => navigate("/admin/dashboard")}>
                    ← Back
                </button>
            </div>

            <div style={styles.content}>
                {election && (
                    <div style={styles.electionInfo}>
                        <h3>{election.title}</h3>
                        <p>Verification by: <strong>{election.verificationField}</strong></p>
                        <button style={styles.copyBtn} onClick={copyLink}>
                            📋 Copy Voting Link
                        </button>
                    </div>
                )}

                {error && <p style={styles.error}>{error}</p>}
                {success && <p style={styles.success}>{success}</p>}

                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <h3 style={styles.sectionTitle}>Add Voters</h3>
                        <button style={styles.addBtn} onClick={addRow}>+ Add Row</button>
                    </div>

                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Name *</th>
                                    <th style={styles.th}>ID Number *</th>
                                    <th style={styles.th}>Email</th>
                                    <th style={styles.th}>Phone</th>
                                    <th style={styles.th}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {voters.map((voter, index) => (
                                    <tr key={index}>
                                        <td style={styles.td}>
                                            <input
                                                style={styles.tableInput}
                                                placeholder="Full Name"
                                                value={voter.name}
                                                onChange={(e) => updateVoter(index, "name", e.target.value)}
                                            />
                                        </td>
                                        <td style={styles.td}>
                                            <input
                                                style={styles.tableInput}
                                                placeholder="ID Number"
                                                value={voter.verificationId}
                                                onChange={(e) => updateVoter(index, "verificationId", e.target.value)}
                                            />
                                        </td>
                                        <td style={styles.td}>
                                            <input
                                                style={styles.tableInput}
                                                placeholder="Email"
                                                value={voter.email}
                                                onChange={(e) => updateVoter(index, "email", e.target.value)}
                                            />
                                        </td>
                                        <td style={styles.td}>
                                            <input
                                                style={styles.tableInput}
                                                placeholder="Phone"
                                                value={voter.phone}
                                                onChange={(e) => updateVoter(index, "phone", e.target.value)}
                                            />
                                        </td>
                                        <td style={styles.td}>
                                            <button
                                                style={styles.removeBtn}
                                                onClick={() => removeRow(index)}
                                            >✕</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button style={styles.submitBtn} onClick={handleSubmit}>
                        Save Voters
                    </button>
                </div>
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
    backBtn: {
        padding: "8px 16px",
        backgroundColor: "transparent",
        color: "white",
        border: "1px solid white",
        borderRadius: "6px",
        cursor: "pointer"
    },
    content: { padding: "30px", maxWidth: "900px", margin: "0 auto" },
    electionInfo: {
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "10px",
        marginBottom: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    },
    copyBtn: {
        padding: "10px 20px",
        backgroundColor: "#2196F3",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        marginTop: "10px"
    },
    section: {
        backgroundColor: "white",
        padding: "25px",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    },
    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
    },
    sectionTitle: { margin: 0, color: "#333" },
    addBtn: {
        padding: "8px 16px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
    },
    tableContainer: { overflowX: "auto", marginBottom: "20px" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: {
        padding: "12px",
        backgroundColor: "#f5f5f5",
        textAlign: "left",
        fontSize: "13px",
        color: "#666",
        borderBottom: "1px solid #ddd"
    },
    td: { padding: "8px" },
    tableInput: {
        width: "100%",
        padding: "8px",
        borderRadius: "6px",
        border: "1px solid #ddd",
        fontSize: "13px",
        boxSizing: "border-box"
    },
    removeBtn: {
        padding: "6px 10px",
        backgroundColor: "#f44336",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
    },
    submitBtn: {
        width: "100%",
        padding: "15px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "6px",
        fontSize: "16px",
        cursor: "pointer"
    },
    error: { color: "red", textAlign: "center", marginBottom: "15px" },
    success: { color: "green", textAlign: "center", marginBottom: "15px" }
}