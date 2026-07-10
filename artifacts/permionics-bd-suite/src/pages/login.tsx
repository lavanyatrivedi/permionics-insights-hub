import { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Lock, ArrowRight } from "lucide-react";
import osmosLogo from "@assets/osmos_logo_blue_transparent.png";
import permionicsP from "@assets/permionics_P_exact_1783575144366.png";

const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLogin();
  const queryClient = useQueryClient();
  const { data: user, isLoading: meLoading } = useGetMe();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: "" },
  });

  useEffect(() => {
    if (user?.authenticated) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  if (meLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center" style={{ background: "hsl(222 47% 6%)" }}>
        <div
          className="h-10 w-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "hsl(217 91% 60% / 0.3)", borderTopColor: "hsl(217 91% 60%)" }}
        />
      </div>
    );
  }

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(
      { data: { password: values.password } },
      {
        onSuccess: async (res) => {
          if (res.authenticated) {
            await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
            setLocation("/dashboard");
          } else {
            toast({
              title: "Access Denied",
              description: "Invalid password. Please try again.",
              variant: "destructive",
            });
            form.setError("password", { message: "Incorrect password" });
          }
        },
        onError: () => {
          toast({
            title: "Access Denied",
            description: "Invalid password. Please try again.",
            variant: "destructive",
          });
          form.setError("password", { message: "Incorrect password" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row relative overflow-hidden bg-slate-950 p-4 lg:p-6 select-none justify-between">
      {/* ── Background: Deep navy gradient with moving mesh blobs ── */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />

      {/* Moving Blobs */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-35 z-0"
        style={{
          background: "radial-gradient(circle at 40% 50%, hsl(217 91% 60%), hsl(260 80% 50%) 60%, transparent 80%)",
          top: "-10%", left: "10%",
          filter: "blur(80px)",
          animation: "blob-random-move-1 25s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-30 z-0"
        style={{
          background: "radial-gradient(circle, hsl(199 89% 55%), hsl(217 91% 60%) 50%, transparent 80%)",
          bottom: "-10%", right: "15%",
          filter: "blur(70px)",
          animation: "blob-random-move-2 20s ease-in-out infinite reverse",
        }}
      />

      {/* ── Left Side: Bold Branding Panel ── */}
      <div className="relative z-10 flex flex-col justify-between w-full lg:w-[60%] p-6 lg:p-12 text-white min-h-[35vh] lg:min-h-0">
        {/* Top spacer */}
        <div className="h-6" />

        {/* Center: Bolder Heading */}
        <div className="my-auto space-y-6">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white drop-shadow-sm">
            Search Smarter.<br />Extract Faster.<br />Create Anywhere.
          </h1>
          <p className="text-sm lg:text-base text-white/50 max-w-md leading-relaxed">
            BD Intelligence Platform for Permionics Membranes - powering smarter business development with AI.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-2 pt-4">
            {["Case Study Library", "AI BD Assistant", "Smart Generator", "Questionnaire Engine"].map(f => (
              <span
                key={f}
                className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 backdrop-blur-sm shadow-sm hover:bg-white/10 hover:text-white transition-all duration-200 cursor-default"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom footer text for desktop */}
        <p className="hidden lg:block text-xs text-white/30">
          © 2026 Permionics Membranes Pvt. Ltd. All rights reserved.
        </p>
      </div>

      {/* ── Right Side: Embedded Full-Height Login Card ── */}
      <div 
        className="relative z-10 flex flex-col justify-between w-full lg:w-[38%] bg-white p-8 lg:p-10 rounded-[28px] shadow-[-16px_0_48px_rgba(0,0,0,0.3)] border border-slate-100/10 min-h-[50vh] lg:min-h-0"
      >
        {/* Top: Dope Co-branded Header Layout */}
        <div className="flex items-center gap-3.5 justify-center lg:justify-start select-none">
          {/* Left: Permionics P Logo */}
          <img src={permionicsP} alt="Permionics" className="h-7 w-7 object-contain opacity-90" />
          
          {/* Subtle Vertical Divider */}
          <div className="h-5 w-px bg-slate-200" />
          
          {/* Right: OSMOS Brand */}
          <div className="flex items-center gap-2">
            <img src={osmosLogo} alt="OSMOS" className="h-8 w-8 object-contain" />
            <span className="text-base font-extrabold tracking-wider uppercase text-slate-800">OSMOS</span>
          </div>
        </div>

        {/* Center: Login Form */}
        <div className="my-auto w-full max-w-[320px] mx-auto py-8 lg:py-0">
          {/* Card Heading */}
          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Welcome Back</h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">Log in to start using OSMOS BD Intelligence</p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Lock
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                        />
                        <Input
                          type="password"
                          placeholder="Enter password"
                          className="pl-10 h-12 rounded-xl border border-slate-200 text-sm font-semibold"
                          style={{
                            background: "hsl(220 15% 97%)",
                            color: "hsl(222 47% 11%)",
                          }}
                          autoComplete="current-password"
                          autoFocus
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs mt-1" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:gap-2.5"
                style={{
                  background: "linear-gradient(135deg, hsl(222 71% 18%), hsl(217 91% 28%))",
                  color: "white",
                  boxShadow: "0 4px 14px hsl(222 71% 17% / 0.25)",
                }}
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Authenticating…
                  </span>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>

        {/* Bottom: Footer Info */}
        <p className="text-[10px] text-center text-slate-400 mt-4">
          Authorized personnel only · Permionics Membranes Pvt. Ltd.
        </p>
      </div>
    </div>
  );
}
