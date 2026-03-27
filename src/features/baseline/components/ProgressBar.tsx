export default function ProgressBar({ progress }: {progress:number}) {

  return (

    <div className="w-full bg-[#1A222C] h-2 rounded">

      <div
        className="bg-green-500 h-2 rounded"
        style={{ width: `${progress}%` }}
      />

    </div>

  );
}