"use client";
import { updateInvoiceId } from "@/app/lib/actions";
import { InvoiceForm, InvoiceFormSimplified } from "@/app/lib/definitions";
import { CheckIcon, ClockIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useActionState } from "react";

export function InvoiceStatus({ invoice }: { invoice: InvoiceFormSimplified }) {
  // TODO: Change current option and display only other possible options
  const initialState = { message: "", errors: {} };
  const updateWithId = updateInvoiceId.bind(null, invoice.id);
  const [state, formAction] = useActionState(updateWithId, initialState);
  const handleOptionSelect = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selected = e.target.value;
    if (selected && selected != invoice.status) {
      const formData = new FormData();
      formData.set("status", selected);
      formAction(formData);
    }
  };

  return (
    <>
      <form>
        <select
          onChange={handleOptionSelect}
          id="status"
          defaultValue={invoice.status}
        >
          <option value="paid">Paid</option>
          <option value="pending">
            {new Date(invoice.date) <
            new Date(new Date().setDate(new Date().getDate() - 14))
              ? "Overdue"
              : "Pending"}
          </option>
          <option value="canceled">Canceled</option>
        </select>
      </form>
    </>
  );
}
