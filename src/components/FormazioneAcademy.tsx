import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, GraduationCap } from 'lucide-react';

const FormazioneAcademy = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Formazione & Academy</h1>
          <p className="text-muted-foreground mt-2">
            Migliora le tue competenze con i nostri corsi e tutorial specializzati
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <GraduationCap className="h-8 w-8 text-primary" />
        </div>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-8 text-center bg-blue-500">
          <Star className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Hai bisogno di supporto personalizzato?</h2>
          <p className="text-muted-foreground mb-6">
            Contattaci per sessioni di formazione one-to-one o consulenze specifiche per il tuo business
          </p>
          <Button size="lg" className="mr-4">
            Richiedi Consulenza
          </Button>
          <Button variant="outline" size="lg">
            Contatta il Supporto
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
export default FormazioneAcademy;