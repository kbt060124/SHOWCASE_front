import React from 'react';
import { Link } from 'react-router-dom';

function CompanyProfile() {
    return (
        <div>
            <h2>会社概要</h2>
            <p>ここに会社の詳細情報を記載します。</p>
            <Link to="/">ホームに戻る</Link>
        </div>
    );
}

export default CompanyProfile;