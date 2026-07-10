import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useChangePassword } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Settings, Shield, KeyRound, Database, CheckCircle2 } from "lucide-react";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function SettingsPage() {
  const { toast } = useToast();
  const changePasswordMutation = useChangePassword();

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: z.infer<typeof passwordSchema>) => {
    changePasswordMutation.mutate(
      { 
        data: { 
          currentPassword: values.currentPassword, 
          newPassword: values.newPassword 
        } 
      }, 
      {
        onSuccess: () => {
          toast({
            title: "Password Updated",
            description: "Your password has been changed successfully.",
          });
          form.reset();
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update password. Please check your current password.",
            variant: "destructive",
          });
        }
      }
    );
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-5xl mx-auto">
      <div className="flex items-center space-x-2">
        <Settings className="h-6 w-6 text-primary" />
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-4 lg:col-span-3">
          <nav className="flex space-x-2 md:flex-col md:space-x-0 md:space-y-1">
            <button className="bg-muted text-primary hover:bg-muted font-medium justify-start w-full inline-flex items-center rounded-md px-3 py-2 text-sm transition-colors">
              <Shield className="mr-2 h-4 w-4" />
              Security
            </button>
            <button className="hover:bg-muted text-muted-foreground hover:text-foreground font-medium justify-start w-full inline-flex items-center rounded-md px-3 py-2 text-sm transition-colors">
              <Database className="mr-2 h-4 w-4" />
              System Status
            </button>
          </nav>
        </div>

        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update the master access password for the BD Suite.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="mt-2"
                    disabled={changePasswordMutation.isPending}
                  >
                    {changePasswordMutation.isPending ? "Updating..." : "Update Passphrase"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Integration Status
              </CardTitle>
              <CardDescription>
                View the connection status for internal APIs and services.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Core Database</h4>
                  <p className="text-sm text-muted-foreground">PostgreSQL Storage</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 flex items-center">
                  <CheckCircle2 className="h-3 w-3" /> Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">LLM Assistant API</h4>
                  <p className="text-sm text-muted-foreground">OpenAI Integration</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 flex items-center">
                  <CheckCircle2 className="h-3 w-3" /> Connected
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 border-t py-3">
              <p className="text-xs text-muted-foreground w-full text-center">
                Permionics BD Suite v1.0.0
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
