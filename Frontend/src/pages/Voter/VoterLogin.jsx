import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { sendOTP, verifyOTP, voterLogin } from "../../api"

export default function VoterLogin() {
    const { electionId } = useParams()
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [form, setForm] = useState({
        verificationId: "",
        otp: "",
        password: "",
        confirmPassword: ""
    })
    const [isReturning, setIsReturning] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false)

    // Step 1 - Send OTP
    const handleSendOTP = async () => {
        try {
            setLoading(true)
            setError("")
            await sendOTP({ electionId, verificationId: form.verificationId })
            setSuccess("OTP sent to your email!")
            setStep(2)
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send OTP")
        } finally {
            setLoading(false)
        }
    }

    // Step 2 - Verify OTP and set password
    const handleVerifyOTP = async () => {
        try {
            setLoading(true)
            setError("")
            if (form.password !== form.confirmPassword) {
                return setError("Passwords do not match")
            }
            const res = await verifyOTP({
                electionId,
                verificationId: form.verificationId,
                otp: form.otp,
                password: form.password
            })
            localStorage.setItem("voterToken", res.data.token)
            navigate(`/cast-vote/${electionId}`)
        } catch (err) {
            setError(err.response?.data?.message || "Verification failed")
        } finally {
            setLoading(false)
        }
    }

    // Returning voter login
    const handleLogin = async () => {
        try {
            setLoading(true)
            setError("")
            const res = await voterLogin({
                electionId,
                verificationId: form.verificationId,
                password: form.password
            })
            localStorage.setItem("voterToken", res.data.token)
            navigate(`/cast-vote/${electionId}`)
        } catch (err) {
            setError(err.response?.data?.message || "Login failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>🗳️ Voter Login</h2>

                <div style={styles.tabs}>
                    <button
                        style={{ ...styles.tab, ...(isReturning ? {} : styles.activeTab) }}
                        onClick={() => { setIsReturning(false); setStep(1); setError("") }}
                    >
                        New Voter
                    </button>
                    <button
                        style={{ ...styles.tab, ...(isReturning ? styles.activeTab : {}) }}
                        onClick={() => { setIsReturning(true); setError("") }}
                    >
                        Returning Voter
                    </button>
                </div>

                {error && <p style={styles.error}>{error}</p>}
                {success && <p style={styles.success}>{success}</p>}

                {!isReturning ? (
                    <>
                        {step === 1 && (
                            <>
                                <p style={styles.hint}>Enter your ID to receive OTP</p>
                                <input
                                    style={styles.input}
                                    placeholder="Your ID Number"
                                    value={form.verificationId}
                                    onChange={(e) => setForm({ ...form, verificationId: e.target.value })}
                                />
                                <button
                                    style={styles.button}
                                    onClick={handleSendOTP}
                                    disabled={loading}
                                >
                                    {loading ? "Sending..." : "Send OTP"}
                                </button>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <p style={styles.hint}>Enter OTP and set your password</p>
                                <input
                                    style={styles.input}
                                    placeholder="Enter OTP"
                                    value={form.otp}
                                    onChange={(e) => setForm({ ...form, otp: e.target.value })}
                                />
                                <input
                                    style={styles.input}
                                    type="password"
                                    placeholder="Set Password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                />
                                <input
                                    style={styles.input}
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={form.confirmPassword}
                                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                />
                                <button
                                    style={styles.button}
                                    onClick={handleVerifyOTP}
                                    disabled={loading}
                                >
                                    {loading ? "Verifying..." : "Verify & Login"}
                                </button>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <p style={styles.hint}>Login with your ID and password</p>
                        <input
                            style={styles.input}
                            placeholder="Your ID Number"
                            value={form.verificationId}
                            onChange={(e) => setForm({ ...form, verificationId: e.target.value })}
                        />
                        <input
                            style={styles.input}
                            type="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                        <button
                            style={styles.button}
                            onClick={handleLogin}
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f0f2f5"
    },
    card: {
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        width: "380px",
        display: "flex",
        flexDirection: "column",
        gap: "15px"
    },
    title: { textAlign: "center", color: "#333", margin: 0 },
    tabs: { display: "flex", gap: "10px" },
    tab: {
        flex: 1,
        padding: "10px",
        border: "1px solid #ddd",
        borderRadius: "6px",
        cursor: "pointer",
        backgroundColor: "white",
        fontSize: "14px"
    },
    activeTab: {
        backgroundColor: "#4CAF50",
        color: "white",
        border: "1px solid #4CAF50"
    },
    hint: { color: "#666", fontSize: "13px", margin: 0, textAlign: "center" },
    input: {
        padding: "12px",
        borderRadius: "6px",
        border: "1px solid #ddd",
        fontSize: "14px"
    },
    button: {
        padding: "12px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "6px",
        fontSize: "16px",
        cursor: "pointer"
    },
    error: { color: "red", textAlign: "center", fontSize: "14px", margin: 0 },
    success: { color: "green", textAlign: "center", fontSize: "14px", margin: 0 }
}