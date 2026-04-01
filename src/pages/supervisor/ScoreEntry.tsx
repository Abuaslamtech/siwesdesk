import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Send, CheckCircle2, Building2, MapPin, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { getStudent } from '../../api/students.api';
import { getScore, submitScore, saveDraft } from '../../api/scores.api';
import { useAuthStore } from '../../store/auth.store';
import { ScoreForm } from '../../types';
import { computeTotal, computeFinal } from '../../utils/formatScore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

const schema = z.object({
  supervisorScore: z
    .number({ invalid_type_error: 'Enter a number' })
    .min(0, 'Min 0')
    .max(40, 'Max 40'),
  industryScore: z
    .number({ invalid_type_error: 'Enter a number' })
    .min(0, 'Min 0')
    .max(50, 'Max 50'),
});

type FormValues = { supervisorScore: number; industryScore: number };

export default function ScoreEntry() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuthStore();

  const { data: student, isLoading: loadingStudent } = useQuery({
    queryKey: ['student', id],
    queryFn: () => getStudent(id!),
    enabled: !!id,
  });

  const { data: existingScore, isLoading: loadingScore } = useQuery({
    queryKey: ['score', id],
    queryFn: () => getScore(id!),
    enabled: !!id,
  });

  const {
    register,
    watch,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { supervisorScore: 0, industryScore: 0 },
  });

  // Populate from existing score
  useEffect(() => {
    if (existingScore) {
      reset({
        supervisorScore: existingScore.supervisorScore ?? 0,
        industryScore:   existingScore.industryScore ?? 0,
      });
    }
  }, [existingScore, reset]);

  const watchedSup = watch('supervisorScore');
  const watchedInd = watch('industryScore');
  const orientation = existingScore?.orientation ?? 0;
  const liveTotal = computeTotal({ orientation, supervisorScore: +watchedSup || 0, industryScore: +watchedInd || 0 });
  const liveFinal = computeFinal({ orientation, supervisorScore: +watchedSup || 0, industryScore: +watchedInd || 0 });

  const submitMutation = useMutation({
    mutationFn: (data: FormValues) =>
      submitScore(id!, data.supervisorScore, data.industryScore, orientation, user!.id),
    onSuccess: () => {
      toast.success('Score submitted successfully');
      qc.invalidateQueries({ queryKey: ['score', id] });
      qc.invalidateQueries({ queryKey: ['supervisor-students', user?.id] });
    },
    onError: () => toast.error('Failed to submit score'),
  });

  const draftMutation = useMutation({
    mutationFn: (data: FormValues) =>
      saveDraft(id!, data.supervisorScore || null, data.industryScore || null, user!.id),
    onSuccess: () => {
      toast.success('Draft saved');
      qc.invalidateQueries({ queryKey: ['score', id] });
    },
    onError: () => toast.error('Failed to save draft'),
  });

  const isLoading = loadingStudent || loadingScore;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-4">Student not found.</p>
        <Link to="/supervisor/students" className="text-primary-700 hover:underline text-sm">
          ← Back to students
        </Link>
      </div>
    );
  }

  const isSubmitted = existingScore && !existingScore.isDraft && existingScore.supervisorScore !== null && existingScore.industryScore !== null;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      {/* Back + heading */}
      <div>
        <Link
          to="/supervisor/students"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to students
        </Link>
        <h2 className="text-xl font-heading font-bold text-slate-900">{student.name}</h2>
        <p className="text-sm text-slate-500 font-mono mt-0.5">{student.matricNo}</p>
      </div>

      {/* Student info card */}
      <Card padding="none">
        <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
          {[
            { icon: <User className="w-4 h-4" />, label: 'Department / Program', value: `${student.department || student.course} (Lvl ${student.level})` },
            { icon: <MapPin className="w-4 h-4" />, label: 'State / LGA', value: `${student.state} — ${student.lga}` },
            { icon: <Building2 className="w-4 h-4" />, label: 'Industry Placement', value: student.industry || 'Not specified' },
            { icon: <MapPin className="w-4 h-4" />, label: 'Location', value: student.location || '—' },
          ].map(({ icon, label, value }) => (
            <div key={label} className="px-5 py-4 flex items-start gap-3">
              <div className="mt-0.5 text-primary-500 shrink-0">{icon}</div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm font-medium text-slate-800">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Score breakdown live */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Orientation', value: orientation, max: 10, color: 'text-slate-600' },
          { label: 'Supervisor Score', value: +watchedSup || 0, max: 40, color: 'text-primary-700' },
          { label: 'Industry Score', value: +watchedInd || 0, max: 50, color: 'text-gold-700' },
          { label: 'SIWES Final', value: liveFinal, max: 50, color: 'text-green-700 font-bold' },
        ].map(({ label, value, max, color }) => (
          <div key={label} className="bg-white rounded-lg border border-border p-4 text-center">
            <p className={`text-2xl font-heading font-bold ${color}`}>{value}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">/{max}</p>
            <p className="text-[10px] text-slate-500 mt-1 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {isSubmitted ? (
        <Card className="border-green-200 bg-green-50">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-800 text-sm">Score submitted</p>
              <p className="text-xs text-green-600">
                Total: {existingScore.total}/100 · SIWES: {existingScore.siewesFinal}/50
              </p>
            </div>
          </div>
        </Card>
      ) : existingScore?.isDraft ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <p className="text-xs font-medium text-amber-700">Draft saved — review and submit to finalise.</p>
        </div>
      ) : null}

      {/* Score form */}
      <Card>
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Enter Scores</h3>
        <form onSubmit={handleSubmit((d) => submitMutation.mutate(d))} className="space-y-5" noValidate>
          <div className="p-4 bg-slate-50 rounded-lg border border-border">
            <p className="text-sm font-medium text-slate-700">Orientation Mark</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-2xl font-heading font-bold text-slate-800">{orientation}</span>
              <span className="text-sm text-slate-500">/ 10</span>
              <Badge variant={orientation === 10 ? 'success' : 'error'} size="md">
                {orientation === 10 ? 'Attended' : 'Absent'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">Set by the Corper/Secretary</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Supervisor Score"
              type="number"
              min={0}
              max={40}
              placeholder="0 – 40"
              required
              hint="Max 40 marks"
              error={errors.supervisorScore?.message}
              rightAddon={<span className="text-xs text-slate-400">/40</span>}
              {...register('supervisorScore', { valueAsNumber: true })}
            />
            <Input
              label="Industry Score"
              type="number"
              min={0}
              max={50}
              placeholder="0 – 50"
              required
              hint="Max 50 marks"
              error={errors.industryScore?.message}
              rightAddon={<span className="text-xs text-slate-400">/50</span>}
              {...register('industryScore', { valueAsNumber: true })}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              leftIcon={<Save className="w-4 h-4" />}
              loading={draftMutation.isPending}
              onClick={handleSubmit((d) => draftMutation.mutate(d))}
              className="flex-1 sm:flex-none"
            >
              Save Draft
            </Button>
            <Button
              type="submit"
              leftIcon={<Send className="w-4 h-4" />}
              loading={submitMutation.isPending}
              className="flex-1"
            >
              {isSubmitted ? 'Update Score' : 'Submit Score'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
