import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function Home() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        const success = await logout();
        if (success) {
            navigate("/login");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ヘッダー */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                        ダッシュボード
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">{user?.name}</span>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-red-600 hover:text-red-800"
                        >
                            ログアウト
                        </button>
                    </div>
                </div>
            </header>

            {/* メインコンテンツ */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Studioカード */}
                    <Link
                        to="/studio"
                        className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-indigo-100 p-3 rounded-lg">
                                <svg
                                    className="w-6 h-6 text-indigo-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Studio
                                </h2>
                                <p className="text-gray-600">
                                    3Dモデルを編集・閲覧する
                                </p>
                            </div>
                        </div>
                    </Link>

                    {/* Warehouseカード */}
                    <Link
                        to="/warehouse"
                        className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-green-100 p-3 rounded-lg">
                                <svg
                                    className="w-6 h-6 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Warehouse
                                </h2>
                                <p className="text-gray-600">
                                    3Dモデルを管理・整理する
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>
            </main>
        </div>
    );
}

export default Home;
