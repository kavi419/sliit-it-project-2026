import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      when: 'beforeChildren',
      staggerChildren: 0.08,
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } },
};

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-mesh">
      <Sidebar />
      <Navbar />

      <main className="pl-64 pt-20">
        <motion.div
          className="p-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Export childVariants so Dashboard can use them via context or just use in-file */}
          <Outlet context={{ childVariants }} />
        </motion.div>
      </main>
    </div>
  );
};

export { childVariants };
export default MainLayout;
