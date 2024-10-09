## TRAVLRD Interview Project

1. Fork the repository or use it as a template
2. Run `pnpm install`
3. Follow the steps outlined here: https://nextjs.org/learn/dashboard-app/setting-up-your-database#create-a-postgres-database

- Initialize a new repository and publish it to Github (also make sure to set the repo to public)
- Sign into your Vercel account and deploy your repository as a new project
- Install the Vercel CLI: https://vercel.com/docs/cli
- Run `vercel link` to link your project to the Vercel CLI
- Create a new Postgres database on Vercel
- Connect the database to your project via the dashboard (this will automatically add the postgres environment variables to the project)
- Upload the remaining two environment variables to the Vercel project settings from the `.env.example` file
- Run `vercel env pull .env.development.local` to make the latest environment variables available to your project locally
- Run `vercel dev` to start the development server

4. Seed the database by opening `/seed` in your browser. This will create a user account that you can use to log in to the dashboard
5. Complete the interview task
6. Send us the link to your GitHub repo and the link to your deployed app (don't forget to set the repo to public)

TASKS :

- Invoices should never be deleted. Instead, they’ll have a third status, which is `Canceled`. ++

- Every invoice should have a due date of 14 days. A Pending invoice that is older than 14 days should be displayed as `Overdue`, instead of `Pending`. ++

- In the invoices list, clicking on the status chip of an invoice should open a drop-down. The buttons in the drop-down should be the other possible statuses of the invoice, and clicking on them should update the status of the invoice. ++

- Add 5 tabs to the invoices page, which will filter the list by status: All, Paid, Pending, Overdue, Canceled. The browser should remember the selected tab, even after the user closed the page. Try to achieve it using only server components. +++

- Implement audit logs that track and display all status changes of invoices, with time stamps and displaying the user who performed the action. Show these change logs on the edit page of the invoice. Each log should have a restore button, that restores the invoice to that state. This restore action should also appear in the activity log. ++

- If the content of the dashboard doesn't update after you modify an invoice, that is a bug. Fix this issue.
