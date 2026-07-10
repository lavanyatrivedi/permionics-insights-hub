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
      setLocation("/");
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
            setLocation("/");
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row relative overflow-hidden bg-slate-950 p-4 lg:p-6 select-none justify-center items-center gap-6 lg:gap-8">
      {/* ── Background: Deep navy gradient ── */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />

      {/* ── Left Side: Embedded Login Card (Off-white, squarish/rounded-xl, reduced height) ── */}
      <div 
        className="relative z-10 flex flex-col justify-between w-full lg:w-[40%] bg-[#fafafb] p-6 lg:p-10 rounded-xl shadow-[0_24px_48px_rgba(0,0,0,0.4)] border border-slate-100/10 min-h-[480px] lg:h-[calc(100vh-80px)] max-h-[660px]"
      >
        {/* High-fidelity Vertical Circuit Trace Background Watermark */}
        <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden rounded-xl opacity-[0.26]">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 400 700"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* THICK TRACES (OUTER EDGES FOR CONTRAST) */}
            <path d="M40 0 V150 L15 175 V320 L40 345 V550 L15 575 V700" stroke="url(#circuit-stroke-dark)" strokeWidth="3" strokeLinecap="round" />
            <path d="M360 0 V180 L385 205 V300 L360 325 V500 L385 525 V700" stroke="url(#circuit-stroke-dark)" strokeWidth="3" strokeLinecap="round" />

            {/* MEDIUM VERTICAL TRACES (INTERMEDIATE FLOW) */}
            <path d="M80 0 V120 L110 150 V280 L90 300 V520 L110 540 V700" stroke="url(#circuit-stroke-main)" strokeWidth="1.5" />
            <path d="M110 0 V80 L140 110 V230 L120 250 V480 L140 500 V700" stroke="url(#circuit-stroke-main)" strokeWidth="1.5" />
            <path d="M140 0 V200 L170 230 V350 L150 370 V550 L170 570 V700" stroke="url(#circuit-stroke-main)" strokeWidth="1.5" />
            
            <path d="M320 0 V120 L290 150 V280 L310 300 V520 L290 540 V700" stroke="url(#circuit-stroke-main)" strokeWidth="1.5" />
            <path d="M290 0 V80 L260 110 V230 L280 250 V480 L260 500 V700" stroke="url(#circuit-stroke-main)" strokeWidth="1.5" />
            <path d="M260 0 V200 L230 230 V350 L250 370 V550 L230 570 V700" stroke="url(#circuit-stroke-main)" strokeWidth="1.5" />

            {/* SUBTLE FINE TRACES (GRID DENSITY) */}
            <path d="M170 0 V220 L195 245 V380 L170 405 V700" stroke="url(#circuit-stroke-light)" strokeWidth="0.8" />
            <path d="M200 0 V180 L225 205 V420 L200 445 V700" stroke="url(#circuit-stroke-light)" strokeWidth="0.8" />
            <path d="M230 0 V250 L205 275 V350 L230 375 V700" stroke="url(#circuit-stroke-light)" strokeWidth="0.8" />

            {/* HORIZONTAL CROSSOVER BRIDGES */}
            <path d="M80 120 L60 120 M110 80 L90 80 M140 200 L120 200" stroke="url(#circuit-stroke-main)" strokeWidth="1.2" />
            <path d="M320 120 L340 120 M290 80 L310 80 M260 200 L280 200" stroke="url(#circuit-stroke-main)" strokeWidth="1.2" />
            <path d="M170 220 L150 220 M200 180 L220 180" stroke="url(#circuit-stroke-light)" strokeWidth="0.8" />

            {/* HOLLOW TERMINAL PADS (CIRCLE INTERSECTIONS) */}
            <circle cx="15" cy="175" r="4.5" stroke="url(#circuit-stroke-dark)" strokeWidth="2.5" fill="white" />
            <circle cx="385" cy="205" r="4.5" stroke="url(#circuit-stroke-dark)" strokeWidth="2.5" fill="white" />
            <circle cx="80" cy="120" r="4" stroke="url(#circuit-stroke-main)" strokeWidth="1.8" fill="white" />
            <circle cx="320" cy="120" r="4" stroke="url(#circuit-stroke-main)" strokeWidth="1.8" fill="white" />
            <circle cx="140" cy="200" r="4" stroke="url(#circuit-stroke-main)" strokeWidth="1.8" fill="white" />
            <circle cx="260" cy="200" r="4" stroke="url(#circuit-stroke-main)" strokeWidth="1.8" fill="white" />
            <circle cx="170" cy="220" r="3.5" stroke="url(#circuit-stroke-light)" strokeWidth="1.2" fill="white" />
            <circle cx="230" cy="250" r="3.5" stroke="url(#circuit-stroke-light)" strokeWidth="1.2" fill="white" />

            {/* SOLID TERMINAL PADS (NODE CONNECTIONS) */}
            <circle cx="40" cy="150" r="3.5" fill="#003466" />
            <circle cx="360" cy="180" r="3.5" fill="#003466" />
            <circle cx="110" cy="150" r="3" fill="#1e3a8a" />
            <circle cx="290" cy="150" r="3" fill="#1e3a8a" />
            <circle cx="120" cy="250" r="3" fill="#3b82f6" />
            <circle cx="280" cy="250" r="3" fill="#3b82f6" />
            <circle cx="195" cy="245" r="2.5" fill="#60a5fa" />
            <circle cx="225" cy="205" r="2.5" fill="#60a5fa" />
            <circle cx="205" cy="275" r="2.5" fill="#60a5fa" />

            {/* MID-LINE NODE PINHEADS */}
            <circle cx="110" cy="280" r="2.5" fill="#1e3a8a" />
            <circle cx="140" cy="110" r="2.5" fill="#1e3a8a" />
            <circle cx="170" cy="230" r="2" fill="#3b82f6" />
            <circle cx="200" cy="420" r="2" fill="#3b82f6" />
            <circle cx="260" cy="110" r="2.5" fill="#1e3a8a" />
            <circle cx="290" cy="280" r="2.5" fill="#1e3a8a" />

            {/* Gradients */}
            <defs>
              <linearGradient id="circuit-stroke-dark" x1="0" y1="0" x2="400" y2="700" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#002244" />
                <stop offset="50%" stopColor="#003466" />
                <stop offset="100%" stopColor="#1e3a8a" />
              </linearGradient>
              <linearGradient id="circuit-stroke-main" x1="0" y1="0" x2="400" y2="700" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#003466" />
                <stop offset="50%" stopColor="#1e3a8a" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient id="circuit-stroke-light" x1="0" y1="0" x2="400" y2="700" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1e3a8a" opacity="0.6" />
                <stop offset="100%" stopColor="#60a5fa" opacity="0.6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Top: Dope Co-branded Header Layout (Bolder Sizing) */}
        <div className="relative z-10 flex items-center gap-3.5 justify-center lg:justify-start select-none">
          {/* Left: Permionics P Logo in Navy Square Box */}
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-transform duration-200 hover:scale-105"
            style={{ background: "linear-gradient(135deg, hsl(222 71% 20%), hsl(222 71% 12%))" }}
          >
            <img src={permionicsP} alt="Permionics" className="h-6 w-6 object-contain" />
          </div>
          
          {/* Subtle Vertical Divider */}
          <div className="h-5 w-px bg-slate-200" />
          
          {/* Right: OSMOS Brand */}
          <div className="flex items-center gap-2.5">
            <img src={osmosLogo} alt="OSMOS" className="h-10 w-10 object-contain drop-shadow-sm" />
            <span className="text-lg font-black tracking-widest uppercase text-slate-800">OSMOS</span>
          </div>
        </div>

        {/* Center: Login Form */}
        <div className="relative z-10 my-auto w-full max-w-[320px] mx-auto py-6 lg:py-0">
          {/* Card Heading */}
          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Welcome Back</h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">Log in to start using the Osmos Portal</p>
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

      {/* ── Right Side: Layered Navy Branding Card (Squarish/rounded-xl, reduced height) ── */}
      <div 
        className="relative z-10 flex flex-col justify-between w-full lg:w-[56%] p-8 lg:p-12 text-white rounded-xl shadow-[0_24px_48px_rgba(0,0,0,0.5)] border border-indigo-500/10 min-h-[38vh] lg:h-[calc(100vh-80px)] max-h-[660px] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/80"
      >
        {/* Subtle Tech-Grid Background Layer (Brightened for high visibility on dark background) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:16px_28px] pointer-events-none z-0" />
        
        {/* Glow blob */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-blue-500/10 blur-[80px] pointer-events-none z-0" />

        {/* Top: Small badge label */}
        <div className="z-10 flex items-center gap-2 w-max px-3 py-1 rounded-full bg-white/5 border border-white/10 select-none text-[10px] font-bold uppercase tracking-wider text-indigo-300">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          OSMOS INTELLIGENCE
        </div>

        {/* Center: Bolder Heading */}
        <div className="my-auto space-y-6 z-10">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white drop-shadow-sm">
            Search Smarter.<br />Extract Faster.<br />Create Anywhere.
          </h1>
          <p className="text-sm lg:text-base text-white/50 max-w-md leading-relaxed">
            Advanced Knowledge Platform for Permionics Membranes - powering smarter business development with AI.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-2 pt-4">
            {["Case Study Library", "Osmos AI", "Smart Generator", "Questionnaire Engine"].map(f => (
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
        <p className="hidden lg:block text-xs text-white/30 z-10">
          © 2026 Permionics Membranes Pvt. Ltd. All rights reserved.
        </p>
      </div>
    </div>
  );
}
