import { AlertCircle, Bell, Calendar, Check, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useFormValidation } from '../../hooks/useFormValidation';
import { validateMedicine } from '../../utils/validations/medicineValidation';

export default function MedicineReminder() {
  const [reminders, setReminders] = useState([
    { id: 1, name: 'Paracetamol 500mg', time: '08:00 AM', taken: false, frequency: 'Daily' },
    { id: 2, name: 'Atorvastatin 10mg', time: '09:00 PM', taken: true, frequency: 'Daily' },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);

  const { values: formData, errors, handleChange, validateAll, validate, reset } = useFormValidation(
    { medicineName: '', reminderTime: '08:00' },
    validateMedicine
  );

  const toggleTaken = (id) => {
    setReminders(reminders.map((r) => (r.id === id ? { ...r, taken: !r.taken } : r)));
  };

  const removeReminder = (id) => {
    setReminders(reminders.filter((r) => r.id !== id));
  };

  const handleAdd = (e) => {
    e.preventDefault();

    if (!validateAll()) {
      return;
    }

    const name = formData.medicineName.trim();
    const time = formData.reminderTime;

    if (!name) return;

    const [hours, minutes] = time.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h || 12;
    const formattedTime = `${h.toString().padStart(2, '0')}:${minutes} ${ampm}`;

    setReminders([
      ...reminders,
      {
        id: Date.now(),
        name,
        time: formattedTime,
        taken: false,
        frequency: 'Daily',
      },
    ]);

    reset({ medicineName: '', reminderTime: '08:00' });
    setShowAddForm(false);
  };

  const missedCount = reminders.filter((r) => !r.taken).length;

  return (
    <div className="glass-panel border border-border-subtle rounded-3xl p-6 shadow-sm mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-text-main text-base">Medicine Reminders</h3>
            <p className="text-xs text-text-muted">Schedule daily dose alerts and log compliance.</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-brand-primary text-white font-bold p-2.5 rounded-xl hover:bg-brand-primary/95 transition shadow-md shadow-brand-primary/10 flex items-center gap-1.5 text-xs"
        >
          <Plus className="w-4 h-4" /> Add Alert
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-bg-surface-hover/30 border border-border-subtle/50 rounded-2xl p-4 mb-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Medicine Name</span>
              <input
                type="text"
                placeholder="e.g. Metformin 500mg"
                value={formData.medicineName}
                onChange={handleChange}
                name="medicineName"
                onBlur={(e) => validate('medicineName', e.target.value)}
                aria-invalid={errors.medicineName ? 'true' : 'false'}
                aria-describedby={errors.medicineName ? 'medicineName-error' : null}
                className={`w-full px-3 py-2 rounded-lg border bg-bg-surface text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-brand-primary ${
                  errors.medicineName
                    ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                    : 'border-border-subtle focus:ring-indigo-500/20 focus:border-indigo-500'
                }`}
                required
              />
              {errors.medicineName && (
                <p id="medicineName-error" className="text-[11px] text-rose-500 font-medium">{errors.medicineName}</p>
              )}
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Reminder Time</span>
              <input
                type="time"
                value={formData.reminderTime}
                name="reminderTime"
                onChange={handleChange}
                onBlur={(e) => validate('reminderTime', e.target.value)}
                aria-invalid={errors.reminderTime ? 'true' : 'false'}
                aria-describedby={errors.reminderTime ? 'reminderTime-error' : null}
                className={`w-full px-3 py-2 rounded-lg border bg-bg-surface text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-brand-primary ${
                  errors.reminderTime
                    ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                    : 'border-border-subtle focus:ring-indigo-500/20 focus:border-indigo-500'
                }`}
                required
              />
              {errors.reminderTime && (
                <p id="reminderTime-error" className="text-[11px] text-rose-500 font-medium">{errors.reminderTime}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                reset({ medicineName: '', reminderTime: '08:00' });
                setShowAddForm(false);
              }}
              className="text-xs text-text-muted font-bold px-3 py-2 hover:bg-bg-surface-hover rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-xs bg-brand-primary text-white font-bold px-4 py-2 rounded-lg hover:bg-brand-primary/90 transition shadow-sm"
            >
              Save Reminder
            </button>
          </div>
        </form>
      )}

      {/* Compliance banner */}
      <div className="bg-bg-surface-hover/50 rounded-2xl p-3 border border-border-subtle/50 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-secondary" />
          <span className="text-xs font-semibold text-text-main">Daily Compliance</span>
        </div>
        {missedCount === 0 ? (
          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            All Doses Logged
          </span>
        ) : (
          <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> {missedCount} Pending
          </span>
        )}
      </div>

      <div className="space-y-2">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 ${
              reminder.taken
                ? 'bg-emerald-500/5 border-emerald-500/10'
                : 'bg-bg-surface border-border-subtle'
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleTaken(reminder.id)}
                className={`w-7 h-7 rounded-xl flex items-center justify-center border transition ${
                  reminder.taken
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-border-subtle hover:border-brand-primary text-transparent'
                }`}
              >
                <Check className="w-4.5 h-4.5" />
              </button>
              <div>
                <span
                  className={`text-xs font-bold block transition ${
                    reminder.taken ? 'line-through text-text-muted' : 'text-text-main'
                  }`}
                >
                  {reminder.name}
                </span>
                <span className="text-[9px] text-text-muted mt-0.5 block">
                  ⏰ {reminder.time} • {reminder.frequency}
                </span>
              </div>
            </div>
            <button
              onClick={() => removeReminder(reminder.id)}
              className="p-1.5 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg text-text-muted transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {reminders.length === 0 && (
          <div className="text-center py-6 text-xs text-text-muted">
            No reminders scheduled. Use the form to start tracking.
          </div>
        )}
      </div>
    </div>
  );
}
