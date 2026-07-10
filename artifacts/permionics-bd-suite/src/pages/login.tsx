import { useEffect, useMemo } from "react";
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

  const plexusData = useMemo(() => {
    let seed = 42;
    function random() {
      let x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    }
    const nodesList = [];
    const width = 400;
    const height = 700;
    for (let i = 0; i < 110; i++) {
      const bias = Math.pow(random(), 1.6);
      const x = width - bias * 360;
      const y = random() * height;
      const r = 0.8 + random() * 2.2;
      nodesList.push({ x, y, r });
    }
    const linesList = [];
    for (let i = 0; i < nodesList.length; i++) {
      for (let j = i + 1; j < nodesList.length; j++) {
        const n1 = nodesList[i];
        const n2 = nodesList[j];
        const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
        if (dist < 42) {
          const opacity = (1 - dist / 42) * 0.45;
          linesList.push({
            id: `${i}-${j}`,
            x1: n1.x,
            y1: n1.y,
            x2: n2.x,
            y2: n2.y,
            opacity,
          });
        }
      }
    }
    return { nodes: nodesList, lines: linesList };
  }, []);

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
        {/* High-fidelity Plexus Connection Network Background Watermark */}
        <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden rounded-[28px] opacity-[0.22]">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 400 700"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Draw Plexus Lines */}
            {plexusData.lines.map((line) => (
              <line
                key={line.id}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="#0f172a"
                strokeWidth="0.6"
                strokeOpacity={line.opacity}
              />
            ))}

            {/* Draw Plexus Nodes */}
            {plexusData.nodes.map((node, idx) => (
              <circle
                key={idx}
                cx={node.x}
                cy={node.y}
                r={node.r}
                fill="#0f172a"
                fillOpacity={0.45}
              />
            ))}
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
