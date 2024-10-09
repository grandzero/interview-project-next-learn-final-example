import { restoreFromLog } from "@/app/lib/actions";
import { Logs } from "@/app/lib/definitions";
export function LogLine({ log }: { log: Logs }) {
  const restoreFromLogId = restoreFromLog.bind(null, log.id);
  async function handleRestore(data: FormData) {
    "use server";
    restoreFromLogId(data);
  }

  return (
    <form action={handleRestore} className="flex space-x-4 m-2">
      <input
        value={log.invoice_id}
        type="hidden"
        name="invoice_id"
        className="hidden"
        readOnly
      ></input>
      <button className="rounded-md border p-2 hover:bg-gray-100" type="submit">
        Restore
      </button>
      <span className="p-4">
        User:{log.updated_by} Old Status: {log.old_status} New Status:
        {log.new_status} Updated At:{" "}
        {new Date(log.updated_at).toLocaleTimeString()}
      </span>
    </form>
  );
}
