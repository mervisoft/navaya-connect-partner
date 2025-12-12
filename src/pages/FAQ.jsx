import React from 'react';
import { HelpCircle } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

export default function FAQ() {
  const faqs = [
    {
      question: "Wie erstelle ich ein Angebot für einen Kunden?",
      answer: "Gehen Sie zu 'Kunden', wählen Sie den gewünschten Kunden aus und klicken Sie auf 'Angebot anfragen'. Füllen Sie das Formular mit den benötigten Produkten und Mengen aus."
    },
    {
      question: "Wie funktioniert die Bestellung im Shop?",
      answer: "Wählen Sie einen Kunden aus, gehen Sie zum Shop, fügen Sie Produkte zum Warenkorb hinzu und schließen Sie die Bestellung ab. Der Auftrag wird automatisch im System gespeichert."
    },
    {
      question: "Wie kann ich meine Kundendaten verwalten?",
      answer: "Im Bereich 'Kunden' können Sie alle Kundeninformationen einsehen und bearbeiten. Klicken Sie auf einen Kunden, um Details zu sehen oder zu ändern."
    },
    {
      question: "Wo finde ich Rechnungen und Aufträge?",
      answer: "Wählen Sie einen Kunden aus und navigieren Sie im Kundenkontext zu 'Rechnungen' oder 'Aufträge', um alle zugehörigen Dokumente zu sehen."
    },
    {
      question: "Wie erstelle ich ein Support-Ticket?",
      answer: "Im Bereich 'Tickets' können Sie ein neues Ticket erstellen. Wählen Sie die Kategorie, Priorität und beschreiben Sie Ihr Anliegen."
    },
    {
      question: "Wie funktioniert die Produktsuche im Shop?",
      answer: "Nutzen Sie die Suchleiste, um nach Produktnamen, Herstellern oder Beschreibungen zu suchen. Sie können auch nach Kategorien filtern."
    },
    {
      question: "Kann ich Angebote nachträglich bearbeiten?",
      answer: "Ja, offene Angebote können in der Angebotsübersicht ausgewählt und bearbeitet werden, solange sie noch nicht angenommen wurden."
    },
    {
      question: "Wie erhalte ich technischen Support?",
      answer: "Erstellen Sie ein Ticket mit der Kategorie 'Technisch' oder kontaktieren Sie uns direkt per E-Mail unter support@mervisoft.de oder telefonisch."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Häufig gestellte Fragen"
        subtitle="Antworten auf die wichtigsten Fragen"
        icon={HelpCircle}
      />

      <Card>
        <CardContent className="p-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-slate-800 mb-2">Weitere Fragen?</h3>
          <p className="text-slate-600 mb-4">
            Wenn Sie weitere Fragen haben, zögern Sie nicht, uns zu kontaktieren. 
            Unser Support-Team steht Ihnen gerne zur Verfügung.
          </p>
          <p className="text-sm text-slate-600">
            <strong>E-Mail:</strong> support@mervisoft.de<br />
            <strong>Telefon:</strong> +49 (0) 123 456789
          </p>
        </CardContent>
      </Card>
    </div>
  );
}