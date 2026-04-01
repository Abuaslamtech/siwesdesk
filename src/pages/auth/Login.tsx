import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, BookOpen, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { login } from "../../api/auth.api";
import { useAuthStore } from "../../store/auth.store";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { LoginForm } from "../../types";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const navigate = useNavigate();
  const { login: storeLogin } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: LoginForm) => {
    try {
      const { user, token } = await login(data);
      storeLogin(user, token);
      navigate("/dashboard", { replace: true });
    } catch {
      toast.error("Invalid email or password");
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-primary-950 via-primary-800 to-primary-700 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-xl shadow-modal p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-700 mb-4 shadow-lg">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-slate-900">
              SiwesDesk
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Al-Hikmah University SIWES Portal
            </p>
          </div>
          {/* Registration Information */}
          <div className="mb-6 p-3 bg-gold-50 border border-gold-200 rounded-lg flex items-start gap-2">
            <Shield className="w-4 h-4 text-gold-600 mt-0.5 shrink-0" />
            <div className="text-xs text-gold-800">
              <p className="font-semibold mb-1">Account Registration</p>
              <p>
                New to the portal? Contact your departmental SIWES coordinator
                to get your login credentials.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <Input
              id="email"
              label="Email address"
              type="email"
              placeholder="you@alhikmah.edu.ng"
              required
              error={errors.email?.message}
              {...register("email")}
            />
            <div className="flex flex-col gap-1.5">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor="password"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full h-10 rounded-md border border-border bg-white px-3 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700 hover:border-slate-400 transition-all"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword((p) => !p)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isSubmitting}
              className="mt-2"
            >
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-primary-300 mt-12">
          © {new Date().getFullYear()} Al-Hikmah University, Ilorin. All rights
          reserved.
        </p>
      </div>
    </div>
  );
}
