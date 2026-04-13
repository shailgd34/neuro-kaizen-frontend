import ClientTable from "../../components/coach/ClientTable";

export default function ClientManagement() {
  return (
    <div className="pb-20 animate-in fade-in duration-700">
      <main className="container mx-auto py-10">
        <ClientTable />
      </main>
    </div>
  );
}