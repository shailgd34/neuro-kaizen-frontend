import { Check } from "lucide-react";

interface TimelineEvent {
  label: string;
  date: string;
  status: "completed" | "current" | "pending";
}

interface TimelineProps {
  events: TimelineEvent[];
}

export default function Timeline({ events }: TimelineProps) {
  return (
    <div className="flex flex-col gap-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
      {events.map((event, index) => {
        const isCompleted = event.status === "completed";
        const isCurrent = event.status === "current";

        return (
          <div key={index} className="flex gap-4 relative z-10">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                isCompleted
                  ? "bg-blue-500 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  : isCurrent
                  ? "bg-cardBg border-blue-500"
                  : "bg-cardBg border-white/10"
              }`}
            >
              {isCompleted ? (
                <Check className="w-3 h-3 text-white" />
              ) : (
                <div
                  className={`w-2 h-2 rounded-full ${
                    isCurrent ? "bg-blue-500 animate-pulse" : "bg-white/10"
                  }`}
                />
              )}
            </div>

            <div className="flex flex-col">
              <span
                className={`text-sm font-medium ${
                  isCurrent ? "text-blue-400" : "text-gray-300"
                }`}
              >
                {event.label}
              </span>
              <span className="text-xs text-gray-500 mt-0.5">{event.date}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
