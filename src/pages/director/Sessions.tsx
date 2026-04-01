import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, PlusCircle, Calendar, ArchiveX } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getSessions, createSession } from '../../api/sessions.api';
import { SessionForm, Session } from '../../types';
import PageHeader from '../../components/shared/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';

const schema = z.object({
  year: z.number({ invalid_type_error: 'Year must be a number' })
    .int().min(2000).max(2100),
});

export default function Sessions() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmYear, setConfirmYear] = useState<number | null>(null);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: getSessions,
  });

  const active = sessions.find((s) => s.isActive);
  const past = sessions.filter((s) => !s.isActive);

  const {
    register, handleSubmit, watch, reset, formState: { errors },
  } = useForm<{ year: number }>({
    resolver: zodResolver(schema),
  });

  const yearValue = watch('year');

  const createMutation = useMutation({
    mutationFn: (year: number) => createSession(year),
    onSuccess: (session) => {
      toast.success(`SIWES ${session.year} created and set as active`);
      qc.invalidateQueries({ queryKey: ['sessions'] });
      setModalOpen(false);
      setConfirmYear(null);
      reset();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const onSubmit = ({ year }: { year: number }) => {
    if (!confirmYear) {
      setConfirmYear(year);
    } else {
      createMutation.mutate(year);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Sessions"
        subtitle="Manage SIWES academic sessions"
        action={
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => { setModalOpen(true); setConfirmYear(null); reset(); }}
          >
            New Session
          </Button>
        }
      />

      {/* Active session */}
      {isLoading ? (
        <div className="h-28 skeleton rounded-lg" />
      ) : active ? (
        <div className="relative overflow-hidden rounded-xl border-2 border-primary-600 bg-gradient-to-br from-primary-700 to-primary-900 p-6 text-white shadow-lg">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-primary-200 text-xs font-semibold uppercase tracking-widest mb-1">Currently Active</p>
              <h2 className="text-3xl font-heading font-bold">SIWES {active.year}</h2>
              <p className="text-primary-200 text-sm mt-1">
                Created {format(new Date(active.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-gold-400 text-primary-900 text-xs font-bold">
              ACTIVE
            </span>
          </div>
          <div className="flex gap-6 mt-5 pt-4 border-t border-primary-600/50">
            <div>
              <p className="text-primary-300 text-xs">Students</p>
              <p className="text-xl font-heading font-bold">{active.studentCount ?? 0}</p>
            </div>
            <div>
              <p className="text-primary-300 text-xs">Scored</p>
              <p className="text-xl font-heading font-bold">{active.scoredCount ?? 0}</p>
            </div>
          </div>
        </div>
      ) : (
        <Card>
          <p className="text-slate-500 text-sm text-center py-4">No active session. Create one to get started.</p>
        </Card>
      )}

      {/* Past sessions */}
      {past.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
            <ArchiveX className="w-4 h-4" /> Past Sessions
          </h3>
          <div className="space-y-2">
            {past.map((s) => (
              <div key={s.id} className="bg-white rounded-lg border border-border px-5 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-semibold text-slate-700">SIWES {s.year}</p>
                    <p className="text-xs text-slate-400">{format(new Date(s.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-slate-600">
                  <span><span className="font-semibold">{s.studentCount ?? 0}</span> students</span>
                  <Badge variant="neutral">Archived</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create session modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setConfirmYear(null); reset(); }}
        title="Create New Session"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => { setModalOpen(false); setConfirmYear(null); reset(); }}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant={confirmYear ? 'danger' : 'primary'}
              loading={createMutation.isPending}
              onClick={handleSubmit(onSubmit)}
            >
              {confirmYear ? `Confirm — Archive SIWES ${active?.year}` : 'Continue'}
            </Button>
          </>
        }
      >
        {confirmYear ? (
          <div className="space-y-3">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm font-semibold text-amber-800 mb-1">⚠️ Are you sure?</p>
              <p className="text-sm text-amber-700">
                Creating SIWES <strong>{confirmYear}</strong> will archive the current active session
                (SIWES {active?.year}). This action cannot be undone.
              </p>
            </div>
          </div>
        ) : (
          <form>
            <Input
              label="Session Year"
              type="number"
              placeholder={String(new Date().getFullYear() + 1)}
              required
              error={errors.year?.message}
              hint="Enter a 4-digit year (e.g. 2026)"
              {...register('year', { valueAsNumber: true })}
            />
          </form>
        )}
      </Modal>
    </div>
  );
}
