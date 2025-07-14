'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const ImageWithFallback = (props) => {
    const { src, fallbackSrc, ...rest } = props;
    const [error, setError] = useState(null);

    useEffect(() => {
        setError(null);
    }, [src]);

    return (
        <Image
            width={600}
            height={400}
            alt={props.alt || 'article image'}
            onError={setError}
            src={error ? (fallbackSrc || 'https://placehold.co/600x400/e2e8f0/e2e8f0?text=Gambar') : src}
            {...rest}
            unoptimized 
        />
    );
};

export default ImageWithFallback;
