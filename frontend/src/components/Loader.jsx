
import React from 'react';
import './Loader.css';

const Loader = ({ scale = 1, fullScreen = true }) => {
    return (
        <div
            className={fullScreen ? "loader-container" : ""}
            style={{
                transform: `scale(${scale})`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: fullScreen ? '100%' : 'auto',
                height: fullScreen ? '100%' : 'auto'
            }}
        >
            <div className="loader">
                <div className="box1"></div>
                <div className="box2"></div>
                <div className="box3"></div>
            </div>
        </div>
    );
};

export default Loader;
