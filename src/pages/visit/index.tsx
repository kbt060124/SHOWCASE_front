import { useEffect, useState, useRef } from "react";
import api from "@/utils/axios";
import SearchIcon from "@mui/icons-material/Search";
import { useAuth } from "@/utils/useAuth";
import { useNavigate } from "react-router-dom";
import { MENU_BAR_HEIGHT } from "@/components/MenuBar";

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
    const { user } = useAuth();
    const navigate = useNavigate();
    const [allProfiles, setAllProfiles] = useState<SearchResult[]>([]);
    const searchBarRef = useRef<HTMLDivElement>(null);
    const [searchBarHeight, setSearchBarHeight] = useState(0);

    useEffect(() => {
        const fetchAllProfiles = async () => {
            try {
                const response = await api.get("/api/profile/searchAll");
                const filteredProfiles = response.data.users.filter(
                    (profile: SearchResult) => profile.id !== user?.id
                );
                setAllProfiles(filteredProfiles);
            } catch (error) {
                console.error("ユーザー取得に失敗しました:", error);
                setAllProfiles([]);
            }
        };
        fetchAllProfiles();
    }, [user?.id]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery) {
                handleSearch();
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    useEffect(() => {
        if (searchBarRef.current) {
            setSearchBarHeight(searchBarRef.current.offsetHeight);
        }
    }, []);

    const handleSearch = async () => {
        try {
            const response = await api.get("/api/profile/search", {
                params: { query: searchQuery },
            });
            const filteredResults = response.data.filter(
                (result: SearchResult) => result.id !== user?.id
            );
            setSearchResults(filteredResults);
        } catch (error) {
            console.error("ユーザー検索に失敗しました:", error);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* 検索バー */}
            <div
                ref={searchBarRef}
                className="sticky top-0 bg-white shadow-sm z-10"
            >
                <div className="max-w-7xl mx-auto px-4 pt-6 pb-4">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search"
                            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <SearchIcon />
                        </div>
                    </div>
                </div>
            </div>

            {/* メインコンテンツエリア */}
            <div
                className="max-w-7xl mx-auto px-6 py-4"
                style={{ paddingBottom: `${MENU_BAR_HEIGHT}px` }}
            >
                {/* プロフィール一覧 */}
                {allProfiles.map((profile) => (
                    <div key={profile.id}>
                        <a
                            href={`/profile/${profile.id}`}
                            onClick={(e) => {
                                e.preventDefault();
                                navigate(`/profile/${profile.id}`, {
                                    state: { fromVisit: true },
                                });
                            }}
                            className="block py-2"
                        >
                            <div className="flex items-center space-x-4">
                                <img
                                    src={
                                        profile.profile?.user_thumbnail ===
                                        "default_thumbnail.png"
                                            ? "/images/user/default_thumbnail.png"
                                            : `${
                                                  import.meta.env.VITE_S3_URL
                                              }/user/${profile.id}/${
                                                  profile.profile
                                                      ?.user_thumbnail
                                              }`
                                    }
                                    alt={`${profile.profile?.nickname}のサムネイル`}
                                    className={`w-16 h-16 rounded-full object-cover ${
                                        profile.profile?.user_thumbnail ===
                                            "default_thumbnail.png" &&
                                        "bg-gray-100 p-2"
                                    }`}
                                />
                                <div>
                                    <div className="font-medium text-gray-900">
                                        {profile.profile?.nickname}
                                    </div>
                                </div>
                            </div>
                        </a>
                        <div className="border-b border-gray-200"></div>
                    </div>
                ))}
            </div>

            {/* 検索結果オーバーレイ */}
            {searchResults.length > 0 && (
                <div
                    className="absolute left-0 right-0 bg-[#F8F8F8] shadow-lg"
                    style={{
                        top: searchBarHeight,
                        height: "auto",
                    }}
                >
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        {searchResults.map((result, index) => (
                            <div key={result.id}>
                                <a
                                    href={`/profile/${result.id}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigate(`/profile/${result.id}`, {
                                            state: { fromVisit: true },
                                        });
                                    }}
                                    className="block py-2"
                                >
                                    <div className="flex items-center space-x-4">
                                        <img
                                            src={
                                                result.profile
                                                    ?.user_thumbnail ===
                                                "default_thumbnail.png"
                                                    ? "/images/user/default_thumbnail.png"
                                                    : `${
                                                          import.meta.env
                                                              .VITE_S3_URL
                                                      }/user/${result.id}/${
                                                          result.profile
                                                              ?.user_thumbnail
                                                      }`
                                            }
                                            alt={`${result.profile?.nickname}のサムネイル`}
                                            className={`w-16 h-16 rounded-full object-cover ${
                                                result.profile
                                                    ?.user_thumbnail ===
                                                    "default_thumbnail.png" &&
                                                "bg-gray-100 p-2"
                                            }`}
                                        />
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {result.profile?.nickname}
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {result.profile?.last_name}{" "}
                                                {result.profile?.first_name}
                                            </p>
                                        </div>
                                    </div>
                                </a>
                                {index < searchResults.length - 1 && (
                                    <div className="border-b border-gray-200"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Visit;
