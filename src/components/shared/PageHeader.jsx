import React from 'react';
import { motion } from 'framer-motion';

export default function PageHeader({ title, subtitle, icon: Icon, actions }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] flex items-center justify-center shadow-lg shadow-slate-300/30">
              <Icon className="h-6 w-6 text-sky-300" />
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">{title}</h1>
            {subtitle && <p className="text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </motion.div>
  );
}