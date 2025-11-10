import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  tips?: string[];
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  tips
}) => {
  return (
    <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/5">
      <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="mb-6 p-4 bg-primary/10 rounded-full">
          <Icon className="h-12 w-12 text-primary" />
        </div>
        
        <h3 className="text-2xl font-bold text-foreground mb-3">{title}</h3>
        <p className="text-muted-foreground text-base mb-6 max-w-md">{description}</p>
        
        {(primaryAction || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {primaryAction && (
              <Button 
                size="lg"
                onClick={primaryAction.onClick}
                className="min-w-[200px]"
              >
                {primaryAction.icon && <primaryAction.icon className="h-5 w-5 mr-2" />}
                {primaryAction.label}
              </Button>
            )}
            {secondaryAction && (
              <Button 
                size="lg"
                variant="outline"
                onClick={secondaryAction.onClick}
                className="min-w-[200px]"
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
        
        {tips && tips.length > 0 && (
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg max-w-lg">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 Quick Tips</h4>
            <ul className="text-left text-sm text-blue-800 dark:text-blue-200 space-y-1">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
