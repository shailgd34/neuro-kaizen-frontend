import { useState } from "react";
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
  MessageSquare,
  AlertCircle,
  MoreHorizontal,
  X,
  History,
  CheckCircle2,
  Clock,
  Target,
  ChevronRight,
  Paperclip,
  Flag,
  LayoutGrid
} from "lucide-react";
import { toast } from "react-toastify";

// Types for new features
type Task = {
  id: string;
  title: string;
  assignedDate: string;
  status: 'Pending' | 'Completed';
  linkedWeek: number;
  priority: 'High' | 'Medium' | 'Low';
};

type Goal = {
  id: string;
  title: string;
  progress: number;
  status: 'On Track' | 'At Risk' | 'Behind';
  domain: string;
};

// Mock data for extended features
const mockTasks: Task[] = [
  { id: '1', title: 'Review recovery protocols for W7', assignedDate: '2024-03-22', status: 'Pending', linkedWeek: 7, priority: 'High' },
  { id: '2', title: 'Update baseline threshold config', assignedDate: '2024-03-21', status: 'Completed', linkedWeek: 6, priority: 'Medium' },
  { id: '3', title: 'Schedule biometric calibration', assignedDate: '2024-03-20', status: 'Pending', linkedWeek: 8, priority: 'High' },
];

const mockGoals: Goal[] = [
  { id: '1', title: 'Stabilize Cognitive Drift', progress: 65, status: 'On Track', domain: 'Cognitive' },
  { id: '2', title: 'Increase Deep Sleep Consistency', progress: 40, status: 'At Risk', domain: 'Recovery' },
  { id: '3', title: 'Improve Emotional Baseline', progress: 85, status: 'On Track', domain: 'Emotional' },
];

