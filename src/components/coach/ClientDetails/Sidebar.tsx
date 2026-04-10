import Card from "../../ui/Card";
import Button from "../../ui/Button";
import { RefreshCw, PlusCircle, UserX, Trash2 } from "lucide-react";



interface SidebarProps {
  metadata: {
    baselineDate: string;
    itemsCompleted: string;
    completionPercentage: number;
    calibrationWindow: string;
    baselineAnchor: string;
    anchorVersion: string;
  };
}

export default function BaselineSidebar({ metadata }: SidebarProps) {
  const StatItem = ({ label, value, subValue }: { label: string, value: string, subValue?: string }) => (
    <div className="flex flex-col gap-1 py-1">
      <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
      {subValue && <span className="text-xs text-emerald-400 font-bold">{subValue}</span>}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <Card title="Baseline Metadata">
        <div className="flex flex-col gap-4">
          <StatItem label="Baseline Date" value={metadata.baselineDate} />
          <StatItem 
            label="Items Completed" 
            value={metadata.itemsCompleted} 
            subValue={`${metadata.completionPercentage}%`}
          />
          <StatItem label="Calibration Window" value={metadata.calibrationWindow} />
          <StatItem label="Baseline Anchor" value={metadata.baselineAnchor} />
          <StatItem label="Anchor Version" value={metadata.anchorVersion} />
          
          <Button variant="goldDark" className="mt-4 w-full text-xs h-10">
            Initiate Retake
          </Button>
        </div>
      </Card>

      <Card title="Quick Actions">
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outlineWhite" 
            className="flex-col gap-1.5 h-auto py-4 !border-blue-500/30 !text-blue-400 hover:bg-blue-500/10 text-[10px] uppercase font-black tracking-widest"
          >
            <RefreshCw className="w-4 h-4" />
            Initiate Retake
          </Button>
          <Button 
            variant="outlineWhite" 
            className="flex-col gap-1.5 h-auto py-4 !border-amber-500/30 !text-amber-500 hover:bg-amber-500/10 text-[10px] uppercase font-black tracking-widest"
          >
            <PlusCircle className="w-4 h-4" />
            Assign Expansion
          </Button>
          <Button 
            variant="outlineWhite" 
            className="flex-col gap-1.5 h-auto py-4 !border-purple-500/30 !text-purple-400 hover:bg-purple-500/10 text-[10px] uppercase font-black tracking-widest"
          >
            <UserX className="w-4 h-4" />
            Deactivate
          </Button>
          <Button 
            variant="outlineWhite" 
            className="flex-col gap-1.5 h-auto py-4 !border-red-500/30 !text-red-500 hover:bg-red-500/10 text-[10px] uppercase font-black tracking-widest"
          >
            <Trash2 className="w-4 h-4" />
            Delete Data
          </Button>
        </div>
      </Card>




    </div>
  );
}
