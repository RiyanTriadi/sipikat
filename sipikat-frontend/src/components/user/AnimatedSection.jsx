'use client';

import { motion } from 'framer-motion';

export default function AnimatedSection({ children, className }) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className={className}
        >
            {children}
        </motion.section>
    );
}