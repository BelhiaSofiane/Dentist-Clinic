import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Edit, Trash2 } from 'lucide-react';
import useAppointmentStore from '../context/appointmentStore';
import useAuthStore from '../context/authStore';

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

  const canEdit = role === 'admin' || role === 'agent';
  const canDelete = role === 'admin';

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this appointment?')) {
      try {
        await deleteAppointment(id);
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                    {t(`appointments.${statusTranslationKey[appointment.status] ?? appointment.status}`)}
                  </span>
                </td>
                {canEdit && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onEdit(appointment)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(appointment.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentList;
