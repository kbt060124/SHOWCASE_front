import React from "react";

interface S3ImageProps {
    imageUrl: string;
    alt: string;
}

const S3Image: React.FC<S3ImageProps> = ({ imageUrl, alt }) => {
    return (
        <div>
            <h2>S3の画像</h2>
            <img src={imageUrl} alt={alt} />
        </div>
    );
};

export default S3Image;
