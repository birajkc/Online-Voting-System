import axios from "axios"

const API = axios.create({
    baseURL: "http://localhost:5000/api"
})

// Automatically attach token to every request
API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token")
    if (token) {
        req.headers.Authorization = `Bearer ${token}`
    }
    return req
})

// Auth
export const adminLogin = (data) => API.post("/auth/login", data)
export const adminRegister = (data) => API.post("/auth/register", data)

// Election
export const createElection = (data) => API.post("/election/create", data)
export const getAllElections = () => API.get("/election/all")
export const getElection = (id) => API.get(`/election/${id}`)

// Voter
export const addVoters = (data) => API.post("/voter/add", data)
export const sendOTP = (data) => API.post("/voter/send-otp", data)
export const verifyOTP = (data) => API.post("/voter/verify-otp", data)
export const voterLogin = (data) => API.post("/voter/login", data)

// Vote
export const castVote = (data) => API.post("/vote/cast", data)
export const getResults = (electionId) => API.get(`/vote/results/${electionId}`)

// Upload
export const uploadImage = (formData) => API.post("/upload/image", formData)

// Delete Election
export const deleteElection = (id) => API.delete(`/election/${id}`)
