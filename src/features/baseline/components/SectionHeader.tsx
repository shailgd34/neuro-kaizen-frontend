export default function SectionHeader({
  section,
  totalSections,
  domain,
  progress
}: any) {

  return (

    <div className=" p-4 rounded-lg mb-6">

      <div className="flex justify-between text-sm text-gray-400">

        <span>Section {section} of {totalSections}</span>

        <span>Progress: {progress}% complete</span>

      </div>

      <div className="mt-2 text-xs text-gray-500">
        Domain: {domain}
      </div>

    </div>
  );
}