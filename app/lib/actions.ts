'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth, signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { cookies } from 'next/headers';

export async function setFilterCookie(data: FormData){
  const selectedTab = data.get("status") as string;
  cookies().set("filter", selectedTab, {expires: new Date(Date.now() + 1000 * 60 * 60 * 24)});
  revalidatePath("/dashboard/invoices");
}

export async function getFilterCookie(){
  return cookies().get("filter")?.value || "all";
}

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid', 'canceled'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ date: true, id: true });
const UpdateInvoiceId = FormSchema.pick({status: true});

async function* logger(invoice_id: string, new_status: string){

  const session = await auth();
  const user = session?.user?.email;
  
  if(!session || !user ) return

  const {rows} = await sql`SELECT status FROM invoices WHERE id = ${invoice_id}`;
  const old_status = rows?.[0].status;
  yield;
  
   
  await sql`
  INSERT INTO logs(
    updated_by,
    old_status,
    invoice_id,
    new_status,
    updated_at
  ) VALUES (
    ${user},
    ${old_status},
    ${invoice_id},
    ${new_status},
    NOW()
  )
  `
}



export async function restoreFromLog(id: string, data: FormData){
  try{
    
    const invoice_id = data.get("invoice_id") as string;
    // TODO: Fix this sql later
    // await sql`
    // WITH old_status_rec AS old_status (
    //   SELECT old_status FROM logs WHERE id = ${id}
    // ) UPDATE invoices
    //  SET status = (SELECT old_status FROM old_status_rec)
    //  WHERE id = ${invoice_id}
    // `

    const session = await auth();
    const user = session?.user?.email;
   
    if(!session || !user ) return
  

    const {rows, rowCount} = await sql`SELECT * FROM logs WHERE id = ${id}`
    if(rowCount == 0) throw Error("Error occured while getting logs");
    const old_status = rows[0].old_status;
    const new_status = rows[0].new_status;

    await sql`UPDATE invoices SET status = ${old_status} WHERE id=${invoice_id}`;
    // logging latest change
    sql`INSERT INTO logs(
    updated_by,
    old_status,
    invoice_id,
    new_status,
    updated_at
  ) VALUES (
    ${user},
    ${new_status},
    ${invoice_id},
    ${old_status},
    NOW()
  )`

  revalidatePath(`/dashboard/invoices/${invoice_id}/edit`)
    
  }catch(err){
    console.log(err);
    return {message: "Error occured while restoring"}
  }
}



export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  // Validate form fields using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  // Insert data into the database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoiceId(id: string, prevState: State, formData: FormData){
  const validatedFields = UpdateInvoiceId.safeParse({
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { status } = validatedFields.data;
  const loggerIterator = logger(id, status);

  try {
    await loggerIterator.next()
    await sql`
      UPDATE invoices
      SET status = ${status}
      WHERE id = ${id}
    `;
    await loggerIterator.next();
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const loggerIterator = logger(id, status);
  try {
    await loggerIterator.next();
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
    await loggerIterator.next();
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  // throw new Error('Failed to Delete Invoice');
  const loggerIterator = logger(id, 'canceled');
  try {
    await loggerIterator.next()
    await sql`UPDATE invoices SET status = 'canceled' WHERE id = ${id}`;
    await loggerIterator.next();
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
