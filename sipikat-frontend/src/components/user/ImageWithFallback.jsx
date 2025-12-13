'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const ImageWithFallback = ({ src, fallbackSrc, alt, ...props }) => {
    const [error, setError] = useState(null);

    useEffect(() => {
        setError(null);
    }, [src]);
    const dimensions = props.fill ? {} : { width: 600, height: 400 };

    return (
        <Image
            alt={alt || 'article image'}
            onError={setError}
            src={error ? (fallbackSrc || 'https://placehold.co/600x400/e2e8f0/94a3b8?text=No+Image') : src}
            {...dimensions}
            {...props}
            unoptimized={props.unoptimized} 
        />
    );
};

export default ImageWithFallback;