import { useState } from 'react';
import { useCurrentUser } from '../services/users';
import PageHeader from '../components/Layout/PageHeader';
import Tabs from '../components/Layout/Tabs';
import ProfileSettings from '../components/Settings/ProfileSettings';
import PasswordSettings from '../components/Settings/PasswordSettings';
import DeleteAccount from '../components/Settings/DeleteAccount';
import SettingsLoader from '../components/UI/SettingsLoader';

const tabs = [
  { name: 'Profile' },
  { name: 'Password' },
  { name: 'Danger Zone' },
];

export default function Settings() {
  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const [activeTab, setActiveTab] = useState(tabs[0].name);

  if (loadingUser) return <SettingsLoader />;

  return (
    <>
      <PageHeader title="Account Settings" subtitle="Manage your account details and preferences." />
      <main className="max-w-3xl mx-auto my-10 p-4 md:p-0">
        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="mt-8">
          {activeTab === 'Profile' && <ProfileSettings user={user} />}
          {activeTab === 'Password' && <PasswordSettings />}
          {activeTab === 'Danger Zone' && <DeleteAccount />}
        </div>
      </main>
    </>
  );
}
