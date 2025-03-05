import React from "react";

interface Step2FormProps {
    username: string;
    lastName: string;
    firstName: string;
    dateOfBirth: string;
    gender: string;
    interests: string;
    introduction: string;
    setUsername: (value: string) => void;
    setLastName: (value: string) => void;
    setFirstName: (value: string) => void;
    setDateOfBirth: (value: string) => void;
    setGender: (value: string) => void;
    setInterests: (value: string) => void;
    setIntroduction: (value: string) => void;
}

export const Step2Form: React.FC<Step2FormProps> = ({
    username,
    lastName,
    firstName,
    dateOfBirth,
    gender,
    interests,
    introduction,
    setUsername,
    setLastName,
    setFirstName,
    setDateOfBirth,
    setGender,
    setInterests,
    setIntroduction,
}) => {
    const inputClassName =
        "appearance-none block w-full border-b-2 border-gray-300 focus:outline-none focus:border-blue-500";

    return (
        <div className="space-y-4">
            <div>
                <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700"
                >
                    Username
                </label>
                <input
                    id="username"
                    type="text"
                    className={inputClassName}
                    placeholder="john_doe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Last name
                    </label>
                    <input
                        id="lastName"
                        type="text"
                        className={inputClassName}
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </div>
                <div>
                    <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-gray-700"
                    >
                        First name
                    </label>
                    <input
                        id="firstName"
                        type="text"
                        className={inputClassName}
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </div>
            </div>
            <div>
                <label
                    htmlFor="dateOfBirth"
                    className="block text-sm font-medium text-gray-700"
                >
                    Date of Birth
                </label>
                <input
                    id="dateOfBirth"
                    type="date"
                    className={inputClassName}
                    value={dateOfBirth || "2000-01-01"}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                />
            </div>
            <div>
                <label
                    htmlFor="gender"
                    className="block text-sm font-medium text-gray-700"
                >
                    Gender
                </label>
                <select
                    id="gender"
                    className={inputClassName}
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div>
                <label
                    htmlFor="interests"
                    className="block text-sm font-medium text-gray-700"
                >
                    Interests
                </label>
                <input
                    id="interests"
                    type="text"
                    className={inputClassName}
                    placeholder="Car, One Piece, etc."
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                />
            </div>
            <div>
                <label
                    htmlFor="introduction"
                    className="block text-sm font-medium text-gray-700"
                >
                    Introduction
                </label>
                <textarea
                    id="introduction"
                    className={`${inputClassName} resize-none`}
                    placeholder="A brief introduction about yourself"
                    value={introduction}
                    onChange={(e) => setIntroduction(e.target.value)}
                />
            </div>
        </div>
    );
};
