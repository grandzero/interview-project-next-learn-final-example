"use client";
import { Logs } from "@/app/lib/definitions";
import { restoreFromLog } from "@/app/lib/actions";
import { redirect } from "next/navigation";

export async function ActivityLogs({ logs }: { logs: Logs[] }) {
  return (
    <div className="m-7 overflow-auto max-h-24 h-24">
      {logs.map((log) => {
        const restoreFromLogId = restoreFromLog.bind(null, log.id);
        async function handleRestore(data: FormData) {
          restoreFromLogId(data);
          redirect(`/dashboard/invoices/${log.invoice_id}/edit`);
        }
        return (
          <form
            key={log.id}
            action={handleRestore}
            className="flex space-x-4 m-2"
          >
            <input
              value={log.invoice_id}
              type="hidden"
              name="invoice_id"
              className="hidden"
              readOnly
            ></input>
            <button
              className="rounded-md border p-2 hover:bg-gray-100"
              type="submit"
            >
              Restore
            </button>
            <span className="p-4">
              User:{log.updated_by} Old Status: {log.old_status} New Status:
              {log.new_status} Updated At:{" "}
              {new Date(log.updated_at).toDateString()}
            </span>
          </form>
        );
      })}
    </div>
  );
}
