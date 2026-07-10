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

const loginSchema = z.object({
  password: z.string().min(1, "Access passphrase is required"),
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
            description: "Invalid passphrase. Please try again.",
            variant: "destructive",
          });
          form.setError("password", { message: "Incorrect passphrase" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen w-full flex" style={{ background: "hsl(220 25% 97%)" }}>
      {/* ── Left: Form panel ── */}
      <div className="flex flex-col justify-center items-center w-full lg:w-[45%] px-8 py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "hsl(222 71% 17%)" }}
            >
              <img src={logoMark} alt="OSMOS" className="h-6 w-6 object-contain" />
            </div>
            <span className="text-xl font-extrabold tracking-tight" style={{ color: "hsl(222 71% 17%)" }}>
              OSMOS
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: "hsl(222 47% 11%)" }}>
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: "hsl(220 10% 50%)" }}>
              Sign in to the Permionics BD Intelligence Portal
            </p>
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
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4"
                          style={{ color: "hsl(220 10% 55%)" }}
                        />
                        <Input
                          type="password"
                          placeholder="Enter access passphrase"
                          className="pl-10 h-12 rounded-xl border-0 text-sm font-medium"
                          style={{
                            background: "hsl(220 15% 93%)",
                            color: "hsl(222 47% 11%)",
                          }}
                          autoComplete="current-password"
                          autoFocus
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:gap-3"
                style={{
                  background: "linear-gradient(135deg, hsl(222 71% 18%), hsl(217 91% 28%))",
                  color: "white",
                  boxShadow: "0 4px 16px hsl(222 71% 17% / 0.35)",
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

          <p className="mt-8 text-xs text-center" style={{ color: "hsl(220 10% 60%)" }}>
            Authorized personnel only · Permionics Membranes Pvt. Ltd.
          </p>
        </div>
      </div>

      {/* ── Right: Gradient visual panel ── */}
      <div
        className="hidden lg:flex flex-col items-center justify-center w-[55%] relative overflow-hidden"
        style={{ borderRadius: "0 0 0 0" }}
      >
        {/* Deep navy background */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(160deg, hsl(222 71% 9%) 0%, hsl(222 50% 14%) 50%, hsl(217 60% 20%) 100%)",
          }}
        />

        {/* Morphic blob 1 */}
        <div
          className="absolute w-96 h-96 rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle at 40% 50%, hsl(217 91% 60%), hsl(260 80% 50%) 60%, transparent 80%)",
            top: "5%", left: "10%",
            filter: "blur(60px)",
            animation: "blob-float 6s ease-in-out infinite",
          }}
        />
        {/* Morphic blob 2 */}
        <div
          className="absolute w-72 h-72 rounded-full opacity-25"
          style={{
            background: "radial-gradient(circle, hsl(199 89% 55%), hsl(217 91% 60%) 50%, transparent 80%)",
            bottom: "10%", right: "5%",
            filter: "blur(50px)",
            animation: "blob-float 8s ease-in-out infinite reverse",
          }}
        />

        {/* Centre content */}
        <div className="relative z-10 flex flex-col items-center text-center px-12 space-y-6">
          {/* Blob logo */}
          <div
            className="w-28 h-28 rounded-3xl flex items-center justify-center osmos-blob"
            style={{
              background: "linear-gradient(135deg, hsl(217 91% 55% / 0.3), hsl(260 80% 55% / 0.2))",
              border: "1px solid hsl(217 91% 60% / 0.3)",
              backdropFilter: "blur(12px)",
            }}
          >
            <img src={logoMark} alt="OSMOS" className="w-16 h-16 object-contain" style={{ filter: "brightness(10)" }} />
          </div>

          <div className="space-y-3">
            <h2 className="text-4xl font-extrabold tracking-tight text-white">OSMOS</h2>
            <p className="text-base text-white/60 max-w-xs leading-relaxed">
              BD Intelligence Platform for Permionics Membranes — powering smarter business development with AI.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {["Case Study Library", "AI BD Assistant", "Smart Generator", "Questionnaire Engine"].map(f => (
              <span
                key={f}
                className="text-xs font-medium px-3 py-1.5 rounded-full"
                style={{
                  background: "hsl(217 91% 60% / 0.15)",
                  color: "hsl(217 91% 80%)",
                  border: "1px solid hsl(217 91% 60% / 0.25)",
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
