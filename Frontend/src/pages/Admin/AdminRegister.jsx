import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { adminRegister } from "../../api"

export default function AdminRegister() {
    const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" })
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async () => {
        try {
            setError("")
            if (!form.name || !form.email || !form.password) {
                return setError("All fields are required")
            }
            if (form.password !== form.confirmPassword) {
                return setError("Passwords do not match")
            }
            await adminRegister(form)
            setSuccess("Account created successfully! Redirecting to login...")
            setTimeout(() => navigate("/admin/login"), 2000)
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed")
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>🗳️ Admin Register</h2>
                {error && <p style={styles.error}>{error}</p>}
                {success && <p style={styles.success}>{success}</p>}
                <input style={styles.input} placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input style={styles.input} type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input style={styles.input} type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <input style={styles.input} type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
                <button style={styles.button} onClick={handleSubmit}>Register</button>
                <p style={styles.link} onClick={() => navigate("/admin/login")}>Already have an account? Login</p>
            </div>
        </div>
    )
}

const styles = {
    container: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f0f2f5" },
    card: { backgroundColor: "white", padding: "40px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", width: "350px", display: "flex", flexDirection: "column", gap: "15px" },
    title: { textAlign: "center", color: "#333", margin: 0 },
    input: { padding: "12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px" },
    button: { padding: "12px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "6px", fontSize: "16px", cursor: "pointer" },
    error: { color: "red", textAlign: "center", fontSize: "14px", margin: 0 },
    success: { color: "green", textAlign: "center", fontSize: "14px", margin: 0 },
    link: { textAlign: "center", color: "#4CAF50", cursor: "pointer", fontSize: "14px" }
}