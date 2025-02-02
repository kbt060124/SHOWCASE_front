import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

interface Point {
    x: number;
    y: number;
}

interface Area {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface ImageCropperProps {
    image: string;
    onCropComplete: (croppedBlob: Blob) => void;
    onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
    image,
    onCropComplete,
    onCancel,
}) => {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(
        null
    );

    const createCroppedImage = useCallback(
        async (pixelsArea: Area) => {
            try {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = image;

                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    throw new Error("Canvas context is not available");
                }

                // 正方形のキャンバスを作成
                canvas.width = 400;
                canvas.height = 400;

                // 円形にクリップ
                ctx.beginPath();
                ctx.arc(200, 200, 200, 0, 2 * Math.PI);
                ctx.clip();

                const scaleX = img.naturalWidth / img.width;
                const scaleY = img.naturalHeight / img.height;

                ctx.drawImage(
                    img,
                    pixelsArea.x * scaleX,
                    pixelsArea.y * scaleY,
                    pixelsArea.width * scaleX,
                    pixelsArea.height * scaleY,
                    0,
                    0,
                    400,
                    400
                );

                return new Promise<Blob>((resolve, reject) => {
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                resolve(blob);
                            } else {
                                reject(new Error("Failed to create blob"));
                            }
                        },
                        "image/jpeg",
                        0.95
                    );
                });
            } catch (error) {
                console.error("画像の処理中にエラーが発生しました:", error);
                throw error;
            }
        },
        [image]
    );

    const handleCropComplete = useCallback(
        (_: Area, croppedAreaPixels: Area) => {
            setCroppedAreaPixels(croppedAreaPixels);
        },
        []
    );

    const handleConfirm = async () => {
        if (croppedAreaPixels) {
            try {
                const blob = await createCroppedImage(croppedAreaPixels);
                onCropComplete(blob);
            } catch (error) {
                console.error("切り抜き処理に失敗しました:", error);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-4 w-full max-w-md">
                <div className="relative h-80 mb-4">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={handleCropComplete}
                    />
                </div>
                <div className="flex flex-col space-y-4">
                    <div className="flex-1">
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full"
                        />
                    </div>
                    <div className="flex justify-between space-x-4">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                        >
                            キャンセル
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            確定
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageCropper;
