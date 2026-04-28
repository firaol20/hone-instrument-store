import { redirect } from 'next/navigation';

export default function AdminPage() {
  // This triggers a 307 (Temporary Redirect) to your dashboard
  redirect('/admin/overview');

  // Return null because this component will never actually render
  return null;
}