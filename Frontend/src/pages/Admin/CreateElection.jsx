import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createElection, uploadImage } from "../../api"
import * as XLSX from "xlsx"

export default function CreateElection() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        title: "",
        description: "",
        electionType: "small",
        verificationField: "studentId",
        startTime: "",
        endTime: "",
        posts: []
    })
    const [voters, setVoters] = useState([])
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [uploading, setUploading] = useState(false)

    const addPost = () => {
        setForm({
            ...form,
            posts: [...form.posts, { postName: "", candidates: [] }]
        })
    }

    const updatePostName = (index, value) => {
        const updatedPosts = [...form.posts]
        updatedPosts[index].postName = value
        setForm({ ...form, posts: updatedPosts })
    }

    const addCandidate = (postIndex) => {
        const updatedPosts = [...form.posts]
        updatedPosts[postIndex].candidates.push({
            name: "",
            description: "",
            photo: "",
            symbol: ""
        })
        setForm({ ...form, posts: updatedPosts })
    }

    const updateCandidate = (postIndex, candIndex, field, value) => {
        const updatedPosts = [...form.posts]
        updatedPosts[postIndex].candidates[candIndex][field] = value
        setForm({ ...form, posts: updatedPosts })
    }

    const removePost = (index) => {
        const updatedPosts = form.posts.filter((_, i) => i !== index)
        setForm({ ...form, posts: updatedPosts })
    }

    const removeCandidate = (postIndex, candIndex) => {
        const updatedPosts = [...form.posts]
        updatedPosts[postIndex].candidates = updatedPosts[postIndex].candidates.filter((_, i) => i !== candIndex)
        setForm({ ...form, posts: updatedPosts })
    }

    const handleImageUpload = async (postIndex, candIndex, field, file) => {
        try {
            setUploading(true)
            setError("")
            const formData = new FormData()
            formData.append("image", file)
            const res = await uploadImage(formData)
            updateCandidate(postIndex, candIndex, field, res.data.url)
        } catch (err) {
            setError("Image upload failed")
        } finally {
            setUploading(false)
        }
    }

  const handleExcelUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
        const data = new Uint8Array(evt.target.result)
        const workbook = XLSX.read(data, { type: "array" })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(sheet)

        console.log("Raw data:", jsonData)

        const formatted = jsonData.map(row => {
            const cleanRow = {}
            Object.keys(row).forEach(key => {
                cleanRow[key.trim()] = row[key]
            })
            return {
                name: String(cleanRow["Name"] || cleanRow["name"] || "").trim(),
                verificationId: String(cleanRow["ID"] || cleanRow["id"] || cleanRow["verificationId"] || "").trim(),
                email: String(cleanRow["Email"] || cleanRow["email"] || "").trim(),
                phone: String(cleanRow["Phone"] || cleanRow["phone"] || "").trim()
            }
        }).filter(v => v.name && v.verificationId)

        console.log("Formatted:", formatted)
        setVoters(formatted)
        setSuccess(`${formatted.length} voters loaded from file!`)
    }
    reader.readAsArrayBuffer(file)
}

    const handleSubmit = async () => {
        try {
            setError("")
            if (!form.title || !form.startTime || !form.endTime) {
                return setError("Please fill all required fields")
            }
            if (form.posts.length === 0) {
                return setError("Please add at least one post")
            }
            await createElection({ ...form, voters })
            setSuccess("Election created successfully!")
            setTimeout(() => navigate("/admin/dashboard"), 1500)
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create election")
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.headerTitle}>🗳️ Create Election</h2>
                <button style={styles.backBtn} onClick={() => navigate("/admin/dashboard")}>
                    ← Back
                </button>
            </div>

            <div style={styles.content}>
                {error && <p style={styles.error}>{error}</p>}
                {success && <p style={styles.success}>{success}</p>}

                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Basic Information</h3>
                    <input
                        style={styles.input}
                        placeholder="Election Title *"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                    <textarea
                        style={styles.textarea}
                        placeholder="Description"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                    <div style={styles.row}>
                        <div style={styles.col}>
                            <label style={styles.label}>Election Type</label>
                            <select
                                style={styles.select}
                                value={form.electionType}
                                onChange={(e) => setForm({ ...form, electionType: e.target.value })}
                            >
                                <option value="small">Small (School/Org)</option>
                                <option value="national">National</option>
                            </select>
                        </div>
                        <div style={styles.col}>
                            <label style={styles.label}>Voter Verification By</label>
                            <select
                                style={styles.select}
                                value={form.verificationField}
                                onChange={(e) => setForm({ ...form, verificationField: e.target.value })}
                            >
                                <option value="studentId">Student ID</option>
                                <option value="citizenshipNumber">Citizenship Number</option>
                                <option value="employeeId">Employee ID</option>
                                <option value="voterId">Voter ID</option>
                            </select>
                        </div>
                    </div>
                    <div style={styles.row}>
                        <div style={styles.col}>
                            <label style={styles.label}>Start Time *</label>
                            <input
                                style={styles.input}
                                type="datetime-local"
                                value={form.startTime}
                                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                            />
                        </div>
                        <div style={styles.col}>
                            <label style={styles.label}>End Time *</label>
                            <input
                                style={styles.input}
                                type="datetime-local"
                                value={form.endTime}
                                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <h3 style={styles.sectionTitle}>Posts & Candidates</h3>
                        <button style={styles.addPostBtn} onClick={addPost}>+ Add Post</button>
                    </div>

                    {form.posts.map((post, postIndex) => (
                        <div key={postIndex} style={styles.postCard}>
                            <div style={styles.postHeader}>
                                <input
                                    style={styles.postInput}
                                    placeholder="Post Name (e.g. Chairperson, President...)"
                                    value={post.postName}
                                    onChange={(e) => updatePostName(postIndex, e.target.value)}
                                />
                                <button style={styles.removeBtn} onClick={() => removePost(postIndex)}>✕</button>
                            </div>

                            {post.candidates.map((cand, candIndex) => (
                                <div key={candIndex} style={styles.candidateBox}>
                                    <div style={styles.candRow}>
                                        <input
                                            style={styles.candInput}
                                            placeholder="Candidate Name"
                                            value={cand.name}
                                            onChange={(e) => updateCandidate(postIndex, candIndex, "name", e.target.value)}
                                        />
                                        <input
                                            style={styles.candInput}
                                            placeholder="Description"
                                            value={cand.description}
                                            onChange={(e) => updateCandidate(postIndex, candIndex, "description", e.target.value)}
                                        />
                                        <button style={styles.removeBtn} onClick={() => removeCandidate(postIndex, candIndex)}>✕</button>
                                    </div>

                                    <div style={styles.uploadRow}>
                                        <div style={styles.uploadBox}>
                                            <label style={styles.uploadLabel}>📸 Photo</label>
                                            {cand.photo ? (
                                                <div style={styles.previewBox}>
                                                    <img src={cand.photo} alt="photo" style={styles.preview} />
                                                    <button style={styles.clearBtn} onClick={() => updateCandidate(postIndex, candIndex, "photo", "")}>✕</button>
                                                </div>
                                            ) : (
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    style={styles.fileInput}
                                                    onChange={(e) => handleImageUpload(postIndex, candIndex, "photo", e.target.files[0])}
                                                />
                                            )}
                                        </div>

                                        <div style={styles.uploadBox}>
                                            <label style={styles.uploadLabel}>🏷️ Symbol/Logo</label>
                                            {cand.symbol ? (
                                                <div style={styles.previewBox}>
                                                    <img src={cand.symbol} alt="symbol" style={styles.preview} />
                                                    <button style={styles.clearBtn} onClick={() => updateCandidate(postIndex, candIndex, "symbol", "")}>✕</button>
                                                </div>
                                            ) : (
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    style={styles.fileInput}
                                                    onChange={(e) => handleImageUpload(postIndex, candIndex, "symbol", e.target.files[0])}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button style={styles.addCandBtn} onClick={() => addCandidate(postIndex)}>
                                + Add Candidate
                            </button>
                        </div>
                    ))}
                </div>

                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>👥 Upload Voters</h3>
                    <p style={styles.hint}>
                        Upload an Excel or CSV file with columns: <strong>Name, ID, Email, Phone</strong>
                    </p>
                    <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        style={styles.fileInput}
                        onChange={handleExcelUpload}
                    />

                    {voters.length > 0 && (
                        <div style={styles.voterPreview}>
                            <p style={styles.voterCount}>✅ {voters.length} voters loaded</p>
                            <div style={styles.voterTable}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>#</th>
                                            <th style={styles.th}>Name</th>
                                            <th style={styles.th}>ID</th>
                                            <th style={styles.th}>Email</th>
                                            <th style={styles.th}>Phone</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {voters.slice(0, 5).map((v, i) => (
                                            <tr key={i}>
                                                <td style={styles.td}>{i + 1}</td>
                                                <td style={styles.td}>{v.name}</td>
                                                <td style={styles.td}>{v.verificationId}</td>
                                                <td style={styles.td}>{v.email}</td>
                                                <td style={styles.td}>{v.phone}</td>
                                            </tr>
                                        ))}
                                        {voters.length > 5 && (
                                            <tr>
                                                <td colSpan="5" style={styles.moreRow}>
                                                    ... and {voters.length - 5} more voters
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {uploading && <p style={styles.uploading}>⏳ Uploading image...</p>}

                <button style={styles.submitBtn} onClick={handleSubmit} disabled={uploading}>
                    Create Election
                </button>
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
    content: { padding: "30px", maxWidth: "850px", margin: "0 auto" },
    section: {
        backgroundColor: "white",
        padding: "25px",
        borderRadius: "10px",
        marginBottom: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    },
    sectionTitle: { margin: "0 0 20px 0", color: "#333" },
    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
    },
    input: {
        width: "100%",
        padding: "12px",
        borderRadius: "6px",
        border: "1px solid #ddd",
        fontSize: "14px",
        marginBottom: "15px",
        boxSizing: "border-box"
    },
    textarea: {
        width: "100%",
        padding: "12px",
        borderRadius: "6px",
        border: "1px solid #ddd",
        fontSize: "14px",
        marginBottom: "15px",
        minHeight: "80px",
        boxSizing: "border-box"
    },
    select: {
        width: "100%",
        padding: "12px",
        borderRadius: "6px",
        border: "1px solid #ddd",
        fontSize: "14px",
        marginBottom: "15px"
    },
    row: { display: "flex", gap: "15px" },
    col: { flex: 1 },
    label: { fontSize: "13px", color: "#666", marginBottom: "5px", display: "block" },
    postCard: {
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        padding: "15px",
        marginBottom: "15px"
    },
    postHeader: { display: "flex", gap: "10px", marginBottom: "10px" },
    postInput: {
        flex: 1,
        padding: "10px",
        borderRadius: "6px",
        border: "1px solid #ddd",
        fontSize: "14px"
    },
    candidateBox: {
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        padding: "12px",
        marginBottom: "10px"
    },
    candRow: { display: "flex", gap: "10px", marginBottom: "10px" },
    candInput: {
        flex: 1,
        padding: "10px",
        borderRadius: "6px",
        border: "1px solid #ddd",
        fontSize: "14px"
    },
    uploadRow: { display: "flex", gap: "15px" },
    uploadBox: { flex: 1 },
    uploadLabel: { fontSize: "13px", color: "#666", marginBottom: "5px", display: "block" },
    fileInput: { width: "100%", fontSize: "13px" },
    previewBox: { position: "relative", display: "inline-block" },
    preview: { width: "80px", height: "80px", objectFit: "cover", borderRadius: "6px" },
    clearBtn: {
        position: "absolute",
        top: "-8px",
        right: "-8px",
        backgroundColor: "#f44336",
        color: "white",
        border: "none",
        borderRadius: "50%",
        width: "20px",
        height: "20px",
        cursor: "pointer",
        fontSize: "10px"
    },
    removeBtn: {
        padding: "8px 12px",
        backgroundColor: "#f44336",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
    },
    addCandBtn: {
        padding: "8px 16px",
        backgroundColor: "#2196F3",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "13px"
    },
    addPostBtn: {
        padding: "8px 16px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
    },
    hint: { color: "#666", fontSize: "13px", marginBottom: "15px" },
    voterPreview: { marginTop: "15px" },
    voterCount: { color: "#4CAF50", fontWeight: "bold", marginBottom: "10px" },
    voterTable: { overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: {
        padding: "10px",
        backgroundColor: "#f5f5f5",
        textAlign: "left",
        fontSize: "13px",
        color: "#666",
        borderBottom: "1px solid #ddd"
    },
    td: { padding: "10px", fontSize: "13px", borderBottom: "1px solid #f0f0f0" },
    moreRow: { padding: "10px", color: "#888", fontSize: "13px", textAlign: "center" },
    submitBtn: {
        width: "100%",
        padding: "15px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "6px",
        fontSize: "16px",
        cursor: "pointer",
        marginBottom: "30px"
    },
    uploading: { color: "#ff9800", textAlign: "center" },
    error: { color: "red", textAlign: "center" },
    success: { color: "green", textAlign: "center" }
}