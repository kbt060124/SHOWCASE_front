import { useState, useEffect, useRef } from "react";
import SideMenu from "./SideMenu";

interface HeaderProps {
    nickname?: string;
}

const Header = ({ nickname }: HeaderProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen]);

    return (
        <header className="bg-white">
            <div className="max-w-7xl mx-auto pr-4 sm:pr-6 lg:pr-8">
                <div className="flex justify-between items-center h-16">
                    {/* ロゴ */}
                    <div className="flex-shrink-0">
                        <a href="/" className="block">
                            <img
                                src="/images/Logo_Black.png"
                                alt="KÜKANCASE"
                                className="h-16"
                            />
                        </a>
                    </div>

                    {/* ハンバーガーメニュー */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 rounded-md text-gray-700 hover:text-gray-900 focus:outline-none"
                    >
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>

                    {/* サイドメニュー */}
                    <SideMenu
                        isOpen={isMenuOpen}
                        onClose={() => setIsMenuOpen(false)}
                        menuRef={menuRef}
                        nickname={nickname}
                    />
                </div>
            </div>
        </header>
    );
};

export default Header;
