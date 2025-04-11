import React, { useState } from "react";
import { useAuth } from "@/utils/useAuth";
import { useNavigate, Link } from "react-router-dom";
import api from "@/utils/axios";
import { Step1Form } from "./components/Step1Form";
import { Step2Form } from "./components/Step2Form";

const Register = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false);
    const [username, setUsername] = useState("");
    const [lastName, setLastName] = useState("");
    const [firstName, setFirstName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [gender, setGender] = useState("");
    const [interests, setInterests] = useState("");
    const [introduction, setIntroduction] = useState("");
    const [error, setError] = useState<string | null>(null);
    const { register, loading } = useAuth();
    const navigate = useNavigate();

    const handleNext = () => {
        const error = validateStep1();
        if (error) {
            setError(error);
            return;
        }
        setError(null);
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
    };

    const validateStep1 = () => {
        if (!email.trim()) {
            return "Please enter your email address";
        }
        if (!password) {
            return "Please enter your password";
        }
        if (!passwordConfirmation) {
            return "Please confirm your password";
        }
        if (password !== passwordConfirmation) {
            return "Passwords do not match";
        }
        // メールアドレスの形式チェック
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return "Please enter a valid email address";
        }
        // パスワードの最小文字数チェック
        if (password.length < 8) {
            return "Password must be at least 8 characters long";
        }
        return null;
    };

    const validateStep2 = () => {
        if (!username.trim()) {
            return "Please enter your username";
        }
        if (!lastName.trim()) {
            return "Please enter your last name";
        }
        if (!firstName.trim()) {
            return "Please enter your first name";
        }
        if (!dateOfBirth) {
            return "Please enter your date of birth";
        }
        if (!gender) {
            return "Please select your gender";
        }
        return null;
    };

    const createProfile = async (userId: number, profileData: any) => {
        const response = await api.post(
            `/api/profile/create/${userId}`,
            profileData
        );
        if (response.status !== 201) {
            throw new Error("Failed to create profile");
        }
    };

    const createAndGetRoom = async (userId: number) => {
        const { data } = await api.post("api/room/create");
        if (!data.room) {
            throw new Error("Failed to create room");
        }

        const roomResponse = await api.get(`/api/room/${userId}`);
        if (!roomResponse.data.rooms) {
            throw new Error("Failed to get room information");
        }
        return roomResponse.data.rooms[0].id;
    };

    const handleRegistration = async () => {
        const registerResult = await register({
            email,
            password,
            password_confirmation: passwordConfirmation,
        });

        if (!registerResult?.success || !registerResult.user) {
            throw new Error(
                "User registration failed. Details: " +
                    JSON.stringify(registerResult)
            );
        }

        const profileData = {
            nickname: username,
            last_name: lastName,
            first_name: firstName,
            birthday: dateOfBirth,
            introduction: introduction,
            attribute: interests,
            gender: gender,
        };

        await createProfile(registerResult.user.id, profileData);
        const roomId = await createAndGetRoom(registerResult.user.id);
        return roomId;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (step === 1) {
            handleNext();
            return;
        }

        const validationError = validateStep2();
        if (validationError) {
            setError(validationError);
            return;
        }
        setError(null);

        try {
            const roomId = await handleRegistration();
            navigate(`/mainstage/${roomId}`);
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                    error.message ||
                    "Failed to create account"
            );
        }
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
                        <Step1Form
                            email={email}
                            password={password}
                            passwordConfirmation={passwordConfirmation}
                            showPassword={showPassword}
                            showPasswordConfirmation={showPasswordConfirmation}
                            setEmail={setEmail}
                            setPassword={setPassword}
                            setPasswordConfirmation={setPasswordConfirmation}
                            setShowPassword={setShowPassword}
                            setShowPasswordConfirmation={
                                setShowPasswordConfirmation
                            }
                        />
                    ) : (
                        <Step2Form
                            username={username}
                            lastName={lastName}
                            firstName={firstName}
                            dateOfBirth={dateOfBirth}
                            gender={gender}
                            interests={interests}
                            introduction={introduction}
                            setUsername={setUsername}
                            setLastName={setLastName}
                            setFirstName={setFirstName}
                            setDateOfBirth={setDateOfBirth}
                            setGender={setGender}
                            setInterests={setInterests}
                            setIntroduction={setIntroduction}
                        />
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
