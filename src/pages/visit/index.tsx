import { useEffect, useState } from "react";
import api from "@/utils/axios";

interface SearchResult {
    id: number;
    profile?: {
        nickname?: string;
        last_name?: string;
        first_name?: string;
        user_thumbnail?: string;
    };
}

const Visit = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery) {
                handleSearch();
            } else {
                setSearchResults([]);
            }
        }, 500); // 500ミリ秒のディレイ

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSearch = async () => {
        try {
            const response = await api.get("/api/profile/search", {
                params: { query: searchQuery },
            });
            setSearchResults(response.data);
        } catch (error) {
            console.error("ユーザー検索に失敗しました:", error);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* ユーザー検索セクション */}
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <h2 className="text-xl font-bold mb-6">ユーザー検索</h2>
                <div className="flex gap-4 mb-6">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ニックネームで検索"
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        検索
                    </button>
                </div>

                {/* 検索結果 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.map((result) => (
                        <div
                            key={result.id}
                            className="bg-white rounded-lg shadow p-6"
                        >
                            <a
                                href={`/profile/${result.id}`}
                                className="flex items-center space-x-4"
                            >
                                <img
                                    src={
                                        result.profile?.user_thumbnail &&
                                        result.profile.user_thumbnail !==
                                            "default_thumbnail.png"
                                            ? `${
                                                  import.meta.env.VITE_S3_URL
                                              }/user/${result.id}/${
                                                  result.profile.user_thumbnail
                                              }`
                                            : "/default-avatar.png"
                                    }
                                    alt={`${result.profile?.nickname}のサムネイル`}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                                <div>
                                    <h3 className="font-bold">
                                        {result.profile?.nickname}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {result.profile?.last_name}{" "}
                                        {result.profile?.first_name}
                                    </p>
                                </div>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Visit;
