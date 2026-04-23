import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import usePatientStore from '../context/patientStore';
import useAppointmentStore from '../context/appointmentStore';
import useQueueStore from '../context/queueStore';
import PatientForm from '../components/PatientForm';
import AppointmentForm from '../components/AppointmentForm';
import AppointmentList from '../components/AppointmentList';
import ConfirmActionDialog from '../components/ConfirmActionDialog';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { patients, fetchPatients, deletePatient } = usePatientStore();
  const { appointments, fetchAppointments } = useAppointmentStore();
  const {
    currentPatient,
    queue,
    fetchQueue,
    removeFromQueue,
    markNoShow,
    syncTodayScheduledAppointmentsToQueue,
  } = useQueueStore();

  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchPatients(), fetchAppointments()]);
      await syncTodayScheduledAppointmentsToQueue();
      await fetchQueue();
    };

    load();
  }, [fetchPatients, fetchAppointments, fetchQueue, syncTodayScheduledAppointmentsToQueue]);

  const todayAppointments = appointments.filter(
    (apt) => format(new Date(apt.date_time), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.admin')}</h1>
        <div className="space-x-4">
          <button
            onClick={() => {
              setEditingPatient(null);
              setShowPatientForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {t('patients.addPatient')}
          </button>
          <button
            onClick={() => {
              setEditingAppointment(null);
              setShowAppointmentForm(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            {t('appointments.title')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Appointments</h3>
          <p className="text-3xl font-bold text-blue-600">{todayAppointments.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Waiting Patients</h3>
          <p className="text-3xl font-bold text-yellow-600">{queue.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Patient</h3>
          <p className="text-lg font-medium text-gray-900">
            {currentPatient?.patients?.name || 'None'}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Waiting Queue</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {queue.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-sm text-gray-500">No patients in waiting queue today.</td>
                </tr>
              ) : (
                queue.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.patients?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.patients?.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setConfirmAction({
                          title: 'Remove from waiting queue',
                          description: `Remove ${item.patients?.name ?? 'this patient'} from today's waiting queue?`,
                          confirmText: 'Remove',
                          action: () => removeFromQueue(item.id),
                        })}
                        className="text-red-600 hover:text-red-900 mr-4"
                      >
                        Remove
                      </button>
                      <button
                        onClick={() => setConfirmAction({
                          title: 'Mark as no show',
                          description: `Mark ${item.patients?.name ?? 'this patient'} as no-show and cancel today's appointment?`,
                          confirmText: 'Mark no-show',
                          action: () => markNoShow(item.id),
                        })}
                        className="text-amber-600 hover:text-amber-900"
                      >
                        No Show
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('patients.title')}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('patients.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('patients.phone')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('patients.notes')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {patient.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.notes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingPatient(patient);
                        setShowPatientForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => setConfirmAction({
                        title: 'Delete patient',
                        description: `Delete ${patient.name}? This may remove related appointments if your database enforces cascade deletes.`,
                        confirmText: 'Delete patient',
                        action: () => deletePatient(patient.id),
                      })}
                      className="text-red-600 hover:text-red-900"
                    >
                      {t('common.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AppointmentList
        appointments={appointments}
        onEdit={(apt) => {
          setEditingAppointment(apt);
          setShowAppointmentForm(true);
        }}
      />

      {showPatientForm && (
        <PatientForm
          patient={editingPatient}
          onClose={() => {
            setShowPatientForm(false);
            setEditingPatient(null);
          }}
        />
      )}

      {showAppointmentForm && (
        <AppointmentForm
          appointment={editingAppointment}
          onClose={() => {
            setShowAppointmentForm(false);
            setEditingAppointment(null);
          }}
        />
      )}
      <ConfirmActionDialog
        open={Boolean(confirmAction)}
        onOpenChange={(isOpen) => {
          if (!isOpen) setConfirmAction(null);
        }}
        title={confirmAction?.title}
        description={confirmAction?.description}
        confirmText={confirmAction?.confirmText ?? 'Confirm'}
        onConfirm={async () => {
          if (!confirmAction?.action) return;
          await confirmAction.action();
          setConfirmAction(null);
        }}
        successMessage="Action completed successfully."
        errorMessage="Action failed. Please try again."
      />
    </div>
  );
};

export default AdminDashboard;
