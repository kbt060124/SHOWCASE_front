import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost", // Docker環境のバックエンドURL
    headers: {
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/json",
    },
    withCredentials: true, // クロスドメインでのクッキー送信を有効化
});

export default api;
