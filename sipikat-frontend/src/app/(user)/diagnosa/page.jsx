import { redirect } from 'next/navigation';
import DiagnosaForm from '@/components/user/DiagnosaForm';

export default async function DiagnosaPage({ searchParams }) {
    const resolvedSearchParams = await searchParams;

    if (resolvedSearchParams && Object.keys(resolvedSearchParams).length > 0) {
        redirect('/diagnosa');
    }

    return <DiagnosaForm />;
}
