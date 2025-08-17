'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import {AuthPage} from "@/components/Pages/AuthPage";
import {DashboardPage} from "@/components/Pages/DashboardPage";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <DashboardPage />;
}
