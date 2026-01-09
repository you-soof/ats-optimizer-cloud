import { Layout } from '@/components/layout/Layout';
import { DeviceRegistrationForm } from '@/components/forms/DeviceRegistrationForm';

export default function RegisterDevice() {
  return (
    <Layout title="Register Device" subtitle="Add a new heat pump to your system">
      <div className="max-w-3xl mx-auto">
        <DeviceRegistrationForm />
      </div>
    </Layout>
  );
}
