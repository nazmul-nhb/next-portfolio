import type { Metadata } from 'next';
import { SettingsClient } from './_components/SettingsClient';

export const metadata: Metadata = {
    title: 'Settings',
    description: 'Manage your profile and account settings.',
};

export default function SettingsPage() {
    return <SettingsClient />;
}
