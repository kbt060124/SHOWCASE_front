import React from "react";
import { useAuth } from "@/utils/useAuth";
import { useNavigate } from "react-router-dom";

interface SideMenuProps {
    isOpen: boolean;
    onClose: () => void;
    menuRef: React.RefObject<HTMLDivElement>;
    nickname?: string;
}

function SideMenu({
    isOpen,
    menuRef,
    nickname = "User",
}: SideMenuProps) {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("ログアウトに失敗しました:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* オーバーレイ */}
            <div className="fixed inset-0 bg-black bg-opacity-50" />

            {/* メニュー本体 */}
            <div
                ref={menuRef}
                className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
            >
                <div className="p-6">
                    {/* ユーザー名 */}
                    <div className="mb-8 text-xl font-medium text-gray-900">
                        {nickname}
                    </div>

                    {/* メニューの内容 */}
                    <nav className="space-y-6">
                        <a
                            href="/change-password"
                            className="flex items-center text-gray-700 hover:text-gray-900"
                        >
                            <img
                                src="/images/changepassword_black.png"
                                alt="Change password icon"
                                className="w-5 h-5 mr-3"
                            />
                            Change password
                        </a>
                        <button
                            onClick={handleLogout}
                            className="flex items-center text-[#8C252B] hover:text-[#6b1c21] w-full"
                        >
                            <img
                                src="/images/logout_KCRed.png"
                                alt="Logout icon"
                                className="w-5 h-5 mr-3"
                            />
                            Log out
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
}

export default SideMenu;
