import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div>
            <h2>ホームページ</h2>
            <nav>
                <ul>
                    <li><Link to="/">ホーム</Link></li>
                    <li><Link to="/company">会社概要</Link></li>
                </ul>
            </nav>
        </div>
    );
}

export default Home;