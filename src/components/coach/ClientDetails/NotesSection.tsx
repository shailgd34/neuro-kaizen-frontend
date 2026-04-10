import { useState } from "react";
import Card from "../../ui/Card";

interface Note {
  id: string;
  date: string;
  author: string;
  content: string;
  isPrivate: boolean;
}

interface NotesSectionProps {
  notes: Note[];
}

export default function NotesSection({ notes }: NotesSectionProps) {
  const [activeTab, setActiveTab] = useState<"visible" | "private">("visible");

  const filteredNotes = notes.filter(n => 
    activeTab === "visible" ? !n.isPrivate : n.isPrivate
  );

  return (
    <Card className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
         <h6 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">Notes</h6>
         <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
            <button 
              onClick={() => setActiveTab("visible")}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                activeTab === "visible" ? "bg-white/10 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Client-Visible
            </button>
            <button 
              onClick={() => setActiveTab("private")}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                activeTab === "private" ? "bg-white/10 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Coach-Private
            </button>
         </div>
      </div>

      {/* New Note Composer */}
      <div className="flex flex-col gap-3 p-4 bg-white/[0.03] border border-white/5 rounded-xl">
        <textarea 
          placeholder={`Type a ${activeTab === "visible" ? "client-visible" : "private"} note...`}
          className="w-full bg-black/20 border border-white/5 rounded-lg p-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors min-h-[80px] resize-none"
        />
        <div className="flex justify-between items-center">
          <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest italic">
            Target: {activeTab === "visible" ? "Client Feed" : "Private Log"}
          </span>
          <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors active:scale-95">
            Post Note
          </button>
        </div>
      </div>


      <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredNotes.map((note) => (
          <div key={note.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors group">
            <div className="flex justify-between items-start mb-2">
               <span className="text-[10px] text-gray-500 font-mono">{note.date}</span>
               <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                  Coach: {note.author}
               </span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed font-light">
              {note.content}
            </p>
          </div>
        ))}
        {filteredNotes.length === 0 && (
          <div className="py-12 text-center text-gray-600 italic text-sm">
            No {activeTab === "visible" ? "client-visible" : "private"} notes recorded for this period.
          </div>
        )}
      </div>
    </Card>
  );
}
