import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Files, Download, Search, Filter, FileText, File, FileSpreadsheet, FileImage, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categoryLabels = {
  vertrag: 'Verträge',
  agb: 'AGB',
  preisliste: 'Preislisten',
  handbuch: 'Handbücher',
  sonstiges: 'Sonstiges',
};

const categoryColors = {
  vertrag: 'from-emerald-500 to-emerald-600',
  agb: 'from-blue-500 to-blue-600',
  preisliste: 'from-amber-500 to-amber-600',
  handbuch: 'from-violet-500 to-violet-600',
  sonstiges: 'from-slate-500 to-slate-600',
};

export default function Documents() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-created_date'),
  });

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.title?.toLowerCase().includes(search.toLowerCase()) ||
      doc.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (url, category) => {
    if (!url) return File;
    const ext = url.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext)) return FileText;
    if (['xls', 'xlsx', 'csv'].includes(ext)) return FileSpreadsheet;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return FileImage;
    return File;
  };

  const groupedDocuments = filteredDocuments.reduce((acc, doc) => {
    const cat = doc.category || 'sonstiges';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(doc);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dokumente"
        subtitle="Alle wichtigen Unterlagen zum Download"
        icon={Files}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Suche nach Dokumenten..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white border-slate-200"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-white">
            <Filter className="h-4 w-4 mr-2 text-slate-400" />
            <SelectValue placeholder="Kategorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            <SelectItem value="vertrag">Verträge</SelectItem>
            <SelectItem value="agb">AGB</SelectItem>
            <SelectItem value="preisliste">Preislisten</SelectItem>
            <SelectItem value="handbuch">Handbücher</SelectItem>
            <SelectItem value="sonstiges">Sonstiges</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Documents */}
      {!isLoading && filteredDocuments.length === 0 ? (
        <EmptyState
          icon={Files}
          title="Keine Dokumente gefunden"
          description={search || categoryFilter !== 'all' 
            ? "Versuchen Sie andere Suchkriterien"
            : "Es sind noch keine Dokumente vorhanden"
          }
        />
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
              <div className="h-12 w-12 bg-slate-100 rounded-xl mb-4" />
              <div className="h-5 bg-slate-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : categoryFilter === 'all' ? (
        // Grouped view
        <div className="space-y-8">
          {Object.entries(groupedDocuments).map(([category, docs]) => (
            <div key={category}>
              <h3 className="font-semibold text-slate-800 mb-4">{categoryLabels[category] || category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {docs.map((doc, index) => {
                    const FileIcon = getFileIcon(doc.file_url, doc.category);
                    return (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-2xl border border-slate-100 p-6 hover:border-slate-200 hover:shadow-lg transition-all group"
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryColors[doc.category] || categoryColors.sonstiges} flex items-center justify-center mb-4 shadow-lg`}>
                          <FileIcon className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="font-semibold text-slate-800 mb-1 line-clamp-1">{doc.title}</h4>
                        {doc.description && (
                          <p className="text-sm text-slate-500 mb-3 line-clamp-2">{doc.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          {doc.file_size && (
                            <span className="text-xs text-slate-400">{doc.file_size}</span>
                          )}
                          {doc.file_url && (
                            <Button asChild size="sm" variant="ghost" className="ml-auto text-sky-600 hover:text-sky-700">
                              <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </a>
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Flat view when filtered
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredDocuments.map((doc, index) => {
              const FileIcon = getFileIcon(doc.file_url, doc.category);
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl border border-slate-100 p-6 hover:border-slate-200 hover:shadow-lg transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryColors[doc.category] || categoryColors.sonstiges} flex items-center justify-center mb-4 shadow-lg`}>
                    <FileIcon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-1 line-clamp-1">{doc.title}</h4>
                  {doc.description && (
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{doc.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    {doc.file_size && (
                      <span className="text-xs text-slate-400">{doc.file_size}</span>
                    )}
                    {doc.file_url && (
                      <Button asChild size="sm" variant="ghost" className="ml-auto text-sky-600 hover:text-sky-700">
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </a>
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}