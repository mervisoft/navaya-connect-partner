import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { TicketCheck, Plus, Search, Filter, Send, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const priorityColors = {
  niedrig: 'bg-slate-100 text-slate-700',
  mittel: 'bg-blue-100 text-blue-700',
  hoch: 'bg-orange-100 text-orange-700',
  kritisch: 'bg-rose-100 text-rose-700',
};

export default function Tickets() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: 'allgemein',
    priority: 'mittel',
  });

  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => base44.entities.Ticket.list('-created_date'),
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const createTicketMutation = useMutation({
    mutationFn: (data) => base44.entities.Ticket.create({
      ...data,
      ticket_number: `TK-${Date.now().toString().slice(-6)}`,
      status: 'offen',
      comments: [],
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setIsCreateOpen(false);
      setNewTicket({ subject: '', description: '', category: 'allgemein', priority: 'mittel' });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ ticketId, comment }) => {
      const ticket = tickets.find(t => t.id === ticketId);
      const updatedComments = [
        ...(ticket.comments || []),
        {
          author: currentUser?.full_name || currentUser?.email || 'Kunde',
          message: comment,
          date: new Date().toISOString(),
          is_internal: false,
        }
      ];
      return base44.entities.Ticket.update(ticketId, { comments: updatedComments });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setNewComment('');
    },
  });

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.ticket_number?.toLowerCase().includes(search.toLowerCase()) ||
      ticket.subject?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedTicket) return;
    addCommentMutation.mutate({ ticketId: selectedTicket.id, comment: newComment });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Tickets"
        subtitle="Ihre Anfragen und deren Status"
        icon={TicketCheck}
        actions={
          <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <SheetTrigger asChild>
              <Button className="bg-[#1e3a5f] hover:bg-[#2d4a6f]">
                <Plus className="h-4 w-4 mr-2" />
                Neues Ticket
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>Neues Support-Ticket erstellen</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <div>
                  <Label>Betreff</Label>
                  <Input
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    placeholder="Kurze Beschreibung des Problems"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Beschreibung</Label>
                  <Textarea
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    placeholder="Detaillierte Beschreibung Ihres Anliegens..."
                    className="mt-1 min-h-[150px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Kategorie</Label>
                    <Select 
                      value={newTicket.category} 
                      onValueChange={(val) => setNewTicket({ ...newTicket, category: val })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technisch">Technisch</SelectItem>
                        <SelectItem value="abrechnung">Abrechnung</SelectItem>
                        <SelectItem value="allgemein">Allgemein</SelectItem>
                        <SelectItem value="produktanfrage">Produktanfrage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priorität</Label>
                    <Select 
                      value={newTicket.priority} 
                      onValueChange={(val) => setNewTicket({ ...newTicket, priority: val })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="niedrig">Niedrig</SelectItem>
                        <SelectItem value="mittel">Mittel</SelectItem>
                        <SelectItem value="hoch">Hoch</SelectItem>
                        <SelectItem value="kritisch">Kritisch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  className="w-full bg-[#1e3a5f] hover:bg-[#2d4a6f]"
                  onClick={() => createTicketMutation.mutate(newTicket)}
                  disabled={!newTicket.subject || !newTicket.description || createTicketMutation.isPending}
                >
                  {createTicketMutation.isPending ? 'Wird erstellt...' : 'Ticket erstellen'}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Suche nach Ticket-Nr. oder Betreff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white border-slate-200"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-white">
            <Filter className="h-4 w-4 mr-2 text-slate-400" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="offen">Offen</SelectItem>
            <SelectItem value="in_bearbeitung">In Bearbeitung</SelectItem>
            <SelectItem value="wartend">Wartend</SelectItem>
            <SelectItem value="geschlossen">Geschlossen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ticket List */}
      {!isLoading && filteredTickets.length === 0 ? (
        <EmptyState
          icon={TicketCheck}
          title="Keine Tickets gefunden"
          description={search || statusFilter !== 'all' 
            ? "Versuchen Sie andere Suchkriterien"
            : "Sie haben noch keine Support-Tickets erstellt"
          }
        />
      ) : isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
              <div className="h-5 bg-slate-100 rounded w-1/4 mb-2" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredTickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedTicket(ticket)}
                className="bg-white rounded-2xl border border-slate-100 p-6 hover:border-slate-200 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-slate-500">{ticket.ticket_number}</span>
                      <StatusBadge status={ticket.status} />
                    </div>
                    <h3 className="font-semibold text-slate-800 truncate">{ticket.subject}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">{ticket.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${priorityColors[ticket.priority]}`}>
                      {ticket.priority?.charAt(0).toUpperCase() + ticket.priority?.slice(1)}
                    </span>
                    {ticket.comments?.length > 0 && (
                      <span className="flex items-center gap-1 text-sm text-slate-500">
                        <MessageSquare className="h-4 w-4" />
                        {ticket.comments.length}
                      </span>
                    )}
                    <span className="text-sm text-slate-400">
                      {ticket.created_date && format(new Date(ticket.created_date), 'dd.MM.yyyy', { locale: de })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center">
                <TicketCheck className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm text-slate-500">{selectedTicket?.ticket_number}</span>
                  <StatusBadge status={selectedTicket?.status} />
                </div>
                <p className="font-semibold text-slate-800 truncate">{selectedTicket?.subject}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Kategorie</p>
                  <p className="font-medium text-slate-700 capitalize">{selectedTicket.category}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Priorität</p>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${priorityColors[selectedTicket.priority]}`}>
                    {selectedTicket.priority?.charAt(0).toUpperCase() + selectedTicket.priority?.slice(1)}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Erstellt</p>
                  <p className="font-medium text-slate-700">
                    {selectedTicket.created_date && format(new Date(selectedTicket.created_date), 'dd.MM.yy', { locale: de })}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-2">Beschreibung</p>
                <p className="text-slate-700 whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              {/* Comments */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Kommentare</h4>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {selectedTicket.comments?.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4">Noch keine Kommentare</p>
                  ) : (
                    selectedTicket.comments?.filter(c => !c.is_internal).map((comment, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-slate-700">{comment.author}</span>
                          <span className="text-xs text-slate-400">
                            {comment.date && format(new Date(comment.date), 'dd.MM.yy HH:mm', { locale: de })}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm whitespace-pre-wrap">{comment.message}</p>
                      </div>
                    ))
                  )}
                </div>

                {selectedTicket.status !== 'geschlossen' && (
                  <div className="flex gap-2">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Schreiben Sie eine Nachricht..."
                      className="flex-1 min-h-[80px]"
                    />
                    <Button 
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || addCommentMutation.isPending}
                      className="self-end bg-[#1e3a5f] hover:bg-[#2d4a6f]"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}