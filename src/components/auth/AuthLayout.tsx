import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border border-border/50 shadow-lg rounded-xl">
        <CardContent className="p-8 space-y-6">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
              <div className="text-white font-bold text-xl">ST</div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>

          {/* Content */}
          {children}
        </CardContent>
      </Card>
    </div>
  );
}