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
        <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden rounded-[28px] opacity-[0.08]">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 400 700"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Brain Outline / Neural Network Core */}
            {/* Left Hemisphere Lobe */}
            <path
              d="M170 140 C120 140, 90 170, 90 220 C90 250, 110 270, 100 290 C90 310, 80 330, 80 350 C80 390, 110 420, 140 420 C155 420, 165 410, 175 425 C185 440, 195 440, 200 440"
              stroke="url(#brain-stroke)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="4 2"
            />
            {/* Right Hemisphere Tech-Grid Lobe */}
            <path
              d="M230 140 C280 140, 310 170, 310 220 C310 250, 290 270, 300 290 C310 310, 320 330, 320 350 C320 390, 290 420, 260 420 C245 420, 235 410, 225 425 C215 440, 205 440, 200 440"
              stroke="url(#brain-stroke)"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Central Processing Core (Microchip) */}
            <rect x="180" y="250" width="40" height="40" rx="6" fill="#1e3a8a" opacity="0.4" />
            <rect x="185" y="255" width="30" height="30" rx="4" stroke="url(#brain-stroke)" strokeWidth="1" />
            <circle cx="200" cy="270" r="6" fill="#3b82f6" opacity="0.6" />

            {/* Internal Circuit Lines Inside Brain */}
            <path d="M140 220 H180 M130 280 H180 M120 340 H180 M220 220 H260 M220 280 H270 M220 340 H280" stroke="url(#brain-stroke)" strokeWidth="1" />
            <path d="M200 170 V250 M200 290 V380" stroke="url(#brain-stroke)" strokeWidth="1" />

            {/* Extensively Branching Tentacles (spreading across background) */}
            {/* Top Left Branch */}
            <path d="M170 140 L130 90 H80 L50 50 H20" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="20" cy="50" r="3" fill="#1e3a8a" />
            <circle cx="80" cy="90" r="2" fill="#3b82f6" />

            {/* Top Right Branch */}
            <path d="M230 140 L270 90 H320 L350 50 H380" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="380" cy="50" r="3" fill="#1e3a8a" />
            <circle cx="320" cy="90" r="2" fill="#3b82f6" />

            {/* Mid Left Branch 1 */}
            <path d="M90 220 L50 200 H10" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="10" cy="200" r="3" fill="#1e3a8a" />

            {/* Mid Left Branch 2 */}
            <path d="M100 290 L60 290 L30 250 H10" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="10" cy="250" r="3" fill="#1e3a8a" />

            {/* Mid Left Branch 3 */}
            <path d="M80 350 L40 350 L15 390 V440 H10" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="10" cy="440" r="3" fill="#1e3a8a" />

            {/* Bottom Left Branch 1 */}
            <path d="M110 420 L70 460 V520 L40 560 H15" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="15" cy="560" r="3" fill="#1e3a8a" />

            {/* Bottom Left Branch 2 */}
            <path d="M140 420 L110 480 H60 L30 520 V650" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="30" cy="650" r="3" fill="#1e3a8a" />

            {/* Bottom Center Branch */}
            <path d="M200 440 V500 L160 550 V620 L130 660 H90" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="90" cy="660" r="3" fill="#1e3a8a" />

            {/* Bottom Right Branch 1 */}
            <path d="M260 420 L290 480 H340 L370 520 V650" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="370" cy="650" r="3" fill="#1e3a8a" />

            {/* Bottom Right Branch 2 */}
            <path d="M290 420 L330 460 V520 L360 560 H385" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="385" cy="560" r="3" fill="#1e3a8a" />

            {/* Mid Right Branch 1 */}
            <path d="M320 350 L360 350 L385 390 V440 H390" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="390" cy="440" r="3" fill="#1e3a8a" />

            {/* Mid Right Branch 2 */}
            <path d="M300 290 L340 290 L370 250 H390" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="390" cy="250" r="3" fill="#1e3a8a" />

            {/* Mid Right Branch 3 */}
            <path d="M310 220 L350 200 H390" stroke="url(#brain-stroke)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="390" cy="200" r="3" fill="#1e3a8a" />

            {/* Micro Dots (Synaptic nodes) */}
            <circle cx="130" cy="220" r="2.5" fill="#3b82f6" />
            <circle cx="270" cy="280" r="2.5" fill="#3b82f6" />
            <circle cx="200" cy="170" r="2.5" fill="#3b82f6" />
            <circle cx="200" cy="380" r="2.5" fill="#3b82f6" />
            <circle cx="160" cy="320" r="2" fill="#10b981" />
            <circle cx="240" cy="320" r="2" fill="#10b981" />

            {/* Gradients */}
            <defs>
              <linearGradient id="brain-stroke" x1="0" y1="0" x2="400" y2="700" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#6366f1" />
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
