import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, UserCheck, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSupervisors, createSupervisor, updateSupervisor } from '../../api/users.api';
import { getAssignmentStats } from '../../api/assignments.api';
import { User, CreateSupervisorForm } from '../../types';
import PageHeader from '../../components/shared/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Table, { Column } from '../../components/ui/Table';
import EmptyState from '../../components/ui/EmptyState';

export default function Supervisors() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);

  const schema = useMemo(
    () =>
      z
        .object({
          name: z.string().min(2, 'Name must be at least 2 characters'),
          email: z.string().email('Enter a valid email'),
          password: z.string().optional(),
        })
        .superRefine((value, ctx) => {
          const password = value.password?.trim() ?? '';

          if (!editTarget && password.length < 8) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['password'],
              message: 'Password must be at least 8 characters',
            });
          }

          if (editTarget && password.length > 0 && password.length < 8) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['password'],
              message: 'Password must be at least 8 characters',
            });
          }
        }),
    [editTarget],
  );

  const { data: supervisors = [], isLoading } = useQuery({
    queryKey: ['supervisors'],
    queryFn: getSupervisors,
  });

  const { data: stats = [] } = useQuery({
    queryKey: ['assignment-stats'],
    queryFn: getAssignmentStats,
  });

  const statMap = Object.fromEntries(
    stats.map((s) => [s.supervisorId, s.count]),
  );

  const {
    register, handleSubmit, reset, formState: { errors, isSubmitting },
  } = useForm<CreateSupervisorForm>({ resolver: zodResolver(schema) });

  const createMutation = useMutation({
    mutationFn: createSupervisor,
    onSuccess: () => {
      toast.success('Supervisor account created');
      qc.invalidateQueries({ queryKey: ['supervisors'] });
      setModalOpen(false);
      reset();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, form }: { id: string; form: Partial<CreateSupervisorForm> }) =>
      updateSupervisor(id, form),
    onSuccess: () => {
      toast.success('Supervisor updated');
      qc.invalidateQueries({ queryKey: ['supervisors'] });
      setModalOpen(false);
      setEditTarget(null);
      reset();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const onSubmit = (data: CreateSupervisorForm) => {
    if (editTarget) {
      const form: Partial<CreateSupervisorForm> = {
        name: data.name,
        email: data.email,
      };

      if (data.password?.trim()) {
        form.password = data.password;
      }

      updateMutation.mutate({ id: editTarget.id, form });
      return;
    }

    createMutation.mutate(data);
  };

  const openCreate = () => {
    setEditTarget(null);
    reset({ name: '', email: '', password: '' });
    setModalOpen(true);
  };

  const columns: Column<User>[] = [
    { key: 'name',  header: 'Name',  render: (u) => (
      <div>
        <p className="font-medium text-slate-800">{u.name}</p>
        <p className="text-xs text-slate-400">{u.email}</p>
      </div>
    )},
    { key: 'assigned', header: 'Assigned', align: 'center',
      render: (u) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">
          {statMap[u.id] ?? 0}
        </span>
      )
    },
    { key: 'actions', header: '', width: '80px', align: 'right',
      render: (u) => (
        <button
          onClick={() => {
            setEditTarget(u);
            reset({ name: u.name, email: u.email, password: '' });
            setModalOpen(true);
          }}
          className="p-1.5 rounded text-slate-400 hover:text-primary-700 hover:bg-primary-50 transition-colors"
          title="Edit supervisor"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Supervisors"
        subtitle={`${supervisors.length} supervisor${supervisors.length !== 1 ? 's' : ''} registered`}
        action={
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openCreate}>
            Add Supervisor
          </Button>
        }
      />

      <Table
        columns={columns}
        data={supervisors}
        loading={isLoading}
        keyExtractor={(u) => u.id}
        emptyState={
          <EmptyState
            icon={<UserCheck className="w-6 h-6" />}
            title="No supervisors yet"
            description="Create supervisor accounts to begin assigning students."
            action={{ label: 'Add Supervisor', onClick: openCreate }}
          />
        }
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); reset(); }}
        title={editTarget ? 'Edit Supervisor' : 'Add Supervisor'}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => { setModalOpen(false); reset(); }}>
              Cancel
            </Button>
            <Button
              size="sm"
              loading={isSubmitting || createMutation.isPending || updateMutation.isPending}
              onClick={handleSubmit(onSubmit)}
            >
              {editTarget ? 'Save Changes' : 'Create Account'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label="Full Name"
            placeholder="Dr. Afolabi Gbadamosi"
            required
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="supervisor@alhikmah.edu.ng"
            required
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Min. 8 characters"
            required
            hint={editTarget ? 'Leave as-is or set a new password' : undefined}
            error={errors.password?.message}
            {...register('password')}
          />
        </form>
      </Modal>
    </div>
  );
}
