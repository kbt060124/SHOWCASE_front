import React, { useState } from "react";
import { useAuth } from "@/utils/useAuth";
import { useNavigate, Link } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import api from "@/utils/axios";

const Register = () => {
    const [step, setStep] = useState(1);
    const [lastName, setLastName] = useState("");
    const [firstName, setFirstName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [username, setUsername] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [interests, setInterests] = useState("");
    const [introduction, setIntroduction] = useState("");
    const [error, setError] = useState<string | null>(null);
    const { register, loading } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false);
    const [gender, setGender] = useState("");

    const handleNext = () => {
        const error = validateStep1();
        if (error) {
            setError(error);
            return;
        }
        setError(null);
        setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (step === 1) {
            handleNext();
            return;
        }

        const error = validateStep2();
        if (error) {
            setError(error);
            return;
        }
        setError(null);

        try {
            // 1. ユーザー登録
            console.log("登録開始");
            console.log("送信データ:", {
                email,
                password,
                password_confirmation: passwordConfirmation,
            });

            const registerResult = await register({
                email,
                password,
                password_confirmation: passwordConfirmation,
            }).catch((err) => {
                console.error("Register function error:", err);
                throw err;
            });

            console.log("registerResult:", registerResult);

            if (!registerResult) {
                console.error("Register result is undefined");
                setError("登録処理に失敗しました");
                return;
            }

            if (registerResult.success && registerResult.user) {
                console.log("ユーザー登録成功:", registerResult.user);
                // 2. プロフィール作成
                const profileData = {
                    nickname: username,
                    last_name: lastName,
                    first_name: firstName,
                    birthday: dateOfBirth,
                    introduction: introduction,
                    attribute: interests,
                    gender: gender,
                };
                console.log("プロフィールデータ:", profileData);

                try {
                    console.log("プロフィール作成開始");
                    const response = await api.post(
                        `/api/profile/create/${registerResult.user.id}`,
                        profileData
                    );
                    console.log("プロフィール作成レスポンス:", response);

                    if (response.status === 201) {
                        console.log("プロフィール作成成功");
                        // 3. ルーム作成
                        try {
                            console.log("ルーム作成開始");
                            const { data } = await api.post("api/room/create");
                            console.log("ルーム作成レスポンス:", data);
                            if (data.room) {
                                // 4. ルーム情報の取得とmainstageへの遷移
                                try {
                                    const roomResponse = await api.get(
                                        `/api/room/${registerResult.user.id}`
                                    );
                                    console.log(
                                        "ルーム情報取得:",
                                        roomResponse.data
                                    );
                                    if (roomResponse.data.rooms) {
                                        navigate(
                                            `/mainstage/${roomResponse.data.rooms[0].id}`
                                        );
                                    }
                                } catch (error) {
                                    console.error("ルーム取得エラー:", error);
                                    setError("ルーム情報の取得に失敗しました");
                                }
                            }
                        } catch (error) {
                            console.error("ルーム作成エラー:", error);
                            setError("ルームの作成に失敗しました");
                        }
                    }
                } catch (error) {
                    console.error("プロフィール作成エラー:", error);
                    setError("プロフィールの作成に失敗しました");
                }
            } else {
                console.error("Register failed with result:", registerResult);
                setError(
                    "ユーザー登録に失敗しました。詳細: " +
                        JSON.stringify(registerResult)
                );
            }
        } catch (error: any) {
            console.error("登録エラー詳細:", {
                error,
                message: error.message,
                response: error.response,
                stack: error.stack,
            });
            setError(
                error.response?.data?.message ||
                    error.message ||
                    "アカウントの作成に失敗しました"
            );
        }
    };

    const validateStep1 = () => {
        if (!email.trim()) {
            return "メールアドレスを入力してください";
        }
        if (!password) {
            return "パスワードを入力してください";
        }
        if (!passwordConfirmation) {
            return "パスワード（確認）を入力してください";
        }
        if (password !== passwordConfirmation) {
            return "パスワードが一致しません";
        }
        // メールアドレスの形式チェック
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return "有効なメールアドレスを入力してください";
        }
        // パスワードの最小文字数チェック
        if (password.length < 8) {
            return "パスワードは8文字以上で入力してください";
        }
        return null;
    };

    const validateStep2 = () => {
        if (!username.trim()) {
            return "ユーザー名を入力してください";
        }
        if (!dateOfBirth) {
            return "生年月日を入力してください";
        }
        if (!gender) {
            return "性別を選択してください";
        }
        return null;
    };

    const handleBack = () => {
        setStep(1);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="max-w-md w-full space-y-6 p-8 relative">
                <h1 className="text-2xl font-semibold text-center mb-2">
                    Create an account
                </h1>
                <p className="text-center text-gray-600 text-sm mb-8">
                    Begin your spatial design journey today!
                </p>

                <div className="flex justify-center mb-8">
                    <div className="flex items-center space-x-2">
                        <div
                            className={`w-8 h-8 rounded-full ${
                                step === 1
                                    ? "bg-blue-600 text-white"
                                    : "bg-green-500 text-white"
                            } flex items-center justify-center`}
                        >
                            {step === 1 ? "1" : "✓"}
                        </div>
                        <div className="w-16 h-[2px] bg-gray-200"></div>
                        <div
                            className={`w-8 h-8 rounded-full ${
                                step === 2
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-400"
                            } flex items-center justify-center`}
                        >
                            2
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {step === 1 ? (
                        <div className="space-y-4">
                            <div>
                                <input
                                    type="email"
                                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="E-mail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    <VisibilityIcon />
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type={
                                        showPasswordConfirmation
                                            ? "text"
                                            : "password"
                                    }
                                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Confirm Password"
                                    value={passwordConfirmation}
                                    onChange={(e) =>
                                        setPasswordConfirmation(e.target.value)
                                    }
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    onClick={() =>
                                        setShowPasswordConfirmation(
                                            !showPasswordConfirmation
                                        )
                                    }
                                >
                                    <VisibilityIcon />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <input
                                        type="text"
                                        className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Last name"
                                        value={lastName}
                                        onChange={(e) =>
                                            setLastName(e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="First name"
                                        value={firstName}
                                        onChange={(e) =>
                                            setFirstName(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                            <div>
                                <input
                                    type="date"
                                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Date of Birth"
                                    value={dateOfBirth}
                                    onChange={(e) =>
                                        setDateOfBirth(e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <select
                                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                >
                                    <option value="">性別を選択</option>
                                    <option value="male">男性</option>
                                    <option value="female">女性</option>
                                    <option value="other">その他</option>
                                    <option value="no_answer">
                                        回答しない
                                    </option>
                                </select>
                            </div>
                            <div>
                                <input
                                    type="text"
                                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Interests"
                                    value={interests}
                                    onChange={(e) =>
                                        setInterests(e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <textarea
                                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-none"
                                    placeholder="Introduction"
                                    value={introduction}
                                    onChange={(e) =>
                                        setIntroduction(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-6"
                    >
                        {loading
                            ? "Creating account..."
                            : step === 1
                            ? "Next"
                            : "Sign Up"}
                    </button>
                </form>

                {step === 2 && (
                    <button
                        type="button"
                        onClick={handleBack}
                        className="w-full text-blue-600 hover:text-blue-500 text-sm mt-4"
                    >
                        Back to previous step
                    </button>
                )}

                <div className="text-sm text-center mt-6">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-blue-600 hover:text-blue-500"
                    >
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
