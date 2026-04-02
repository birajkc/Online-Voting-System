import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { adminLogin } from "../../api"

export default function AdminLogin() {
    const [form, setForm] = useState({ email: "", password: "" })
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await adminLogin(form)
            localStorage.setItem("token", res.data.token)
            localStorage.setItem("user", JSON.stringify(res.data.user))
            navigate("/admin/dashboard")
        } catch (err) {
            setError(err.response?.data?.message || "Login failed")
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Admin Login</h2>
                {error && <p style={styles.error}>{error}</p>}
                <input
                    style={styles.input}
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <input
                    style={styles.input}
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button style={styles.button} onClick={handleSubmit}>
                    Login
                </button>
                <p style={styles.link} onClick={() => navigate("/admin/register")}>
                    Don't have an account? Register
                </p>
            </div>
        </div>
    )
}

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f0f2f5"
    },
    card: {
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        width: "350px",
        display: "flex",
        flexDirection: "column",
        gap: "15px"
    },
    title: {
        textAlign: "center",
        color: "#333",
        marginBottom: "10px"
    },
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
    error: {
        color: "red",
        textAlign: "center",
        fontSize: "14px"
    },
    link: {
        textAlign: "center",
        color: "#4CAF50",
        cursor: "pointer",
        fontSize: "14px"
    }
}