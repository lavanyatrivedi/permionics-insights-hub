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
      {/* ── Background: Deep navy gradient with moving mesh blobs ── */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />

      {/* Moving Blobs (Slightly Brighter/Higher Opacity for better contrast) */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-45 z-0"
        style={{
          background: "radial-gradient(circle at 40% 50%, hsl(217 91% 60%), hsl(260 80% 50%) 60%, transparent 80%)",
          top: "-10%", left: "10%",
          filter: "blur(80px)",
          animation: "blob-random-move-1 25s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-40 z-0"
        style={{
          background: "radial-gradient(circle, hsl(199 89% 55%), hsl(217 91% 60%) 50%, transparent 80%)",
          bottom: "-10%", right: "15%",
          filter: "blur(70px)",
          animation: "blob-random-move-2 20s ease-in-out infinite reverse",
        }}
      />

      {/* ── Left Side: Embedded Login Card ── */}
      <div 
        className="relative z-10 flex flex-col justify-between w-full lg:w-[40%] bg-white p-8 lg:p-12 rounded-[28px] shadow-[0_24px_48px_rgba(0,0,0,0.4)] border border-slate-100/10 min-h-[520px] lg:h-[calc(100vh-48px)] max-h-[720px]"
      >
        {/* Abstract Neural/Brain Circuit Background Watermark */}
        <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden rounded-[28px] opacity-[0.18]">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 400 700"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* ── CENTRAL PROCESSOR (CHIP CORE) ── */}
            <rect x="175" y="245" width="50" height="50" rx="8" fill="#003466" opacity="0.2" />
            <rect x="180" y="250" width="40" height="40" rx="6" fill="#1e3a8a" opacity="0.15" />
            <rect x="185" y="255" width="30" height="30" rx="4" stroke="url(#brain-stroke)" strokeWidth="1.5" />
            <circle cx="200" cy="270" r="5" fill="#3b82f6" />
            
            {/* Processor Pins extending into circuit traces */}
            <path d="M165 260 H180 M165 270 H180 M165 280 H180 M220 260 H235 M220 270 H235 M220 280 H235 M190 235 V250 M200 235 V250 M210 235 V250 M190 290 V305 M200 290 V305 M210 290 V305" stroke="url(#brain-stroke)" strokeWidth="1" />

            {/* ── LEFT LOBE (CIRCUIT-BOARD RIDGES) ── */}
            {/* Ridge 1: Upper Lobe Curve */}
            <path d="M170 140 H140 L110 170 V200 L90 220 H70" stroke="url(#brain-stroke)" strokeWidth="1.8" strokeLinecap="round" />
            {/* Ridge 2: Mid Lobe Loop */}
            <path d="M170 180 H150 L120 210 V250 L100 270 H50" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />
            {/* Ridge 3: Central Lobe */}
            <path d="M170 220 H130 L110 240 V300 L90 320 H40" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />
            {/* Ridge 4: Lower Lobe */}
            <path d="M170 330 H140 L110 360 V390 L80 420 H60" stroke="url(#brain-stroke)" strokeWidth="1.8" strokeLinecap="round" />
            {/* Ridge 5: Bottom curves */}
            <path d="M180 370 H150 L130 390 V410 L110 430 H90" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />

            {/* ── RIGHT LOBE (TECH INTEGRATION TRACKS) ── */}
            {/* Ridge 1 */}
            <path d="M230 140 H260 L290 170 V200 L310 220 H330" stroke="url(#brain-stroke)" strokeWidth="1.8" strokeLinecap="round" />
            {/* Ridge 2 */}
            <path d="M230 180 H250 L280 210 V250 L300 270 H350" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />
            {/* Ridge 3 */}
            <path d="M230 220 H270 L290 240 V300 L310 320 H360" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />
            {/* Ridge 4 */}
            <path d="M230 330 H260 L290 360 V390 L320 420 H340" stroke="url(#brain-stroke)" strokeWidth="1.8" strokeLinecap="round" />
            {/* Ridge 5 */}
            <path d="M220 370 H250 L270 390 V410 L290 430 H310" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />

            {/* ── TENTACLES (EXTENSIVE BACKGROUND EXPANSION) ── */}
            {/* Top Left Wing */}
            <path d="M140 140 V100 H110 L80 70 H30 L10 50 V10" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="10" cy="10" r="3" fill="#1e3a8a" />
            <circle cx="80" cy="70" r="2.5" fill="#3b82f6" />

            {/* Top Right Wing */}
            <path d="M260 140 V100 H290 L320 70 H370 L390 50 V10" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="390" cy="10" r="3" fill="#1e3a8a" />
            <circle cx="320" cy="70" r="2.5" fill="#3b82f6" />

            {/* Left Hand Outlets */}
            <path d="M70 220 L40 190 H10" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M50 270 L20 270 V320 H5" stroke="url(#brain-stroke)" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M40 320 L10 320 V380 H5" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="10" cy="190" r="3.5" fill="#3b82f6" />
            <circle cx="5" cy="320" r="3" fill="#003466" />
            <circle cx="5" cy="380" r="3.5" fill="#1e3a8a" />

            {/* Right Hand Outlets */}
            <path d="M330 220 L360 190 H390" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M350 270 L380 270 V320 H395" stroke="url(#brain-stroke)" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M360 320 L390 320 V380 H395" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="390" cy="190" r="3.5" fill="#3b82f6" />
            <circle cx="395" cy="320" r="3" fill="#003466" />
            <circle cx="395" cy="380" r="3.5" fill="#1e3a8a" />

            {/* Bottom Left Tentacles */}
            <path d="M90 430 L60 460 V530 L30 560 H10" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M110 430 L80 490 H40 L20 520 V680" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="10" cy="560" r="3" fill="#10b981" />
            <circle cx="20" cy="680" r="3" fill="#1e3a8a" />

            {/* Bottom Right Tentacles */}
            <path d="M310 430 L340 460 V530 L370 560 H390" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M290 430 L320 490 H360 L380 520 V680" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="390" cy="560" r="3" fill="#10b981" />
            <circle cx="380" cy="680" r="3" fill="#1e3a8a" />

            {/* Bottom Center Nodes */}
            <path d="M200 295 V380 L160 420 V500 L120 540 H80" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M200 380 L240 420 V500 L280 540 H320" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="80" cy="540" r="3" fill="#3b82f6" />
            <circle cx="320" cy="540" r="3" fill="#3b82f6" />

            {/* Extra cross-connect lines & nodes */}
            <line x1="140" y1="200" x2="140" y2="360" stroke="url(#brain-stroke)" strokeWidth="0.8" strokeDasharray="1 3" />
            <line x1="260" y1="200" x2="260" y2="360" stroke="url(#brain-stroke)" strokeWidth="0.8" strokeDasharray="1 3" />
            
            <circle cx="140" cy="200" r="2" fill="#3b82f6" />
            <circle cx="140" cy="360" r="2" fill="#3b82f6" />
            <circle cx="260" cy="200" r="2" fill="#3b82f6" />
            <circle cx="260" cy="360" r="2" fill="#3b82f6" />

            {/* Gradients */}
            <defs>
              <linearGradient id="brain-stroke" x1="0" y1="0" x2="400" y2="700" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#003466" />
                <stop offset="40%" stopColor="#1e3a8a" />
                <stop offset="80%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#2563eb" />
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

      {/* ── Right Side: Layered Navy Branding Card ── */}
      <div 
        className="relative z-10 flex flex-col justify-between w-full lg:w-[56%] p-10 lg:p-14 text-white rounded-[32px] shadow-[0_24px_48px_rgba(0,0,0,0.5)] border border-indigo-500/10 min-h-[40vh] lg:h-[calc(100vh-48px)] max-h-[720px] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/80"
      >
        {/* Subtle Tech-Grid Background Layer (Brightened for high visibility on dark background) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:16px_28px] pointer-events-none z-0" />
        
        {/* Glow blob */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-blue-500/10 blur-[80px] pointer-events-none z-0" />

        {/* Top: Small badge label */}
        <div className="z-10 flex items-center gap-2 w-max px-3 py-1 rounded-full bg-white/5 border border-white/10 select-none text-[10px] font-bold uppercase tracking-wider text-indigo-300">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
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
