import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getElection } from "../../api"

export default function CastVote() {
    const { electionId } = useParams()
    const navigate = useNavigate()
    const [election, setElection] = useState(null)
    const [selections, setSelections] = useState({})
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

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

    const handleSelect = (postName, candidateName) => {
        setSelections({ ...selections, [postName]: candidateName })
    }

    const handleSubmit = async () => {
        try {
            setLoading(true)
            setError("")

            if (Object.keys(selections).length !== election.posts.length) {
                return setError("Please vote for all posts before submitting")
            }

            const votes = Object.keys(selections).map(postName => ({
                postName,
                candidateName: selections[postName]
            }))

            const voterToken = localStorage.getItem("voterToken")

            const res = await fetch(`http://localhost:5000/api/vote/cast`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${voterToken}`
                },
                body: JSON.stringify({ electionId, votes })
            })

            const data = await res.json()

            if (!res.ok) {
                return setError(data.message || "Failed to cast vote")
            }

            setSubmitted(true)
        } catch (err) {
            setError(err.message || "Failed to cast vote")
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div style={styles.container}>
                <div style={styles.successCard}>
                    <div style={styles.checkmark}>✅</div>
                    <h2 style={styles.successTitle}>Your Vote Has Been Successfully Submitted!</h2>
                    <p style={styles.successText}>
                        Your vote has been encrypted and recorded securely.
                    </p>
                    <button
                        style={styles.resultsBtn}
                        onClick={() => navigate(`/results/${electionId}`)}
                    >
                        View Results
                    </button>
                </div>
            </div>
        )
    }

    if (!election) return <div style={styles.loading}>Loading...</div>

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.headerTitle}>🗳️ {election.title}</h2>
                <p style={styles.headerSub}>Cast your vote carefully. You can only vote once.</p>
            </div>

            <div style={styles.content}>
                {error && <p style={styles.error}>{error}</p>}

                {election.posts.map((post, index) => (
                    <div key={index} style={styles.postCard}>
                        <h3 style={styles.postTitle}>{post.postName}</h3>
                        <p style={styles.postHint}>Select one candidate</p>

                        <div style={styles.candidatesGrid}>
                            {post.candidates.map((candidate, cIndex) => (
                                <div
                                    key={cIndex}
                                    style={{
                                        ...styles.candidateCard,
                                        ...(selections[post.postName] === candidate.name
                                            ? styles.selectedCard : {})
                                    }}
                                    onClick={() => handleSelect(post.postName, candidate.name)}
                                >
                                    <div style={styles.candidateAvatar}>
                                        {candidate.photo ? (
                                            <img src={candidate.photo} alt={candidate.name} style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover" }} />
                                        ) : (
                                            candidate.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <h4 style={styles.candidateName}>{candidate.name}</h4>
                                    <p style={styles.candidateDesc}>{candidate.description}</p>
                                    {candidate.symbol && (
                                        <img src={candidate.symbol} alt="symbol" style={{ width: "40px", height: "40px", objectFit: "contain", marginBottom: "8px" }} />
                                    )}
                                    {selections[post.postName] === candidate.name && (
                                        <div style={styles.selectedBadge}>✓ Selected</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <button
                    style={styles.submitBtn}
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? "Submitting..." : "Submit Vote"}
                </button>
            </div>
        </div>
    )
}

const styles = {
    container: { minHeight: "100vh", backgroundColor: "#f0f2f5" },
    loading: { textAlign: "center", padding: "50px", fontSize: "18px" },
    header: {
        backgroundColor: "#1a1a2e",
        padding: "20px 30px",
        textAlign: "center"
    },
    headerTitle: { color: "white", margin: "0 0 5px 0" },
    headerSub: { color: "#aaa", margin: 0, fontSize: "14px" },
    content: { padding: "30px", maxWidth: "800px", margin: "0 auto" },
    postCard: {
        backgroundColor: "white",
        padding: "25px",
        borderRadius: "10px",
        marginBottom: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    },
    postTitle: { margin: "0 0 5px 0", color: "#333", fontSize: "20px" },
    postHint: { color: "#888", fontSize: "13px", margin: "0 0 20px 0" },
    candidatesGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: "15px"
    },
    candidateCard: {
        border: "2px solid #e0e0e0",
        borderRadius: "10px",
        padding: "20px",
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.2s"
    },
    selectedCard: {
        border: "2px solid #4CAF50",
        backgroundColor: "#f1fff1"
    },
    candidateAvatar: {
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        backgroundColor: "#1a1a2e",
        color: "white",
        fontSize: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 10px auto"
    },
    candidateName: { margin: "0 0 5px 0", color: "#333" },
    candidateDesc: { color: "#888", fontSize: "12px", margin: "0 0 10px 0" },
    selectedBadge: {
        backgroundColor: "#4CAF50",
        color: "white",
        padding: "4px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        display: "inline-block"
    },
    submitBtn: {
        width: "100%",
        padding: "15px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "6px",
        fontSize: "18px",
        cursor: "pointer",
        marginTop: "10px"
    },
    error: { color: "red", textAlign: "center", marginBottom: "15px" },
    successCard: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "40px"
    },
    checkmark: { fontSize: "80px", marginBottom: "20px" },
    successTitle: { color: "#4CAF50", textAlign: "center", fontSize: "24px" },
    successText: { color: "#666", textAlign: "center", marginBottom: "30px" },
    resultsBtn: {
        padding: "15px 40px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "6px",
        fontSize: "16px",
        cursor: "pointer"
    }
}