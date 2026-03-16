import React, { useRef } from 'react';
import { Printer, Download, Palette, Type, Layout, Square, ToggleLeft, Grid } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Section = ({ title, icon: Icon, children }) => (
  <div className="mb-12">
    <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-slate-200">
      {Icon && <Icon className="h-6 w-6 text-[#0ea5e9]" />}
      <h2 className="text-2xl font-bold text-[#1e3a5f]">{title}</h2>
    </div>
    {children}
  </div>
);

const ColorSwatch = ({ color, name, hex, textColor = 'white' }) => (
  <div className="flex flex-col items-center gap-2">
    <div
      className="w-24 h-24 rounded-xl shadow-md border border-slate-200 flex items-center justify-center"
      style={{ backgroundColor: color }}
    >
      <span className="text-xs font-mono font-bold" style={{ color: textColor }}>{hex}</span>
    </div>
    <span className="text-sm font-medium text-slate-700 text-center">{name}</span>
  </div>
);

const CodeBlock = ({ code }) => (
  <pre className="bg-slate-900 text-green-400 text-xs p-4 rounded-xl overflow-x-auto font-mono leading-relaxed">
    {code}
  </pre>
);

export default function DesignGuide() {
  const printRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Print Button - hidden in print */}
      <div className="no-print flex items-center justify-between mb-8 p-6 bg-gradient-to-r from-[#1e3a5f] to-[#0ea5e9] rounded-2xl text-white">
        <div>
          <h1 className="text-3xl font-bold mb-1">Design Style Guide</h1>
          <p className="text-sky-200">Komplette Referenz für Entwickler — alle Farben, Abstände, Komponenten & Layouts</p>
        </div>
        <Button onClick={handlePrint} className="bg-white text-[#1e3a5f] hover:bg-sky-50 font-semibold">
          <Printer className="h-4 w-4 mr-2" />
          Als PDF drucken / speichern
        </Button>
      </div>

      <div ref={printRef} className="max-w-5xl mx-auto space-y-2 bg-white p-8 rounded-2xl border border-slate-200 print:border-0 print:p-0">

        {/* ── BRAND IDENTITY ── */}
        <Section title="Brand Identity" icon={Palette}>
          <div className="mb-6 p-4 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-600 mb-2 font-semibold">App-Name & Logo</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#0ea5e9] flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">K</span>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800">Kundenportal / Mervisoft</p>
                <p className="text-sm text-slate-500">Self-Service Center für Partner/Reseller</p>
              </div>
            </div>
          </div>
        </Section>

        {/* ── FARBEN ── */}
        <Section title="Farbpalette" icon={Palette}>
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Primärfarben</h3>
            <div className="flex flex-wrap gap-6">
              <ColorSwatch color="#1e3a5f" hex="#1e3a5f" name="Primary (Dunkelblau)" />
              <ColorSwatch color="#2d4a6f" hex="#2d4a6f" name="Primary Light" />
              <ColorSwatch color="#0ea5e9" hex="#0ea5e9" name="Accent (Sky Blue)" />
              <ColorSwatch color="#38bdf8" hex="#38bdf8" name="Accent Light" />
              <ColorSwatch color="#7dd3fc" hex="#7dd3fc" name="Sky 300 (Icons aktiv)" textColor="#1e3a5f" />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Status-Farben</h3>
            <div className="flex flex-wrap gap-6">
              <ColorSwatch color="#10b981" hex="#10b981" name="Erfolg / Aktiv (Emerald)" />
              <ColorSwatch color="#f59e0b" hex="#f59e0b" name="Warnung (Amber)" textColor="#1e3a5f" />
              <ColorSwatch color="#ef4444" hex="#ef4444" name="Fehler / Gefahr (Red)" />
              <ColorSwatch color="#8b5cf6" hex="#8b5cf6" name="Lila (Aufträge)" />
              <ColorSwatch color="#f97316" hex="#f97316" name="Orange (Rechnungen)" />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Hintergrundfarben & Neutrale</h3>
            <div className="flex flex-wrap gap-6">
              <ColorSwatch color="#f8fafc" hex="#f8fafc" name="slate-50 (Page BG)" textColor="#1e3a5f" />
              <ColorSwatch color="#f1f5f9" hex="#f1f5f9" name="slate-100 (Card BG)" textColor="#1e3a5f" />
              <ColorSwatch color="#e2e8f0" hex="#e2e8f0" name="slate-200 (Border)" textColor="#1e3a5f" />
              <ColorSwatch color="#64748b" hex="#64748b" name="slate-500 (Subtitle)" />
              <ColorSwatch color="#1e293b" hex="#1e293b" name="slate-800 (Texttitel)" />
              <ColorSwatch color="#ffffff" hex="#ffffff" name="Weiß (Cards)" textColor="#1e3a5f" />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl">
            <h3 className="text-sm font-semibold text-slate-600 mb-3">CSS Variablen (Layout.js)</h3>
            <CodeBlock code={`/* Definiert in Layout.js via <style> Tag */
:root {
  --primary: #1e3a5f;
  --primary-light: #2d4a6f;
  --accent: #0ea5e9;
  --accent-light: #38bdf8;
}

/* Hintergrund der App */
background: linear-gradient(to bottom-right, #f8fafc, #ffffff, rgba(240, 249, 255, 0.3))
/* Tailwind: bg-gradient-to-br from-slate-50 via-white to-sky-50/30 */`} />
          </div>
        </Section>

        {/* ── TYPOGRAPHIE ── */}
        <Section title="Typographie" icon={Type}>
          <div className="space-y-4 mb-6">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 mb-1 font-mono">font-family: System-UI / Inter / Tailwind default</p>
              <h1 className="text-4xl font-bold text-slate-800">Seitentitel H1 — Bold 36px</h1>
              <h2 className="text-2xl font-bold text-slate-800 mt-2">Bereichstitel H2 — Bold 24px</h2>
              <h3 className="text-lg font-semibold text-slate-700 mt-2">Abschnittstitel H3 — Semibold 18px</h3>
              <p className="text-base text-slate-600 mt-2">Body Text — Regular 16px — Für fließenden Inhalt und Beschreibungen</p>
              <p className="text-sm text-slate-500 mt-2">Small / Subtitle — 14px — Für Untertitel, Labels und Metadaten</p>
              <p className="text-xs text-slate-400 mt-2 uppercase tracking-wider font-semibold">LABEL / CAPTION — 12px — Für Tabellenkopf und Tags</p>
              <p className="font-mono text-sm text-slate-700 mt-2">Monospace — Für Nummern, IDs, Codes (z.B. Rechnungs-Nr.)</p>
            </div>
          </div>

          <CodeBlock code={`/* Häufige Typographie-Klassen */
text-2xl md:text-3xl font-bold text-slate-800 tracking-tight  /* Seitentitel */
text-slate-500 mt-0.5                                          /* Untertitel */
text-xs font-semibold text-slate-500 uppercase tracking-wider  /* Tabellenkopf */
font-mono font-medium text-slate-800                           /* IDs / Nummern */
text-sm text-slate-600                                         /* Body Small */`} />
        </Section>

        {/* ── ABSTÄNDE & RADIUS ── */}
        <Section title="Abstände & Border-Radius" icon={Grid}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'rounded-lg', r: '8px', size: 'h-8 w-8' },
              { label: 'rounded-xl', r: '12px', size: 'h-12 w-12' },
              { label: 'rounded-2xl', r: '16px', size: 'h-16 w-16' },
              { label: 'rounded-3xl', r: '24px', size: 'h-20 w-20' },
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <div className={`${item.size} bg-[#1e3a5f] ${item.label}`} />
                <div className="text-center">
                  <p className="text-xs font-mono text-slate-700">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.r}</p>
                </div>
              </div>
            ))}
          </div>

          <CodeBlock code={`/* Card / Panel */        rounded-2xl border border-slate-200 bg-white p-6 shadow-sm
/* Sidebar Nav Aktiv */   rounded-xl bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] px-4 py-3
/* Icon Container */      w-10 h-10 rounded-xl   (klein)  |  w-12 h-12 rounded-2xl (groß)
/* Badge / Chip */        rounded-md px-2 py-1 text-xs font-medium border
/* Input */               rounded-md border border-slate-200 h-10 px-3
/* Dialog / Modal */      rounded-2xl (shadcn default angepasst)
/* Button */              rounded-md (shadcn default)

/* Schatten */
shadow-sm            /* Standard Card-Schatten */
shadow-lg            /* Hover-Zustand */
shadow-lg shadow-slate-300/30  /* Sidebar Logo & Icons */
shadow-lg shadow-sky-200/50    /* Sidebar Logo Spezial */`} />
        </Section>

        {/* ── LAYOUT-STRUKTUR ── */}
        <Section title="Layout-Struktur" icon={Layout}>
          <div className="p-4 bg-slate-50 rounded-xl mb-4 text-sm font-mono">
            <div className="border-2 border-dashed border-slate-400 rounded-xl p-4">
              <p className="text-slate-500 text-xs mb-3 font-sans font-semibold">APP LAYOUT (min-h-screen)</p>
              <div className="flex gap-3">
                {/* Sidebar */}
                <div className="border-2 border-[#1e3a5f] rounded-xl p-3 w-40 shrink-0 bg-white">
                  <p className="text-[10px] font-bold text-[#1e3a5f] mb-2">SIDEBAR (w-72 = 288px)</p>
                  <div className="bg-gradient-to-br from-[#1e3a5f] to-[#0ea5e9] rounded-lg p-2 mb-2 text-center">
                    <p className="text-[9px] text-white">Logo + Firmenname</p>
                  </div>
                  <div className="space-y-1">
                    {['Dashboard', 'Shop', 'Angebote', 'Aufträge', 'Rechnungen'].map(item => (
                      <div key={item} className="bg-slate-100 rounded px-2 py-1">
                        <p className="text-[9px] text-slate-600">{item}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 border-t border-slate-200 pt-2">
                    <p className="text-[9px] text-slate-500">User-Profil</p>
                  </div>
                </div>
                {/* Main */}
                <div className="flex-1 border-2 border-sky-300 rounded-xl p-3 bg-white">
                  <p className="text-[10px] font-bold text-sky-600 mb-2">MAIN CONTENT (ml-72, pt-16)</p>
                  <div className="border border-sky-200 rounded p-2 mb-2 bg-sky-50">
                    <p className="text-[9px] text-sky-700">HEADER (fixed, h-16, backdrop-blur)</p>
                  </div>
                  <div className="border border-dashed border-slate-300 rounded p-2 mb-2">
                    <p className="text-[9px] text-slate-500">Page Header (Icon + Titel + Actions)</p>
                  </div>
                  <div className="grid grid-cols-3 gap-1 mb-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="bg-slate-100 rounded p-2 text-center">
                        <p className="text-[8px] text-slate-500">StatCard</p>
                      </div>
                    ))}
                  </div>
                  <div className="border border-slate-200 rounded p-2 bg-white">
                    <p className="text-[9px] text-slate-500">Tabelle / Content</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <CodeBlock code={`/* Sidebar */
position: fixed | width: 288px (lg:translate-x-0, mobile: -translate-x-full)
background: white/95 backdrop-blur-xl | border-right: 1px solid slate-200/60
z-index: 40

/* Header */
position: fixed | height: 64px (h-16) | left: 288px | right: 0 | z-index: 40
background: white/80 backdrop-blur-xl | border-bottom: 1px solid slate-200/60

/* Main Content */
margin-left: 288px (lg:ml-72) | padding-top: 64px (pt-16)
padding: 16px (p-4) md:32px (p-8)

/* Seitenbreiten */
max-w-4xl mx-auto   /* Formulare / Einzelseiten */
max-w-5xl mx-auto   /* Breite Inhaltsseiten */
/* Standard: keine max-width (full width) */`} />
        </Section>

        {/* ── NAVIGATION ── */}
        <Section title="Sidebar Navigation" icon={Layout}>
          <div className="space-y-2 mb-6 max-w-sm">
            {/* Aktiv */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] text-white shadow-lg shadow-slate-300/30">
              <div className="w-5 h-5 rounded bg-sky-300/30" />
              <span className="font-medium text-sm">Aktiver Menüpunkt</span>
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-300" />
            </div>
            {/* Hover */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100/80 text-slate-700">
              <div className="w-5 h-5 rounded bg-slate-300" />
              <span className="font-medium text-sm">Hover-Zustand</span>
            </div>
            {/* Normal */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600">
              <div className="w-5 h-5 rounded bg-slate-200" />
              <span className="font-medium text-sm">Normaler Menüpunkt</span>
            </div>
          </div>
          <CodeBlock code={`/* Aktiver Nav-Eintrag */
className="flex items-center gap-3 px-4 py-3 rounded-xl
  bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] text-white
  shadow-lg shadow-slate-300/30"

/* Icon aktiv: text-sky-300 */
/* Dot aktiv: w-1.5 h-1.5 rounded-full bg-sky-300 ml-auto */

/* Hover Nav-Eintrag */
className="hover:bg-slate-100/80 hover:text-slate-900"

/* Normal */
className="text-slate-600"`} />
        </Section>

        {/* ── BUTTONS ── */}
        <Section title="Buttons" icon={Square}>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex flex-col items-center gap-2">
              <button className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white shadow" style={{ background: '#1e3a5f' }}>
                Primary Button
              </button>
              <span className="text-xs text-slate-500">Primary (#1e3a5f)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white shadow bg-emerald-600">
                + Grüner Button
              </button>
              <span className="text-xs text-slate-500">Emerald-600 (Hinzufügen)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-white border border-slate-200 text-slate-700 shadow-sm">
                Outline Button
              </button>
              <span className="text-xs text-slate-500">Outline / Sekundär</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100">
                Ghost Button
              </button>
              <span className="text-xs text-slate-500">Ghost (Navigation)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button className="inline-flex items-center px-8 py-6 rounded-md text-sm font-medium text-white shadow-lg" style={{ background: '#1e3a5f' }}>
                <span className="text-left">
                  <div className="font-semibold">Großer CTA Button</div>
                  <div className="text-xs opacity-90">Mit Untertitel (size="lg")</div>
                </span>
              </button>
              <span className="text-xs text-slate-500">Large CTA (h-auto py-6)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600">
                Destruktiv
              </button>
              <span className="text-xs text-slate-500">Destructive (rot)</span>
            </div>
          </div>
          <CodeBlock code={`/* Primary (Haupt-CTA) */
className="bg-[#1e3a5f] hover:bg-[#2d4a6f] text-white"

/* Grün (Hinzufügen / Erstellen) */
className="bg-emerald-600 hover:bg-emerald-700 text-white"

/* Outline (Sekundär) */
variant="outline"  /* shadcn */

/* Ghost (Navigation / Subtile Aktionen) */
variant="ghost"

/* Large CTA mit Icon + Untertitel */
className="h-auto py-6 bg-[#1e3a5f] hover:bg-[#2d4a6f]" size="lg"

/* Icon Button (quadratisch) */
variant="ghost" size="icon"

/* shadcn Button-Komponente wird überall verwendet */
import { Button } from "@/components/ui/button"`} />
        </Section>

        {/* ── FORMULARE ── */}
        <Section title="Formularfelder / Inputs" icon={Square}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 max-w-2xl">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Textfeld (Input)</label>
              <Input placeholder="Placeholder-Text..." className="bg-white border-slate-200" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Dropdown (Select)</label>
              <Select>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Bitte auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Option 1</SelectItem>
                  <SelectItem value="2">Option 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Textarea</label>
              <Textarea placeholder="Mehrzeiliger Text..." className="min-h-[80px]" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Suchfeld (mit Icon)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                <Input placeholder="Suche..." className="pl-10 bg-white border-slate-200" />
              </div>
            </div>
          </div>
          <CodeBlock code={`/* Input */
className="bg-white border-slate-200"
/* shadcn: <Input /> — border-input h-9 rounded-md px-3 text-sm */

/* Label */
className="block text-sm font-medium text-slate-700 mb-2"

/* Pflichtfeld-Marker */
<span className="text-red-500">*</span>

/* Hilfstext unter Feld */
className="text-xs text-slate-500 mt-1"

/* Fehlertext */
className="text-xs text-red-600 mt-1"

/* Suchfeld */
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
  <Input className="pl-10 bg-white border-slate-200" />
</div>`} />
        </Section>

        {/* ── CARDS / PANELS ── */}
        <Section title="Cards & Panels" icon={Grid}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Standard Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Standard Card</p>
              <p className="font-bold text-slate-800 text-lg">Kartentitel</p>
              <p className="text-sm text-slate-500 mt-1">Beschreibungstext des Inhalts</p>
            </div>
            {/* Stat Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Statistik-Titel</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">€ 12.450</p>
                  <p className="text-xs text-slate-400 mt-1">Untertitel / Vergleich</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">€</span>
                </div>
              </div>
            </div>
            {/* Info Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <span className="text-blue-600 text-lg">ℹ</span>
              <div>
                <p className="text-sm font-semibold text-blue-800">Info-Banner (Alert)</p>
                <p className="text-xs text-blue-700 mt-0.5">Beschreibungstext in blau für Hinweise und Kontext.</p>
              </div>
            </div>
            {/* Section Header in Card */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="border-b border-slate-200 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] flex items-center justify-center">
                  <span className="text-sky-300 text-sm">★</span>
                </div>
                <div>
                  <p className="font-bold text-slate-800">Card mit Header-Bereich</p>
                  <p className="text-xs text-slate-500">Untertitel des Bereichs</p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-slate-500">Inhalt der Karte...</p>
              </div>
            </div>
          </div>
          <CodeBlock code={`/* Standard Card */
className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"

/* Card mit Header-Trennlinie */
className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
  <div className="border-b border-slate-200 p-6"> ... </div>  /* Header */
  <div className="p-6"> ... </div>                            /* Body */

/* StatCard Icon-Container (verschiedene Farbvarianten) */
/* Blau:    from-blue-500 to-sky-400     */
/* Grün:    from-emerald-500 to-teal-400 */
/* Lila:    from-purple-500 to-pink-400  */
/* Orange:  from-orange-400 to-amber-400 */
/* Dunkel:  from-[#1e3a5f] to-[#2d4a6f] (mit text-sky-300 für Icon) */

/* Info-Banner / Alert */
className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4"

/* Leerer Zustand (Empty State) */
className="text-center py-16 px-4"
  Icon: w-20 h-20 rounded-3xl bg-slate-100 (Icon darin: text-slate-400)
  Title: text-lg font-semibold text-slate-700
  Text: text-slate-500 text-center max-w-sm`} />
        </Section>

        {/* ── BADGES / STATUS ── */}
        <Section title="Badges & Status-Anzeigen" icon={ToggleLeft}>
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">Aktiv / Bezahlt / Angenommen</span>
            <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">Offen / Neu</span>
            <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200">In Bearbeitung / Wartend</span>
            <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border bg-red-50 text-red-700 border-red-200">Überfällig / Kritisch / Abgelehnt</span>
            <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border bg-slate-100 text-slate-600 border-slate-300">Inaktiv / Abgelaufen / Storniert</span>
            <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border bg-purple-50 text-purple-700 border-purple-200">Versendet / Spezial</span>
          </div>
          <CodeBlock code={`/* Badge-Grundstruktur */
className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border"

/* Farb-Varianten */
bg-emerald-50  text-emerald-700  border-emerald-200  /* Erfolg / Aktiv */
bg-blue-50     text-blue-700     border-blue-200      /* Info / Offen */
bg-amber-50    text-amber-700    border-amber-200     /* Warnung */
bg-red-50      text-red-700      border-red-200       /* Fehler / Überfällig */
bg-slate-100   text-slate-600    border-slate-300     /* Neutral / Inaktiv */
bg-purple-50   text-purple-700   border-purple-200    /* Versendet */`} />
        </Section>

        {/* ── TABELLE ── */}
        <Section title="Datentabellen" icon={Grid}>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm mb-6">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Spalte 1</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Spalte 2</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map(i => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-sky-50/50 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800">Hauptwert Zeile {i}</span>
                      <div className="text-xs text-slate-500 font-mono">ID-{1000 + i}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">Beschreibungstext</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">Aktiv</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CodeBlock code={`/* Tabellen-Container */
className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm"

/* Header-Zeile */
className="bg-slate-50/80 hover:bg-slate-50/80 border-slate-100"
  <th> className="text-xs font-semibold text-slate-500 uppercase tracking-wider"

/* Daten-Zeile */
className="border-slate-50 hover:bg-sky-50/50 transition-colors cursor-pointer"
  <td> className="py-4 px-6"

/* Zellen-Inhalte */
Hauptwert:   font-semibold text-slate-800
ID / Nummer: text-xs text-slate-500 font-mono
Sekundär:    text-sm text-slate-600`} />
        </Section>

        {/* ── PAGE HEADER ── */}
        <Section title="Page Header Komponente" icon={Layout}>
          <div className="mb-6 p-6 bg-slate-50 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] flex items-center justify-center shadow-lg shadow-slate-300/30">
                  <span className="text-sky-300 text-lg">⚡</span>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Seitentitel</h1>
                  <p className="text-slate-500 mt-0.5">Untertitel / Kontext-Information</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white" style={{ background: '#1e3a5f' }}>
                  + Neue Aktion
                </button>
              </div>
            </div>
          </div>
          <CodeBlock code={`/* PageHeader Komponente: components/shared/PageHeader.jsx */
<PageHeader
  title="Seitentitel"
  subtitle="Untertitel / Kontext"
  icon={SomeLucideIcon}   /* Icon wird mit sky-300 Farbe dargestellt */
  actions={<Button>...</Button>}
/>

/* Icon-Box Gradient */
from-[#1e3a5f] to-[#2d4a6f]  /* Standard (dunkelblau) */
from-blue-500 to-sky-400      /* Alternative blau */
from-emerald-500 to-teal-400  /* Alternative grün */`} />
        </Section>

        {/* ── ICONS ── */}
        <Section title="Icons (Lucide React)" icon={Grid}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { name: 'LayoutDashboard', use: 'Dashboard/Navigation' },
              { name: 'Building2', use: 'Kunde/Firma' },
              { name: 'FileText', use: 'Angebote/Dokumente' },
              { name: 'ShoppingCart', use: 'Shop/Aufträge' },
              { name: 'Receipt', use: 'Rechnungen' },
              { name: 'Truck', use: 'Lieferungen' },
              { name: 'TicketCheck', use: 'Tickets' },
              { name: 'FileCheck', use: 'Verträge' },
              { name: 'FolderKanban', use: 'Projekte' },
              { name: 'Files', use: 'Dokumente' },
              { name: 'Calculator', use: 'Vertragsanpassung' },
              { name: 'Bot', use: 'KI-Assistent' },
            ].map(item => (
              <div key={item.name} className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center">
                  <span className="text-[#1e3a5f] text-xs font-bold">→</span>
                </div>
                <div>
                  <p className="text-xs font-mono font-semibold text-slate-700">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.use}</p>
                </div>
              </div>
            ))}
          </div>
          <CodeBlock code={`/* Import Beispiel */
import { LayoutDashboard, Building2, FileText, ShoppingCart,
  Receipt, Truck, TicketCheck, FileCheck, FolderKanban,
  Files, Calculator, Bot, Plus, Search, Filter,
  Trash2, Download, Send, MessageSquare, User,
  ChevronDown, Menu, X, LogOut, ArrowLeft
} from 'lucide-react';

/* Icon-Größen */
h-4 w-4   /* Klein (in Buttons/Text) */
h-5 w-5   /* Standard (Navigation) */
h-6 w-6   /* Mittel (Page Header) */
h-10 w-10 /* Groß (Empty State) */

/* Icon-Farben */
text-sky-300    /* In dunklen Gradienten (Sidebar aktiv) */
text-slate-400  /* Dezent / Inaktiv */
text-[#1e3a5f]  /* Primärfarbe */
text-white      /* In farbigen Containern */`} />
        </Section>

        {/* ── ANIMATIONEN ── */}
        <Section title="Animationen & Übergänge" icon={Grid}>
          <CodeBlock code={`/* Bibliothek: framer-motion */
import { motion } from 'framer-motion';

/* Standard Fade-In für Listen-Items */
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.05 }}
>

/* Fade-In für Page-Header */
initial={{ opacity: 0, y: -10 }}
animate={{ opacity: 1, y: 0 }}

/* Sidebar Slide-In (mobile) */
transform transition-transform duration-300 ease-out

/* Hover-Transitionen (Tailwind) */
transition-colors         /* Farb-Übergang */
transition-all            /* Alle Eigenschaften */
hover:shadow-lg           /* Schatten bei Hover */
hover:scale-110           /* Icons in Nav (group-hover) */

/* Lade-Skeleton */
animate-pulse  /* Tailwind Skeleton-Animation */
/* + bg-slate-100 / bg-slate-200 für Platzhalter */`} />
        </Section>

        {/* ── TECH STACK ── */}
        <Section title="Tech Stack & Bibliotheken" icon={Grid}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {[
              { name: 'React 18', desc: 'UI Framework' },
              { name: 'Tailwind CSS', desc: 'Styling' },
              { name: 'shadcn/ui', desc: 'UI Komponenten' },
              { name: 'Lucide React', desc: 'Icons' },
              { name: 'framer-motion', desc: 'Animationen' },
              { name: 'TanStack Query', desc: 'Datenverwaltung' },
              { name: 'React Router v6', desc: 'Navigation' },
              { name: 'date-fns', desc: 'Datums-Formatierung' },
              { name: 'recharts / chart.js', desc: 'Charts/Grafiken' },
            ].map(item => (
              <div key={item.name} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>

          <CodeBlock code={`/* Zahlenformatierung (Deutsch / EUR) */
new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount)
// → "1.234,56 €"

/* Datumsformatierung */
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
format(new Date(date), 'dd.MM.yyyy', { locale: de })        // → "16.03.2026"
format(new Date(date), 'dd. MMMM yyyy', { locale: de })     // → "16. März 2026"
format(new Date(date), 'dd.MM.yy HH:mm', { locale: de })   // → "16.03.26 14:30"

/* Sprache */
Alle UI-Texte: Deutsch
Variablen/Code: Englisch`} />
        </Section>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
          Mervisoft Kundenportal — Design Style Guide — Stand: März 2026
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .rounded-2xl { border-radius: 8px !important; }
        }
      `}</style>
    </div>
  );
}