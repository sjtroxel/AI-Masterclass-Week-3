import { useServerStatus } from "../../../hooks/useServerStatus";

export default function ServerStatusBadge() {
  const { data, loading, error } = useServerStatus();

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
        Connecting to server...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-400">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        Server offline
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-green-400">
      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      {data?.message}
    </div>
  );
}
