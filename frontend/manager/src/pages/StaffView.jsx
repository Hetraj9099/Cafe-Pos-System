import { useState } from 'react';
import useAppContext from '../hooks/useAppContext';

const attendanceOptions = ['present', 'absent', 'leave'];

const StaffView = () => {
  const { staff, attendance, createStaff, markAttendance } = useAppContext();
  const [staffForm, setStaffForm] = useState({
    name: '',
    role: '',
    status: 'active'
  });
  const [attendanceForm, setAttendanceForm] = useState({
    staffId: '',
    date: new Date().toISOString().slice(0, 10),
    status: 'present'
  });
  const [error, setError] = useState('');

  const submitStaff = async () => {
    try {
      setError('');
      await createStaff(staffForm);
      setStaffForm({ name: '', role: '', status: 'active' });
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const submitAttendance = async () => {
    try {
      setError('');
      await markAttendance(attendanceForm);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
      <section className="space-y-6">
        <div className="rounded-[32px] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-sky-950">Add staff member</h2>
          <div className="mt-5 grid gap-3">
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="Name"
              value={staffForm.name}
              onChange={(event) => setStaffForm((current) => ({ ...current, name: event.target.value }))}
            />
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="Role"
              value={staffForm.role}
              onChange={(event) => setStaffForm((current) => ({ ...current, role: event.target.value }))}
            />
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="Status"
              value={staffForm.status}
              onChange={(event) => setStaffForm((current) => ({ ...current, status: event.target.value }))}
            />
            <button
              className="rounded-2xl bg-sky-950 px-4 py-3 font-semibold text-white"
              onClick={submitStaff}
            >
              Save staff member
            </button>
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-sky-950">Track attendance</h2>
          <div className="mt-5 grid gap-3">
            <select
              className="rounded-2xl border border-slate-200 px-4 py-3"
              value={attendanceForm.staffId}
              onChange={(event) =>
                setAttendanceForm((current) => ({ ...current, staffId: event.target.value }))
              }
            >
              <option value="">Select staff member</option>
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3"
              type="date"
              value={attendanceForm.date}
              onChange={(event) =>
                setAttendanceForm((current) => ({ ...current, date: event.target.value }))
              }
            />
            <select
              className="rounded-2xl border border-slate-200 px-4 py-3"
              value={attendanceForm.status}
              onChange={(event) =>
                setAttendanceForm((current) => ({ ...current, status: event.target.value }))
              }
            >
              {attendanceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <button
              className="rounded-2xl bg-sky-100 px-4 py-3 font-semibold text-sky-900"
              onClick={submitAttendance}
            >
              Update attendance
            </button>
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-[32px] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-sky-950">Staff overview</h2>
          <div className="mt-5 space-y-3">
            {staff.map((member) => (
              <div key={member.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{member.name}</p>
                    <p className="text-sm text-slate-500">
                      {member.role} • {member.status}
                    </p>
                  </div>
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-900">
                    {member.attendance_status || 'No attendance'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-sky-950">Attendance log</h2>
          <div className="mt-5 space-y-3">
            {attendance.map((entry) => (
              <div key={entry.id} className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{entry.staff_name}</p>
                <p className="text-sm text-slate-500">
                  {entry.staff_role} • {entry.date} • {entry.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default StaffView;
