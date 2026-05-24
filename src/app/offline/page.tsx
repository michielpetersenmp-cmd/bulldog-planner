export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl mb-4">📡</div>
      <h1 className="font-display text-2xl font-bold text-primary mb-2">Geen verbinding</h1>
      <p className="text-gray-500 mb-6">
        Je bent offline. Eerder bekeken pagina's zijn nog beschikbaar.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="btn-primary"
      >
        Opnieuw proberen
      </button>
    </div>
  );
}
