import Form from "@/app/ui/invoices/edit-form";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import {
  fetchInvoiceById,
  fetchCustomers,
  fetchActivityLog,
} from "@/app/lib/data";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ActivityLogs } from "@/app/ui/invoices/activity-logs";

export const metadata: Metadata = {
  title: "Edit Invoice",
};

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const [invoice, customers, logs] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers(),
    fetchActivityLog(id),
  ]);

  if (!invoice) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Invoices", href: "/dashboard/invoices" },
          {
            label: "Edit Invoice",
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form invoice={invoice} customers={customers} />
      <ActivityLogs logs={logs} />
    </main>
  );
}
