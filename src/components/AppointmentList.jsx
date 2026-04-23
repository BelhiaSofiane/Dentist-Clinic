import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Edit, Trash2 } from 'lucide-react';
import useAppointmentStore from '../context/appointmentStore';
import useAuthStore from '../context/authStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ConfirmActionDialog from './ConfirmActionDialog';

const statusTranslationKey = {
  scheduled: 'scheduled',
  'in-progress': 'inProgress',
  completed: 'completed',
  canceled: 'canceled',
};

const AppointmentList = ({ appointments, onEdit }) => {
  const { t } = useTranslation();
  const { deleteAppointment } = useAppointmentStore();
  const { role } = useAuthStore();
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  const canEdit = role === 'admin' || role === 'agent';
  const canDelete = role === 'admin';

  const handleDelete = async () => {
    if (!appointmentToDelete) return;
    await deleteAppointment(appointmentToDelete.id);
    setAppointmentToDelete(null);
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'scheduled':
        return 'secondary';
      case 'in-progress':
        return 'outline';
      case 'completed':
        return 'default';
      case 'canceled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('appointments.title')}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              {canEdit && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {appointment.patients?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(appointment.date_time), 'PPp')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {appointment.duration} min
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {appointment.reason}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={getStatusVariant(appointment.status)}>
                    {t(`appointments.${statusTranslationKey[appointment.status] ?? appointment.status}`)}
                  </Badge>
                </td>
                {canEdit && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEdit(appointment)}
                      className="mr-2 text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {canDelete && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setAppointmentToDelete(appointment)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmActionDialog
        open={Boolean(appointmentToDelete)}
        onOpenChange={(isOpen) => {
          if (!isOpen) setAppointmentToDelete(null);
        }}
        title="Delete appointment"
        description={`Delete appointment for ${appointmentToDelete?.patients?.name ?? 'this patient'}? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        successMessage="Appointment deleted successfully."
        errorMessage="Failed to delete appointment."
      />
    </div>
  );
};

export default AppointmentList;
