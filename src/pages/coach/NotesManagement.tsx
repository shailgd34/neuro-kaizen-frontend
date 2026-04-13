import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotes, upsertNote, deleteNote, type Note, getClientsListing } from "../../api/adminApi";
import Card from "../../components/ui/Card";
import { 
  NotebookPen, 
  Search, 
  Plus, 
  Filter, 
  Trash2, 
  Edit3, 
  User, 
  Calendar,
  Tag,
  MessageSquare,
  AlertCircle,
  MoreVertical,
  X,
  History
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "react-toastify";

export default function NotesManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Partial<Note> | null>(null);

  const { data: notes, isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: () => getNotes(),
  });

  const { data: clientData } = useQuery({
    queryKey: ["clients-brief"],
    queryFn: () => getClientsListing(1, 100),
  });

  const clients = clientData?.data || [];

  const mutation = useMutation({
    mutationFn: upsertNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success(editingNote?.id ? "Note updated" : "New note created");
      setIsModalOpen(false);
      setEditingNote(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note deleted");
    }
  });

  const filteredNotes = useMemo(() => {
     let result = notes || [];
     if (selectedClient !== "all") {
       result = result.filter(n => n.clientId === selectedClient);
     }
     if (searchTerm) {
       result = result.filter(n => 
         n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
         n.clientName.toLowerCase().includes(searchTerm.toLowerCase())
       );
     }
     return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [notes, selectedClient, searchTerm]);

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleNewNote = () => {
    setEditingNote({
       category: 'General',
       clientId: '',
       content: '',
    });
    setIsModalOpen(true);
  };

  const categories: Note['category'][] = ['Progress', 'Biometric Drift', 'Session', 'Strategy', 'General'];

  return (
    <div className="pb-20 animate-in fade-in duration-700 bg-[#050608] min-h-screen">
      <main className="container mx-auto px-6 lg:px-12 py-10 max-w-[1920px]">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-secondary/10 rounded-lg">
                  <NotebookPen className="w-5 h-5 text-secondary" />
               </div>
               <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] italic">Cognitive Ledger</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Personalized Notes Management</h1>
            <p className="text-gray-500 mt-2 font-medium max-w-2xl text-sm italic">
               Capturing high-signal observations and strategic interventions for peak performance protocols.
            </p>
          </div>

          <div className="flex items-center gap-3">
             <button 
               onClick={handleNewNote}
               className="flex items-center gap-2.5 px-6 py-3.5 gold-gradient rounded-2xl text-black font-black uppercase text-[10px] tracking-widest shadow-xl shadow-secondary/10"
             >
                <Plus className="w-4 h-4" />
                Capture Entry
             </button>
          </div>
        </div>

        {/* Filters Strip */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
           <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-secondary transition-colors" />
              <input 
                type="text" 
                placeholder="Search across cognitive ledger..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0B0F1A] border border-white/5 rounded-2xl pl-11 pr-4 py-3.5 text-xs font-bold text-white focus:outline-none focus:border-secondary/50 transition-all shadow-xl placeholder:text-gray-700"
              />
           </div>

           <div className="relative w-full md:w-64">
              <select 
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full bg-[#0B0F1A] border border-white/5 rounded-2xl px-5 py-3.5 text-xs font-bold text-white appearance-none focus:outline-none focus:border-secondary transition-all cursor-pointer"
              >
                 <option value="all">Global Repository</option>
                 {clients.map(c => (
                   <option key={c.clientId} value={c.clientId}>{c.name}</option>
                 ))}
              </select>
              <Filter className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
           </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {isLoading ? (
             Array.from({ length: 6 }).map((_, i) => (
               <div key={i} className="h-64 bg-white/5 rounded-3xl animate-pulse" />
             ))
           ) : filteredNotes.length === 0 ? (
             <div className="col-span-full py-32 flex flex-col items-center gap-5 opacity-20">
                <MessageSquare className="w-16 h-16 text-white" />
                <p className="text-xs font-black uppercase tracking-[0.4em]">No Observation Data Found</p>
             </div>
           ) : (
             filteredNotes.map((note) => (
               <Card key={note.id} className="group p-0 bg-[#0B0F1A]/40 border-white/5 backdrop-blur-2xl hover:border-secondary transition-all duration-500 overflow-hidden relative shadow-2xl">
                  {/* Note Header */}
                  <div className="p-6 pb-4 border-b border-white/[0.03] flex justify-between items-start">
                     <div className="flex flex-col gap-2">
                        <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest w-fit border ${
                          note.category === 'Biometric Drift' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          note.category === 'Progress' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          'bg-secondary/10 text-secondary border-secondary/20'
                        }`}>
                           {note.category}
                        </div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                           <User className="w-3.5 h-3.5 text-gray-500" />
                           {note.clientName}
                        </h4>
                     </div>
                     <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(note)} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all">
                           <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteMutation.mutate(note.id)} className="p-2 hover:bg-rose-500/10 rounded-lg text-gray-400 hover:text-rose-400 transition-all">
                           <Trash2 className="w-3.5 h-3.5" />
                        </button>
                     </div>
                  </div>

                  {/* Note Content */}
                  <div className="p-6">
                     <p className="text-sm font-medium text-gray-400 leading-relaxed italic line-clamp-4">
                        "{note.content}"
                     </p>
                  </div>

                  {/* Note Footer */}
                  <div className="px-6 py-4 bg-black/20 flex items-center justify-between">
                     <span className="text-[10px] text-gray-600 font-mono font-bold flex items-center gap-1.5 uppercase tracking-tighter">
                        <Calendar className="w-3 h-3" />
                        {new Date(note.timestamp).toLocaleDateString()}
                     </span>
                     <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest italic">
                        By {note.author}
                     </span>
                  </div>
               </Card>
             ))
           )}
        </div>
      </main>

      {/* Modal / Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <Card className="w-full max-w-xl bg-[#090C10] border-white/10 p-0 overflow-hidden shadow-edge shadow-secondary/5 translate-y-[-20px] animate-in slide-in-from-top-4 duration-500">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                 <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                    <History className="w-5 h-5 text-secondary" />
                    {editingNote?.id ? 'Adjust Protocol Note' : 'New Strategic Observation'}
                 </h3>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="p-8 space-y-6">
                 {/* Client Selection */}
                 {!editingNote?.id && (
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Target Biometric Entity</label>
                      <select 
                        value={editingNote?.clientId}
                        onChange={(e) => setEditingNote(prev => ({ ...prev, clientId: e.target.value }))}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-secondary transition-all"
                      >
                         <option value="">Select Client...</option>
                         {clients.map(c => (
                           <option key={c.clientId} value={c.clientId}>{c.name}</option>
                         ))}
                      </select>
                   </div>
                 )}

                 {/* Category Selection */}
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Data Category</label>
                    <div className="flex flex-wrap gap-2">
                       {categories.map(cat => (
                         <button 
                           key={cat}
                           onClick={() => setEditingNote(prev => ({ ...prev, category: cat }))}
                           className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                             editingNote?.category === cat 
                             ? 'bg-secondary text-black shadow-lg shadow-secondary/20' 
                             : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/10'
                           }`}
                         >
                            {cat}
                         </button>
                       ))}
                    </div>
                 </div>

                 {/* Content Area */}
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Heuristic Narrative</label>
                    <textarea 
                      rows={5}
                      value={editingNote?.content}
                      onChange={(e) => setEditingNote(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Input strategic observations or session outcomes..."
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-white focus:outline-none focus:border-secondary transition-all placeholder:text-gray-800 resize-none"
                    />
                 </div>
              </div>

              <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-4">
                  <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">
                     Discard
                  </button>
                  <button 
                    onClick={() => mutation.mutate(editingNote as Note)}
                    disabled={!editingNote?.content || !editingNote?.clientId}
                    className="px-10 py-3.5 gold-gradient rounded-xl text-black font-black uppercase text-[10px] tracking-widest shadow-xl shadow-secondary/20 transition-all disabled:opacity-20"
                  >
                     Log Entry
                  </button>
              </div>
           </Card>
        </div>
      )}

    </div>
  );
}
