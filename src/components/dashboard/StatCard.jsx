import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ title, value, subtitle, icon: Icon, color, trend }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-200/50',
    green: 'from-emerald-500 to-emerald-600 shadow-emerald-200/50',
    orange: 'from-orange-500 to-orange-600 shadow-orange-200/50',
    purple: 'from-violet-500 to-violet-600 shadow-violet-200/50',
    sky: 'from-sky-500 to-sky-600 shadow-sky-200/50',
    rose: 'from-rose-500 to-rose-600 shadow-rose-200/50',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-800 tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`inline-flex items-center gap-1 mt-2 text-xs font-medium ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              <span>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>
              <span className="text-slate-400">vs. Vormonat</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}