export default function NotesManagement() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'notes' | 'tasks' | 'goals'>('notes');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Partial<Note> | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // APIs
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
      toast.success(editingNote?.id ? "Note updated" : "New note captured");
      setIsModalOpen(false);
      setEditingNote(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note purged from ledger");
    }
  });

  const filteredNotes = (notes || []).filter(n => {
    const matchesClient = selectedClient === "all" || n.clientId === selectedClient;
    const matchesSearch = n.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          n.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClient && matchesSearch;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const activeNote = notes?.find(n => n.id === selectedNoteId);

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleNewNote = () => {
    setEditingNote({
       category: 'Session',
       clientId: selectedClient !== "all" ? selectedClient : '',
       content: '',
    });
    setIsModalOpen(true);
  };

  const categories: Note['category'][] = ['Session', 'Progress', 'Biometric Drift', 'Strategy', 'General'];

  return (
    <div className="pb-12 space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-[#090C10]/40 border border-white/5 rounded-3xl p-8 backdrop-blur-md">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black text-white tracking-tight">Notes Management</h2>
            <div className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-secondary uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></div>
              Cognitive Ledger
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500">Capturing strategic interventions and observational data for performance coaching.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <select 
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="appearance-none bg-black/40 border border-white/10 rounded-xl px-5 py-2.5 pr-12 text-xs font-black text-white focus:outline-none focus:border-secondary/50 cursor-pointer transition-all hover:bg-black/60 min-w-[200px]"
            >
              <option value="all" className="bg-[#090C10]">All Clients</option>
              {clients.map(c => <option key={c.clientId} value={c.clientId} className="bg-[#090C10]">{c.name}</option>)}
            </select>
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none group-hover:text-white transition-colors" />
          </div>

          <button 
            onClick={handleNewNote}
            className="flex items-center gap-2 px-5 py-2.5 gold-gradient rounded-xl text-black font-black uppercase text-[10px] tracking-widest shadow-lg shadow-secondary/10 hover:opacity-90 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Note
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex bg-[#090C10] border border-white/5 rounded-2xl p-1.5 gap-1.5 w-full md:w-auto">
          {[
            { id: 'notes', label: 'Notes', icon: NotebookPen },
            { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
            { id: 'goals', label: 'Goals', icon: Target }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                ? 'bg-secondary text-black shadow-lg shadow-secondary/20' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative group w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-white transition-colors" />
          <input 
            type="text" 
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#090C10] border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold text-white focus:outline-none focus:border-secondary/30 transition-all placeholder:text-gray-700"
          />
        </div>
      </div>

      {/* Main Content View */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 min-h-[600px]">
        {/* Left List Column */}
        <div className={`${activeTab === 'notes' && selectedNoteId ? 'xl:col-span-4' : 'xl:col-span-12'} space-y-4`}>
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {filteredNotes.length === 0 ? (
                <div className="py-32 flex flex-col items-center gap-4 opacity-20 bg-[#090C10]/40 rounded-3xl border border-white/5 border-dashed">
                  <MessageSquare className="w-16 h-16" />
                  <p className="text-xs font-black uppercase tracking-[0.4em]">Ledger is Empty</p>
                </div>
              ) : (
                filteredNotes.map((note) => (
                  <Card 
                    key={note.id}
                    onClick={() => setSelectedNoteId(note.id)}
                    className={`group p-6 cursor-pointer border-l-2 transition-all ${
                      selectedNoteId === note.id 
                      ? 'bg-secondary/5 border-secondary border-y-white/10 border-r-white/10' 
                      : 'bg-[#090C10]/40 border-transparent hover:border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded ${
                            note.category === 'Biometric Drift' ? 'bg-rose-500/10 text-rose-400' :
                            note.category === 'Progress' ? 'bg-emerald-500/10 text-emerald-400' :
                            'bg-blue-500/10 text-blue-400'
                          }`}>
                            {note.category}
                          </span>
                          <span className="text-[10px] text-gray-600 font-bold">• {new Date(note.timestamp).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white group-hover:text-secondary transition-colors">{note.clientName}</h4>
                      </div>
                      <MoreHorizontal className="w-4 h-4 text-gray-700 group-hover:text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-medium">{note.content}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                          <User className="w-2.5 h-2.5 text-gray-500" />
                        </div>
                        <span className="text-[9px] font-bold text-gray-600">Coach {note.author}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-secondary/40 transition-transform ${selectedNoteId === note.id ? 'translate-x-1' : ''}`} />
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {mockTasks.map(task => (
                <Card key={task.id} className="p-6 bg-[#090C10]/40 border-white/5 hover:border-white/10 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-xl bg-white/5 group-hover:bg-opacity-80 transition-all ${
                      task.status === 'Completed' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                      task.priority === 'High' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-white/5 text-gray-500'
                    }`}>
                      {task.priority} Priority
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2 leading-tight">{task.title}</h4>
                  <div className="space-y-3 pt-4 border-t border-white/[0.03] mt-auto">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-gray-600 uppercase tracking-widest">Assigned</span>
                      <span className="text-gray-400">{task.assignedDate}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-gray-600 uppercase tracking-widest">Context</span>
                      <span className="text-secondary">Week {task.linkedWeek} Protocol</span>
                    </div>
                    <button className={`w-full py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      task.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                    }`}>
                      {task.status === 'Completed' ? 'Success' : 'Mark Done'}
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {mockGoals.map(goal => (
                <Card key={goal.id} className="p-6 bg-[#090C10]/40 border-white/5 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                      <div className="p-2.5 rounded-xl bg-white/5 text-secondary group-hover:scale-110 transition-transform">
                        <Target className="w-5 h-5" />
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                        goal.status === 'On Track' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {goal.status}
                      </span>
                    </div>
                    <h4 className="text-base font-black text-white mb-1 tracking-tight">{goal.title}</h4>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">{goal.domain} Domain Foundation</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1.5">
                        <span className="text-gray-600">Calibration Progress</span>
                        <span className="text-secondary">{goal.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-secondary shadow-[0_0_10px_rgba(234,179,8,0.5)] transition-all duration-1000" style={{ width: `${goal.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Panel (Notes Column Only) */}
        {activeTab === 'notes' && selectedNoteId && (
          <div className="xl:col-span-8 animate-in slide-in-from-right-4 duration-500">
            {activeNote ? (
              <Card className="h-full bg-[#090C10]/60 border-white/10 overflow-hidden flex flex-col p-0 sticky top-4 shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
                {/* Panel Header */}
                <div className="p-8 border-b border-white/10 bg-white/[0.02] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-secondary shadow-[0_0_20px_rgba(234,179,8,1)]"></div>
                  <div className="flex justify-between items-start relative z-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-secondary/10 border border-secondary/20 text-secondary">
                          <NotebookPen className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Detailed Observation Entry</p>
                          <h3 className="text-2xl font-black text-white tracking-tight leading-none uppercase">{activeNote.clientName}</h3>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-[10px] font-bold text-gray-300">
                           <Clock className="w-3.5 h-3.5 text-secondary" />
                           {new Date(activeNote.timestamp).toLocaleString()}
                         </div>
                         <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-[10px] font-bold text-gray-300 capitalize">
                           <Flag className="w-3.5 h-3.5 text-blue-400" />
                           Category: {activeNote.category}
                         </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => handleEdit(activeNote)} className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                        <Edit3 className="w-4 h-4" />
                       </button>
                       <button onClick={() => deleteMutation.mutate(activeNote.id as string)} className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 hover:bg-rose-500/20 transition-all">
                        <Trash2 className="w-4 h-4" />
                       </button>
                       <button onClick={() => setSelectedNoteId(null)} className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all ml-4">
                        <X className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </div>

                {/* Panel Content */}
                <div className="flex-1 overflow-y-auto p-12 space-y-12">
                   <div className="space-y-6">
                      <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-4">
                        Protocol Narrative
                        <div className="flex-1 h-px bg-white/5"></div>
                      </h5>
                      <div className="bg-[#050608] border border-white/5 rounded-3xl p-8 italic shadow-inner">
                         <p className="text-lg font-medium text-gray-200 leading-relaxed font-serif">
                            "{activeNote.content}"
                         </p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Institutional Context</h5>
                        <div className="space-y-3">
                           <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                              <span className="text-xs font-bold text-gray-500">Originating Coach</span>
                              <span className="text-xs font-black text-white">{activeNote.author}</span>
                           </div>
                           <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                              <span className="text-xs font-bold text-gray-500">Security Clearance</span>
                              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Global Admin</span>
                           </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Related Objects</h5>
                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col items-center justify-center text-center gap-3 border-dashed">
                           <Paperclip className="w-8 h-8 text-gray-700" />
                           <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">No attachments linked to this entry</p>
                           <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-white transition-all">
                              Upload Attachment
                           </button>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Panel Footer */}
                <div className="p-8 bg-black/40 border-t border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4 text-secondary/40" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Referenced Period: Week 6</span>
                      </div>
                   </div>
                   <button 
                    onClick={() => handleEdit(activeNote)}
                    className="px-8 py-3 bg-secondary text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-secondary/80 transition-all shadow-lg shadow-secondary/20"
                   >
                    Modify Entry
                   </button>
                </div>
              </Card>
            ) : null}
          </div>
        )}
      </div>

      {/* Capture Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
           <Card className="w-full max-w-2xl bg-[#0C1018] border-white/10 p-0 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
              <div className="absolute top-0 left-0 w-full h-1.5 gold-gradient"></div>
              
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-secondary/10 rounded-2xl border border-secondary/30">
                      <History className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white tracking-tight">
                        {editingNote?.id ? 'Adjust Protocol Ledger' : 'Capture Critical Observation'}
                      </h3>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Strategic entry for high-signal analysis</p>
                    </div>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/5 rounded-2xl text-gray-500 hover:text-white transition-all">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto">
                 {/* Client Selection */}
                 {!editingNote?.id ? (
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Contextual Entity (Client)</label>
                      <div className="relative group">
                        <select 
                          value={editingNote?.clientId}
                          onChange={(e) => setEditingNote(prev => ({ ...prev, clientId: e.target.value }))}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-secondary transition-all appearance-none"
                        >
                           <option value="">Select Target...</option>
                           {clients.map(c => (
                             <option key={c.clientId} value={c.clientId}>{c.name}</option>
                           ))}
                        </select>
                        <User className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                      </div>
                   </div>
                 ) : (
                   <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Linking Observation for:</span>
                      <span className="text-sm font-black text-secondary">{editingNote?.clientName}</span>
                   </div>
                 )}

                 {/* Category Selection */}
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Observational Taxonomy</label>
                    <div className="flex flex-wrap gap-3">
                       {categories.map(cat => (
                         <button 
                           key={cat}
                           onClick={() => setEditingNote(prev => ({ ...prev, category: cat }))}
                           className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                             editingNote?.category === cat 
                             ? 'bg-secondary/10 border-secondary text-secondary shadow-[0_0_20px_rgba(234,179,8,0.1)]' 
                             : 'bg-white/5 border-transparent text-gray-500 hover:border-white/10'
                           }`}
                         >
                            {cat}
                         </button>
                       ))}
                    </div>
                 </div>

                 {/* Content Area */}
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Log Content (Heuristic)</label>
                    <textarea 
                      rows={6}
                      value={editingNote?.content}
                      onChange={(e) => setEditingNote(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Input strategic observations, biometric outliers, or subjective feedback summary..."
                      className="w-full bg-black/40 border border-white/10 rounded-3xl px-6 py-5 text-sm font-medium text-white focus:outline-none focus:border-secondary transition-all placeholder:text-gray-800 resize-none font-serif italic"
                    />
                 </div>
              </div>

              <div className="p-8 border-t border-white/5 bg-white/[0.01] flex justify-end items-center gap-6">
                  <button onClick={() => setIsModalOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-gray-300 transition-all">
                     Abandon Entry
                  </button>
                  <button 
                    onClick={() => mutation.mutate(editingNote as Note)}
                    disabled={!editingNote?.content || !editingNote?.clientId}
                    className="px-12 py-4 gold-gradient rounded-2xl text-black font-black uppercase text-[11px] tracking-widest shadow-2xl shadow-secondary/20 transition-all disabled:opacity-30 disabled:grayscale"
                  >
                     {editingNote?.id ? 'Record Modification' : 'Seal and Log Entry'}
                  </button>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
}
