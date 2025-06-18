import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { toast } from "sonner";
import { ArrowLeft, KeyRound, BarChart3 } from 'lucide-react';

import StorageUsageBar from '@/components/StorageUsageBar'; // Custom component

// Define the schema for the password change form
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters." }),
  confirmPassword: z.string().min(8, { message: "Confirm password must be at least 8 characters." }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match.",
  path: ["confirmPassword"], // path to field that gets the error
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const SettingsPage = () => {
  console.log('SettingsPage loaded');
  const navigate = useNavigate();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  function onSubmit(data: PasswordFormValues) {
    console.log("Password change submitted:", data);
    // Here you would typically call an API to change the password
    // For now, we'll just show a success toast and reset the form
    toast.success("Password change request submitted. (This is a demo - no actual change).");
    form.reset();
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
            EWFW - Settings
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Dashboard
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/settings">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()} active>
                    Settings
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              {/* Add other navigation items here, e.g., Logout */}
               <NavigationMenuItem>
                <Link to="/login"> {/* Assuming /login is the logout destination or handles logout */}
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Logout
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-semibold mb-8">Account Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Change Password Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <KeyRound className="mr-2 h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your account password here.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your current password" {...field} />
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
                          <Input type="password" placeholder="Enter your new password" {...field} />
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
                          <Input type="password" placeholder="Confirm your new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">Update Password</Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Storage Usage Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Storage Details
              </CardTitle>
              <CardDescription>View your current storage utilization.</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <StorageUsageBar
                currentUsageInGB={2.5} // Example value
                totalStorageInGB={10}  // Example value
                label="Your Cloud Storage"
              />
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p>You are currently using <strong>2.50 GB</strong> of your <strong>10.00 GB</strong> allowance.</p>
                <p className="mt-2">Need more space? <Link to="/plans" className="text-blue-600 hover:underline">Upgrade your plan.</Link></p>
                 {/* Note: /plans is not in App.tsx, this is a placeholder for future functionality */}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Easy Web File Workbench (EWFW). All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default SettingsPage;