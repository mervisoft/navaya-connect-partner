import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Bot, Send, AlertCircle } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from 'framer-motion';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hallo! Ich bin Ihr KI-Assistent und helfe Ihnen bei Fragen zur Nutzung dieses Reseller-Portals. Bitte beachten Sie, dass ich kein Mitarbeiter bin und keine Support-Tickets bearbeiten kann. Für Kundenservice wenden Sie sich bitte an das Mervisoft-Team über den Kontakt-Bereich.\n\nWie kann ich Ihnen bei der Nutzung des Portals helfen?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const systemPrompt = `Du bist ein KI-Assistent für ein Reseller-Portal von Mervisoft. 
Deine Aufgabe ist es, Resellern bei der Nutzung des Portals zu helfen. 

WICHTIGER WORKFLOW DES PORTALS:
Das Portal ist KUNDEN-ZENTRIERT. Das bedeutet:
1. Der Reseller muss ZUERST einen Kunden aus der Kundenliste auswählen
2. Dann "taucht" der Reseller in die Kundenansicht ein
3. Erst in der Kundenansicht kann er für diesen Kunden bestellen, Angebote erstellen, etc.
4. Der Reseller arbeitet IMMER im Kontext eines ausgewählten Kunden

KORREKTE ANLEITUNG FÜR BESTELLUNGEN:
1. Im Reseller Dashboard auf "Kunden" klicken
2. Einen Kunden aus der Liste auswählen (auf den Kunden klicken)
3. Im Kunden-Dashboard auf "Shop für diesen Kunden" klicken
4. Produkte auswählen und in den Warenkorb legen
5. Bestellung für diesen Kunden abschließen
6. Alternativ: "Angebot anfordern" für individuelle Angebote

FUNKTIONEN DES PORTALS:
- Kundenverwaltung: Neue Kunden anlegen und verwalten
- Kunden-Dashboard: Übersicht über alle Aktivitäten eines Kunden
- Shop (im Kundenkontext): Produkte und Lizenzen für den ausgewählten Kunden bestellen
- Angebotserstellung (im Kundenkontext): Individuelle Angebote für den Kunden erstellen
- Aufträge, Rechnungen, Lieferscheine: Im Kundenkontext einsehbar
- Tickets: Support-Anfragen für Kunden erstellen und verfolgen
- Verträge: Lizenzverträge und deren Status eines Kunden einsehen
- Projekte: Kundenprojekte verwalten
- Dokumente: Wichtige Dokumente einsehen
- KI-Assistent: Hilfe zur Portal-Nutzung (das bist du!)

WICHTIGE EINSCHRÄNKUNGEN: 
- Du bist KEIN Mitarbeiter von Mervisoft
- Du kannst KEINE Support-Tickets bearbeiten
- Du kannst KEINE Bestellungen aufgeben oder ändern
- Du kannst KEINE geschäftlichen Entscheidungen treffen
- Für alle geschäftlichen Anfragen, Support oder Bestellprobleme müssen sich Reseller an das Mervisoft-Team über "Kontakt zu Mervisoft" wenden
- Du hilfst NUR bei Fragen zur Bedienung und Navigation des Portals

Antworte auf Deutsch, kurz und präzise. Erkläre Schritt für Schritt, wenn nötig. Sei freundlich und hilfreich.

Bisheriger Gesprächsverlauf:
${conversationHistory.map(msg => `${msg.role === 'user' ? 'Benutzer' : 'Assistent'}: ${msg.content}`).join('\n')}

Neue Frage des Benutzers: ${userMessage}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: systemPrompt,
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="KI-Assistent"
        subtitle="Hilfe zur Nutzung des Reseller-Portals"
        icon={Bot}
      />

      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Hinweis:</strong> Dies ist ein KI-Assistent zur Hilfe bei der Portal-Nutzung. 
          Für geschäftliche Anfragen, Support-Tickets oder Bestellungen wenden Sie sich bitte 
          an das Mervisoft-Team über den Kontakt-Bereich.
        </AlertDescription>
      </Alert>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Chat Messages */}
        <div className="h-[500px] overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f]' 
                    : 'bg-gradient-to-br from-blue-500 to-indigo-500'
                }`}>
                  {message.role === 'user' ? (
                    <span className="text-white text-sm font-semibold">Sie</span>
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] text-white'
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="rounded-2xl px-4 py-3 bg-slate-100">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Stellen Sie eine Frage zur Nutzung des Portals..."
              className="resize-none"
              rows={2}
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-[#1e3a5f] hover:bg-[#2d4a6f] self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Drücken Sie Enter zum Senden, Shift+Enter für eine neue Zeile
          </p>
        </div>
      </div>
    </div>
  );
}