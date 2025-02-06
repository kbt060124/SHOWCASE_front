import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/useAuth";
import api from "@/utils/axios";

interface CreateProfileForm {
    nickname: string;
    last_name: string;
    first_name: string;
    attribute: string;
    introduction: string;
    birthday: string;
    gender: string;
}

const CreateProfile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState<CreateProfileForm>({
        nickname: "",
        last_name: "",
        first_name: "",
        attribute: "",
        introduction: "",
        birthday: "",
        gender: "",
    });

    console.log(user);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post(
                `/api/profile/create/${user?.id}`,
                form
            );

            if (response.status === 201) {
                try {
                    const { data } = await api.get(`/api/room/${user?.id}`);
                    if (data.rooms) {
                        navigate(`/mainstage/${data.rooms[0].id}`);
                    }
                } catch (error) {
                    console.error("ルーム取得エラー:", error);
                }
            }
        } catch (error) {
            console.error("プロフィールの作成に失敗しました:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
                <h1 className="text-2xl font-bold mb-6">プロフィール作成</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            ニックネーム<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={form.nickname}
                            onChange={(e) =>
                                setForm({ ...form, nickname: e.target.value })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                姓<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={form.last_name}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        last_name: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                名<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={form.first_name}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        first_name: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            生年月日<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            required
                            value={form.birthday}
                            onChange={(e) =>
                                setForm({ ...form, birthday: e.target.value })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            性別<span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={form.gender}
                            onChange={(e) =>
                                setForm({ ...form, gender: e.target.value })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">選択してください</option>
                            <option value="male">男性</option>
                            <option value="female">女性</option>
                            <option value="other">その他</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            属性（任意）
                        </label>
                        <input
                            type="text"
                            value={form.attribute}
                            onChange={(e) =>
                                setForm({ ...form, attribute: e.target.value })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            自己紹介（任意）
                        </label>
                        <textarea
                            value={form.introduction}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    introduction: e.target.value,
                                })
                            }
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
                    >
                        プロフィールを作成
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateProfile; // デフォルトエクスポートを確実に追加
