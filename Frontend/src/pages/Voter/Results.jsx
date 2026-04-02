import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { getResults, getElection } from "../../api"

export default function Results() {
    const { electionId } = useParams()
    const [results, setResults] = useState(null)
    const [election, setElection] = useState(null)
    const [timeRemaining, setTimeRemaining] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [])

    const fetchData = async () => {
        try {
            const [resultsRes, electionRes] = await Promise.all([
                getResults(electionId),
                getElection(electionId)
            ])
            setResults(resultsRes.data)
            setElection(electionRes.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (results?.timeRemaining) {
            const interval = setInterval(() => {
                const ms = results.timeRemaining - 1000
                if (ms <= 0) {
                    clearInterval(interval)
                    fetchData()
                    return
                }
                const hours = Math.floor(ms / 3600000)
                const minutes = Math.floor((ms % 3600000) / 60000)
                const seconds = Math.floor((ms % 60000) / 1000)
                setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [results])

    if (loading) return <div style={styles.loading}>Loading results...</div>

    const electionEnded = results?.message === "Election ended"

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.headerTitle}>🗳️ {election?.title}</h2>
                <p style={styles.headerSub}>Election Results</p>
            </div>

            <div style={styles.content}>
                {/* Stats */}
                <div style={styles.statsRow}>
                    <div style={styles.statCard}>
                        <h3 style={styles.statNumber}>{results?.totalVoters}</h3>
                        <p style={styles.statLabel}>Total Voters</p>
                    </div>
                    <div style={styles.statCard}>
                        <h3 style={styles.statNumber}>{results?.votedCount}</h3>
                        <p style={styles.statLabel}>Votes Cast</p>
                    </div>
                    <div style={styles.statCard}>
                        <h3 style={styles.statNumber}>{results?.percentage}</h3>
                        <p style={styles.statLabel}>Turnout</p>
                    </div>
                </div>

                {!electionEnded ? (
                    <div style={styles.ongoingCard}>
                        <h3 style={styles.ongoingTitle}>⏳ Election In Progress</h3>
                        <p style={styles.ongoingText}>Results will be available after the election ends</p>
                        <div style={styles.timer}>{timeRemaining}</div>
                        <p style={styles.ongoingHint}>Time Remaining</p>
                    </div>
                ) : (
                    <div>
                        <h3 style={styles.resultsTitle}>🏆 Final Results</h3>
                        {results?.results && Object.keys(results.results).map((postName, index) => {
                            const postResult = results.results[postName]
                            return (
                                <div key={index} style={styles.postCard}>
                                    <h4 style={styles.postName}>{postName}</h4>

                                    <div style={styles.winnerCard}>
                                        <div style={styles.winnerAvatar}>
                                            {postResult.winner.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p style={styles.winnerLabel}>🏆 Winner</p>
                                            <h3 style={styles.winnerName}>{postResult.winner}</h3>
                                            <p style={styles.winnerVotes}>{postResult.votes} votes</p>
                                        </div>
                                    </div>

                                    <div style={styles.allCandidates}>
                                        <h5 style={styles.allTitle}>All Candidates</h5>
                                        {Object.keys(postResult.allCandidates).map((name, i) => {
                                            const votes = postResult.allCandidates[name]
                                            const total = results.votedCount
                                            const pct = total > 0 ? ((votes / total) * 100).toFixed(1) : 0
                                            const isWinner = name === postResult.winner

                                            return (
                                                <div key={i} style={styles.candidateRow}>
                                                    <span style={styles.candName}>
                                                        {isWinner && "🏆 "}{name}
                                                    </span>
                                                    <div style={styles.barContainer}>
                                                        <div style={{
                                                            ...styles.bar,
                                                            width: `${pct}%`,
                                                            backgroundColor: isWinner ? "#4CAF50" : "#2196F3"
                                                        }} />
                                                    </div>
                                                    <span style={styles.candVotes}>{votes} ({pct}%)</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
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
    statsRow: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "15px",
        marginBottom: "25px"
    },
    statCard: {
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "10px",
        textAlign: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    },
    statNumber: { margin: "0 0 5px 0", fontSize: "28px", color: "#1a1a2e" },
    statLabel: { margin: 0, color: "#888", fontSize: "13px" },
    ongoingCard: {
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "10px",
        textAlign: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    },
    ongoingTitle: { color: "#333", marginBottom: "10px" },
    ongoingText: { color: "#666", marginBottom: "20px" },
    timer: { fontSize: "48px", fontWeight: "bold", color: "#1a1a2e", marginBottom: "5px" },
    ongoingHint: { color: "#888", fontSize: "13px" },
    resultsTitle: { fontSize: "22px", marginBottom: "20px", color: "#333" },
    postCard: {
        backgroundColor: "white",
        padding: "25px",
        borderRadius: "10px",
        marginBottom: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    },
    postName: { fontSize: "18px", color: "#333", marginBottom: "15px" },
    winnerCard: {
        display: "flex",
        alignItems: "center",
        gap: "20px",
        backgroundColor: "#f1fff1",
        border: "2px solid #4CAF50",
        borderRadius: "10px",
        padding: "20px",
        marginBottom: "20px"
    },
    winnerAvatar: {
        width: "70px",
        height: "70px",
        borderRadius: "50%",
        backgroundColor: "#4CAF50",
        color: "white",
        fontSize: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    winnerLabel: { margin: "0 0 5px 0", color: "#4CAF50", fontSize: "13px" },
    winnerName: { margin: "0 0 5px 0", color: "#333", fontSize: "22px" },
    winnerVotes: { margin: 0, color: "#666" },
    allCandidates: { marginTop: "15px" },
    allTitle: { color: "#666", marginBottom: "10px" },
    candidateRow: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "10px"
    },
    candName: { width: "150px", fontSize: "14px", color: "#333" },
    barContainer: {
        flex: 1,
        backgroundColor: "#f0f0f0",
        borderRadius: "10px",
        height: "20px",
        overflow: "hidden"
    },
    bar: { height: "100%", borderRadius: "10px", transition: "width 0.5s" },
    candVotes: { width: "80px", fontSize: "13px", color: "#666", textAlign: "right" }
}