import React from 'react';
import { motion } from 'framer-motion';

/**
 * An animated gradient effect that creates flowing motion
 * @param {Object} props - Component props
 * @param {string} props.className - Additional classes
 * @param {number} props.duration - Animation duration in seconds
 * @param {string} props.baseColor - Base color (tailwind class)
 * @param {string} props.highlightColor - Highlight color (tailwind class)
 * @param {string} props.direction - Animation direction ('ltr', 'rtl', 'ttb', 'btt')
 */
export const MovingGradient = ({
    className = "",
    duration = 8,
    baseColor = "bg-indigo-500",
    highlightColor = "bg-purple-500",
    direction = "ltr",
    children
}) => {
    // Determine animation properties based on direction
    const getAnimationProperties = () => {
        switch (direction) {
            case 'rtl': // right to left
                return {
                    initial: { x: '100%' },
                    animate: { x: '-100%' },
                    className: `absolute inset-0 ${baseColor}/10`
                };
            case 'ttb': // top to bottom
                return {
                    initial: { y: '-100%' },
                    animate: { y: '100%' },
                    className: `absolute inset-0 ${baseColor}/10`
                };
            case 'btt': // bottom to top
                return {
                    initial: { y: '100%' },
                    animate: { y: '-100%' },
                    className: `absolute inset-0 ${baseColor}/10`
                };
            default: // left to right
                return {
                    initial: { x: '-100%' },
                    animate: { x: '100%' },
                    className: `absolute inset-0 ${baseColor}/10`
                };
        }
    };

    const animProps = getAnimationProperties();

    return (
        <div className={`relative overflow-hidden flex items-center justify-center ${className}`}>
            {/* Base background layer */}
            <div className={`absolute inset-0 ${baseColor}/5`}></div>

            {/* Animated gradient layers */}
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    className={animProps.className}
                    initial={animProps.initial}
                    animate={animProps.animate}
                    transition={{
                        repeat: Infinity,
                        duration: duration + i,
                        ease: "linear",
                        delay: i * (duration / 5)
                    }}
                >
                    <div className={`absolute inset-0 opacity-70 blur-3xl`}>
                        {/* Animated gradient blobs */}
                        <div className={`absolute h-[50%] w-[40%] rounded-full ${highlightColor}/20 -top-[10%] -left-[5%]`}></div>
                        <div className={`absolute h-[30%] w-[30%] rounded-full ${highlightColor}/30 top-[30%] left-[30%]`}></div>
                        <div className={`absolute h-[40%] w-[40%] rounded-full ${baseColor}/30 bottom-[10%] right-[10%]`}></div>
                        <div className={`absolute h-[20%] w-[35%] rounded-full ${baseColor}/20 top-[10%] right-[20%]`}></div>
                    </div>
                </motion.div>
            ))}

            {/* Floating particles */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={`particle-${i}`}
                    className={`absolute rounded-full ${i % 2 === 0 ? highlightColor : baseColor}/20 backdrop-blur-3xl`}
                    style={{
                        width: `${Math.random() * 6 + 2}px`,
                        height: `${Math.random() * 6 + 2}px`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        filter: 'blur(1px)'
                    }}
                    animate={{
                        y: [0, -15, 0],
                        x: [0, Math.random() * 10 - 5, 0],
                        opacity: [0.4, 0.8, 0.4]
                    }}
                    transition={{
                        duration: 3 + Math.random() * 3,
                        repeat: Infinity,
                        delay: Math.random() * 2
                    }}
                />
            ))}

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center w-full">
                {children}
            </div>
        </div>
    );
};

/**
 * A radial animated gradient effect
 */
export const PulsingGradient = ({
    className = "",
    baseColor = "bg-indigo-600",
    highlightColor = "bg-purple-600",
    children
}) => {
    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Radial gradient base */}
            <div className={`absolute inset-0 ${baseColor}/20`}></div>

            {/* Pulsing circles */}
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0.7 }}
                >
                    <motion.div
                        className={`${highlightColor}/10 rounded-full`}
                        initial={{ scale: 0.5, opacity: 0.5 }}
                        animate={{
                            scale: [0.5, 1.5, 0.5],
                            opacity: [0.1, 0.3, 0.1]
                        }}
                        transition={{
                            duration: 8 + i * 2,
                            ease: "easeInOut",
                            repeat: Infinity,
                            delay: i * 2
                        }}
                        style={{
                            width: '60%',
                            height: '60%',
                            filter: 'blur(50px)'
                        }}
                    />
                </motion.div>
            ))}

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};
