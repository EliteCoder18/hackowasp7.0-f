import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimationControls, useInView } from 'framer-motion';
import { cn } from '../lib/utils';

const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;

const Sparkle = ({ size, color, style }) => {
    const paths = [
        "M10 0L13.09 6.26L20 7.27L15 12.14L16.18 19.02L10 15.77L3.82 19.02L5 12.14L0 7.27L6.91 6.26L10 0Z",
        "M11.65 4.23L12.91 7.42L16.38 7.93L13.94 10.47L14.67 14.08L11.65 12.31L8.63 14.08L9.36 10.47L6.92 7.93L10.39 7.42L11.65 4.23Z"
    ];
    const animationControls = useAnimationControls();

    useEffect(() => {
        animationControls.start({
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            rotate: [0, random(-30, 30)],
            transition: {
                duration: random(1.5, 2.5),
                repeat: Infinity,
                delay: random(0, 3),
                ease: "easeInOut"
            }
        });
    }, []);

    return (
        <motion.svg
            width={size}
            height={size}
            viewBox="0 0 20 20"
            style={style}
            animate={animationControls}
        >
            <motion.path
                d={paths[Math.floor(Math.random() * paths.length)]}
                fill={color}
            />
        </motion.svg>
    );
};

export const SparklesCore = ({
    id,
    background,
    minSize = 10,
    maxSize = 20,
    particleCount = 20,
    particleColor = "#FFF",
    className,
    particleDensity = 1.2,
}) => {
    const containerRef = useRef(null);
    const [sparkles, setSparkles] = useState([]);
    const isInView = useInView(containerRef);

    useEffect(() => {
        if (!isInView || !containerRef.current) return;

        const { width, height } = containerRef.current.getBoundingClientRect();
        const newSparkles = [];
        const density = particleDensity; // particles per 100 square pixels
        const scaledParticleCount = Math.min(
            particleCount,
            Math.floor((width * height) / 10000) * density
        );

        for (let i = 0; i < scaledParticleCount; i++) {
            const size = random(minSize, maxSize);
            newSparkles.push({
                id: i,
                createdAt: Date.now(),
                size,
                color: particleColor,
                style: {
                    position: "absolute",
                    top: `${random(0, height)}px`,
                    left: `${random(0, width)}px`,
                    zIndex: random(1, 3),
                },
            });
        }

        setSparkles(newSparkles);
    }, [isInView, particleCount, minSize, maxSize, particleColor, particleDensity]);

    return (
        <div
            ref={containerRef}
            id={id}
            className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}
        >
            {background && background}
            {sparkles.map(sparkle => (
                <Sparkle
                    key={sparkle.id}
                    size={sparkle.size}
                    color={sparkle.color}
                    style={sparkle.style}
                />
            ))}
        </div>
    );
};
