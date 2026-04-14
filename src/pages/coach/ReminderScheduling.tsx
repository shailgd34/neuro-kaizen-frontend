import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getReminderConfig, upsertReminderConfig, type ReminderConfig } from "../../api/adminApi";
import Card from "../../components/ui/Card";
import {
   Clock,
   Info,
   AlertCircle,
   ChevronDown,
   Globe
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function ReminderScheduling() {
   const queryClient = useQueryClient();
   const navigate = useNavigate();
   const [config, setConfig] = useState<ReminderConfig>({
      reminder_day: 'Monday',
      reminder_time: '09:00:00',
      weekly_enabled: true,
      followup_enabled: true,
      followup_after_hours: 48
   });

   const { data, isLoading } = useQuery({
      queryKey: ["reminder-config"],
      queryFn: getReminderConfig,
   });

   useEffect(() => {
      if (data) {
         setConfig(data);
      }
   }, [data]);

   const mutation = useMutation({
      mutationFn: upsertReminderConfig,
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["reminder-config"] });
         toast.success("Reminder configuration updated successfully");
      },
      onError: () => {
         toast.error("Failed to update configuration");
      }
   });

   const handleSave = () => {
      // Ensure time includes seconds if not already present
      const submissionConfig = {
         ...config,
         reminder_time: config.reminder_time.length === 5 ? `${config.reminder_time}:00` : config.reminder_time
      };
      mutation.mutate(submissionConfig);
   };

   if (isLoading) {
      return (
         <div className="flex items-center justify-center min-h-[600px]">
            <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
         </div>
      );
   }

   return (
      <div className="pb-20 animate-in fade-in duration-700">
         <main className="container mx-auto px-6 lg:px-12 py-10 max-w-5xl">

            {/* Header */}
            <div className="flex flex-col gap-4 mb-8">
               <h2 className="text-3xl font-black text-white tracking-tight">Weekly Reminder Scheduling</h2>
               <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <div className="flex items-center gap-2">
                     <Clock className="w-3.5 h-3.5" />
                     Last Updated: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : 'Jan 15, 2024 14:32 UTC'}
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-4 h-4 rounded bg-white/5 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                     </div>
                     Updated By: {data?.updatedBy || 'Sarah Chen'}
                  </div>
               </div>
            </div>

            {/* MVP Info Box */}
            <div className="bg-[#0B0F1A] border border-secondary/20 rounded-2xl p-5 mb-8 flex gap-4">
               <div className="p-2 bg-secondary/10 rounded-lg text-secondary shrink-0 h-fit">
                  <Info className="w-4 h-4" />
               </div>
               <div className="space-y-1">
                  <p className="text-xs font-bold text-white leading-relaxed">Email reminders only for MVP.</p>
                  <p className="text-[10px] text-gray-500 leading-relaxed font-medium">Each client receives one weekly reminder and one follow-up reminder if the weekly entry remains incomplete after {config.followup_after_hours} hours.</p>
               </div>
            </div>

            <div className="space-y-8">
               {/* Weekly Reminder Section */}
               <Card className="p-8 bg-[#0B0F1A]/40 border-white/5 backdrop-blur-xl">
                  <div className="mb-8">
                     <h4 className="text-lg font-black text-white mb-1">Weekly Reminder</h4>
                     <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Configure the main weekly submission reminder</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Reminder Day</label>
                        <div className="relative group">
                           <select
                              value={config.reminder_day}
                              onChange={(e) => setConfig(prev => ({ ...prev, reminder_day: e.target.value }))}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-sm font-bold text-white appearance-none focus:outline-none focus:border-secondary transition-all cursor-pointer"
                           >
                              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                 <option key={day} value={day}>{day}</option>
                              ))}
                           </select>
                           <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none group-hover:text-white transition-colors" />
                        </div>
                     </div>

                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Reminder Time</label>
                        <div className="relative group">
                           <input
                              type="time"
                              value={config.reminder_time.substring(0, 5)}
                              onChange={(e) => setConfig(prev => ({ ...prev, reminder_time: e.target.value }))}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-sm font-bold text-white focus:outline-none focus:border-secondary transition-all [color-scheme:dark]"
                           />
                           <Clock className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none group-hover:text-white transition-colors" />
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-2 mb-10 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                     <Globe className="w-3.5 h-3.5" />
                     Reminder Timezone: UTC (System Default)
                  </div>

                  <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                     <div className="space-y-1">
                        <p className="text-sm font-bold text-white">Enable Weekly Reminder</p>
                        <p className="text-[10px] font-medium text-gray-500">Applies to all active clients with weekly tracking enabled.</p>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={config.weekly_enabled} onChange={() => setConfig(prev => ({ ...prev, weekly_enabled: !prev.weekly_enabled }))} />
                        <div className="w-12 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-white"></div>
                     </label>
                  </div>
               </Card>

               {/* 48-Hour Follow-Up Section */}
               <Card className="p-8 bg-[#0B0F1A]/40 border-white/5 backdrop-blur-xl">
                  <div className="mb-8">
                     <h4 className="text-lg font-black text-white mb-1">Follow-Up Reminder</h4>
                     <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Send a follow-up email if the submission remains incomplete.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                     <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <div className="space-y-1">
                           <p className="text-sm font-bold text-white">Enable Follow-Up</p>
                           <p className="text-[10px] font-medium text-gray-500">Send reminder if incomplete</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                           <input type="checkbox" className="sr-only peer" checked={config.followup_enabled} onChange={() => setConfig(prev => ({ ...prev, followup_enabled: !prev.followup_enabled }))} />
                           <div className="w-12 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-white"></div>
                        </label>
                     </div>

                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Follow-up After (Hours)</label>
                        <div className="relative group">
                           <input
                              type="number"
                              value={config.followup_after_hours}
                              onChange={(e) => setConfig(prev => ({ ...prev, followup_after_hours: parseInt(e.target.value) || 0 }))}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-sm font-bold text-white focus:outline-none focus:border-secondary transition-all"
                              placeholder="48"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4 flex gap-3">
                     <AlertCircle className="w-3.5 h-3.5 text-gray-600 shrink-0 mt-0.5" />
                     <p className="text-[9px] font-medium text-gray-600 italic">Sent automatically if weekly submission is incomplete {config.followup_after_hours} hours after primary reminder. Follow-up reminders are triggered only when submission status remains pending.</p>
                  </div>
               </Card>

               {/* Actions */}
               <div className="flex justify-end gap-3 pt-4">
                  <button
                     onClick={() => navigate(-1)}
                     className="px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 font-black uppercase text-[10px] tracking-widest transition-all"
                  >
                     Cancel
                  </button>
                  <button
                     onClick={handleSave}
                     disabled={mutation.isPending}
                     className="px-8 py-3.5 gold-gradient hover:opacity-90 rounded-xl text-black font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-secondary/10 disabled:opacity-50"
                  >
                     {mutation.isPending ? 'Saving...' : 'Save Schedule'}
                  </button>
               </div>
            </div>

         </main>
      </div>
   );
}
