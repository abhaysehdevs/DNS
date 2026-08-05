'use client';

import React from 'react';

interface SecureImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    containerClassName?: string;
}

export function SecureImage({ src, alt, className = '', containerClassName = '', ...props }: SecureImageProps) {
    const handleRightClick = (e: React.MouseEvent) => {
        e.preventDefault();
    };

    const handleDragStart = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <div 
            className={`relative overflow-hidden select-none ${containerClassName}`} 
            onContextMenu={handleRightClick}
        >
            <img 
                src={src} 
                alt={alt} 
                loading="lazy"
                decoding="async"
                onDragStart={handleDragStart}
                className={`select-none pointer-events-none ${className}`}
                {...props}
            />
            {/* Transparent mouse event catcher overlay */}
            <div 
                className="absolute inset-0 bg-transparent select-none cursor-default z-[2]" 
                onContextMenu={handleRightClick}
                onDragStart={handleDragStart}
            />
        </div>
    );
}
