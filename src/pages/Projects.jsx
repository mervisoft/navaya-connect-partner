import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FolderKanban, Search, Filter, CheckCircle2, Circle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

export default function Projects() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const { t } = useTranslation();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date'),
  });

  const filteredProjects = projects.filter(project => {
    const matchesSearch =
      project.project_number?.toLowerCase().includes(search.toLowerCase()) ||
      project.title?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-emerald-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 20) return 'bg-amber-500';
    return 'bg-slate-300';
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t('projects.title')} subtitle={t('projects.subtitle')} icon={FolderKanban} />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder={t('projects.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-white border-slate-200" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-white">
            <Filter className="h-4 w-4 mr-2 text-slate-400" />
            <SelectValue placeholder={t('common.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('projects.allStatus')}</SelectItem>
            <SelectItem value="geplant">{t('projects.statusPlanned')}</SelectItem>
            <SelectItem value="aktiv">{t('projects.statusActive')}</SelectItem>
            <SelectItem value="pausiert">{t('projects.statusPaused')}</SelectItem>
            <SelectItem value="abgeschlossen">{t('projects.statusDone')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!isLoading && filteredProjects.length === 0 ? (
        <EmptyState icon={FolderKanban} title={t('projects.noFound')} description={search || statusFilter !== 'all' ? t('projects.noFoundSearch') : t('projects.noFoundEmpty')} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse"><div className="h-5 bg-slate-100 rounded w-1/4 mb-2" /><div className="h-6 bg-slate-100 rounded w-3/4 mb-4" /><div className="h-2 bg-slate-100 rounded w-full" /></div>)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredProjects.map((project, index) => (
              <motion.div key={project.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} onClick={() => setSelectedProject(project)} className="bg-white rounded-2xl border border-slate-100 p-6 hover:border-slate-200 hover:shadow-lg transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-slate-500">{project.project_number}</span>
                  <StatusBadge status={project.status} />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2 line-clamp-1">{project.title}</h3>
                {project.description && <p className="text-sm text-slate-500 mb-4 line-clamp-2">{project.description}</p>}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">{t('projects.progress')}</span>
                    <span className="font-medium text-slate-700">{project.progress || 0}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${getProgressColor(project.progress || 0)} transition-all`} style={{ width: `${project.progress || 0}%` }} />
                  </div>
                </div>
                {(project.start_date || project.end_date) && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="h-3 w-3" />
                    {project.start_date && format(new Date(project.start_date), 'dd.MM.yy', { locale: de })}
                    {project.start_date && project.end_date && ' - '}
                    {project.end_date && format(new Date(project.end_date), 'dd.MM.yy', { locale: de })}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
                <FolderKanban className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-mono text-sm text-slate-500">{selectedProject?.project_number}</span>
                <p className="font-semibold text-slate-800">{selectedProject?.title}</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedProject && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4"><p className="text-xs text-slate-500 mb-1">{t('common.status')}</p><StatusBadge status={selectedProject.status} /></div>
                <div className="bg-slate-50 rounded-xl p-4"><p className="text-xs text-slate-500 mb-1">{t('projects.progress')}</p><p className="text-xl font-bold text-slate-800">{selectedProject.progress || 0}%</p></div>
                <div className="bg-slate-50 rounded-xl p-4"><p className="text-xs text-slate-500 mb-1">{t('projects.startDate')}</p><p className="font-medium text-slate-700">{selectedProject.start_date ? format(new Date(selectedProject.start_date), 'dd. MMMM yyyy', { locale: de }) : '-'}</p></div>
                <div className="bg-slate-50 rounded-xl p-4"><p className="text-xs text-slate-500 mb-1">{t('projects.endDate')}</p><p className="font-medium text-slate-700">{selectedProject.end_date ? format(new Date(selectedProject.end_date), 'dd. MMMM yyyy', { locale: de }) : '-'}</p></div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600 font-medium">{t('projects.totalProgress')}</span>
                  <span className="font-semibold text-slate-800">{selectedProject.progress || 0}%</span>
                </div>
                <Progress value={selectedProject.progress || 0} className="h-3" />
              </div>

              {selectedProject.description && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-2">{t('projects.description')}</p>
                  <p className="text-slate-700">{selectedProject.description}</p>
                </div>
              )}

              {selectedProject.tasks?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">{t('projects.tasks')}</h4>
                  <div className="space-y-2">
                    {selectedProject.tasks.map((task, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        {task.status === 'erledigt' ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-slate-300" />}
                        <div className="flex-1">
                          <p className={`font-medium ${task.status === 'erledigt' ? 'text-slate-500 line-through' : 'text-slate-700'}`}>{task.title}</p>
                          {task.due_date && <p className="text-xs text-slate-500">{t('projects.due', { date: format(new Date(task.due_date), 'dd.MM.yyyy', { locale: de }) })}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}