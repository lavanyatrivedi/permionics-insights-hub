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
import logoMark from "@assets/permionics_P_exact_1783575144366.png";
import fullLogo from "@assets/logo-01_(1)_1783575156427.png";

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
    if (user?.authenticated) setLocation("/");
  }, [user?.authenticated, setLocation]);

  if (meLoading || user?.authenticated) {
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
      { data: { password: values.password, remember: false } },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          setLocation("/");
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
    <div className="min-h-screen w-full flex bg-white" style={{ background: "white" }}>
      {/* ── Left: Form panel ── */}
      <div className="flex flex-col justify-center items-center w-full lg:w-[45%] px-8 py-12 relative bg-white">
        {/* Permionics branding at the top left */}
        <div className="absolute top-8 left-8 lg:top-10 lg:left-10 select-none">
          <img src={fullLogo} alt="Permionics" className="h-6 object-contain opacity-90" />
        </div>

        {/* Centered Login Box */}
        <div className="w-full max-w-[320px] z-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-6 justify-center lg:justify-start">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "hsl(222 71% 17%)" }}
            >
              <img src={logoMark} alt="OSMOS" className="h-4.5 w-4.5 object-contain" />
            </div>
            <span className="text-lg font-bold tracking-wider uppercase text-slate-800" style={{ color: "hsl(222 71% 17%)" }}>
              OSMOS
            </span>
          </div>

          {/* Heading */}
          <div className="mb-6 text-center lg:text-left">
            <h1 className="text-xl font-bold tracking-tight text-slate-800" style={{ color: "hsl(222 47% 11%)" }}>
              Welcome back
            </h1>
            <p className="text-[11px] font-medium text-slate-400 mt-1">
              Sign in to the Permionics BD Intelligence Portal
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Lock
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
                          style={{ color: "hsl(220 10% 55%)" }}
                        />
                        <Input
                          type="password"
                          placeholder="Enter password"
                          className="pl-9.5 h-11 rounded-lg border-0 text-xs font-semibold"
                          style={{
                            background: "hsl(220 15% 94%)",
                            color: "hsl(222 47% 11%)",
                          }}
                          autoComplete="current-password"
                          autoFocus
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:gap-2"
                style={{
                  background: "linear-gradient(135deg, hsl(222 71% 18%), hsl(217 91% 28%))",
                  color: "white",
                  boxShadow: "0 4px 12px hsl(222 71% 17% / 0.25)",
                }}
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center gap-1.5">
                    <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Authenticating…
                  </span>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </form>
          </Form>

          <p className="mt-6 text-[10px] text-center" style={{ color: "hsl(220 10% 60%)" }}>
            Authorized personnel only · Permionics Membranes Pvt. Ltd.
          </p>
        </div>
      </div>

      {/* ── Right: Curved visual panel with moving mesh blobs ── */}
      <div
        className="hidden lg:flex flex-col items-center justify-center w-[55%] relative overflow-hidden rounded-l-[48px] shadow-2xl"
        style={{
          boxShadow: "-12px 0 40px hsl(222 71% 17% / 0.15)",
        }}
      >
        {/* Deep navy background */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(160deg, hsl(222 71% 9%) 0%, hsl(222 50% 14%) 50%, hsl(217 60% 20%) 100%)",
          }}
        />

        {/* Morphic moving blobs */}
        <div
          className="absolute w-96 h-96 rounded-full opacity-35"
          style={{
            background: "radial-gradient(circle at 40% 50%, hsl(217 91% 60%), hsl(260 80% 50%) 60%, transparent 80%)",
            top: "5%", left: "10%",
            filter: "blur(60px)",
            animation: "blob-random-move-1 25s ease-in-out infinite",
          }}
        />
        <div
          className="absolute w-72 h-72 rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, hsl(199 89% 55%), hsl(217 91% 60%) 50%, transparent 80%)",
            bottom: "10%", right: "5%",
            filter: "blur(50px)",
            animation: "blob-random-move-2 20s ease-in-out infinite reverse",
          }}
        />

        {/* Centre content */}
        <div className="relative z-10 flex flex-col items-center text-center px-12 space-y-5">
          {/* Blob logo */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center osmos-blob"
            style={{
              background: "linear-gradient(135deg, hsl(217 91% 55% / 0.25), hsl(260 80% 55% / 0.15))",
              border: "1px solid hsl(217 91% 60% / 0.2)",
              backdropFilter: "blur(12px)",
            }}
          >
            <img src={logoMark} alt="OSMOS" className="w-12 h-12 object-contain" style={{ filter: "brightness(10)" }} />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-widest text-white/95 uppercase">OSMOS</h2>
            <p className="text-[11px] text-white/50 max-w-[280px] leading-relaxed font-medium">
              BD Intelligence Platform for Permionics Membranes - powering smarter business development with AI.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-1.5 mt-2 max-w-xs">
            {["Case Study Library", "AI BD Assistant", "Smart Generator", "Questionnaire Engine"].map(f => (
              <span
                key={f}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                style={{
                  background: "hsl(217 91% 60% / 0.1)",
                  color: "hsl(217 91% 80% / 0.8)",
                  border: "1px solid hsl(217 91% 60% / 0.15)",
                  backdropFilter: "blur(4px)",
                }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
