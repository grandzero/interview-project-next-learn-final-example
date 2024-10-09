import { Logs } from "@/app/lib/definitions";
import { LogLine } from "./log-line";

export function ActivityLogs({ logs }: { logs: Logs[] }) {
  return (
    <div className="m-7 overflow-auto max-h-24 h-24">
      {logs.map((item) => (
        <LogLine log={item} key={item.id} />
      ))}
    </div>
  );
}
