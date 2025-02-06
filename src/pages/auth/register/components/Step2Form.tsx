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
        "appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500";

    return (
        <div className="space-y-4">
            <div>
                <input
                    type="text"
                    className={inputClassName}
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <input
                        type="text"
                        className={inputClassName}
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </div>
                <div>
                    <input
                        type="text"
                        className={inputClassName}
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </div>
            </div>
            <div>
                <input
                    type="date"
                    className={inputClassName}
                    placeholder="Date of Birth"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                />
            </div>
            <div>
                <select
                    className={inputClassName}
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                >
                    <option value="">性別を選択</option>
                    <option value="male">男性</option>
                    <option value="female">女性</option>
                    <option value="other">その他</option>
                    <option value="no_answer">回答しない</option>
                </select>
            </div>
            <div>
                <input
                    type="text"
                    className={inputClassName}
                    placeholder="Interests"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                />
            </div>
            <div>
                <textarea
                    className={`${inputClassName} min-h-[100px] resize-none`}
                    placeholder="Introduction"
                    value={introduction}
                    onChange={(e) => setIntroduction(e.target.value)}
                />
            </div>
        </div>
    );
};
