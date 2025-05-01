// src/components/invitation/ConfirmationForm.tsx
'use client';

import type React from 'react';
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Trash2, PlusCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


const formSchema = z.object({
    willAttend: z.boolean().default(false),
    guests: z.array(z.object({ name: z.string().min(1, "El nombre no puede estar vacío") })).optional(),
}).refine(data => !data.willAttend || (data.guests && data.guests.length > 0 && data.guests.every(g => g.name.trim() !== '')), {
    message: "Debes ingresar al menos un nombre si confirmas asistencia.",
    path: ["guests"], // Attach error to the guests field array
});


interface ConfirmationFormProps {
  invitationId: string;
  assignedPasses: number;
  onConfirm: (guests: string[], rejected: boolean) => void;
}

const ConfirmationForm: React.FC<ConfirmationFormProps> = ({ invitationId, assignedPasses, onConfirm }) => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(true); // Controls visibility for initial choice
  const [attending, setAttending] = useState<boolean | null>(null); // null: initial, true: yes, false: no

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      willAttend: false,
      guests: [{ name: '' }], // Start with one guest field if attending
    },
  });

 const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "guests",
 });

 const watchWillAttend = form.watch('willAttend');

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const confirmedGuestNames = values.guests?.map(g => g.name.trim()).filter(Boolean) || [];

    if (values.willAttend) {
         if (confirmedGuestNames.length === 0) {
             form.setError("guests", { type: "manual", message: "Debes ingresar al menos un nombre si confirmas asistencia." });
             return; // Stop submission
         }
         if (confirmedGuestNames.length < assignedPasses) {
              toast({
                title: "Advertencia",
                description: `Solo se reservarán ${confirmedGuestNames.length} de los ${assignedPasses} pases disponibles.`,
                variant: "default", // Use default or a custom warning variant
              });
         }
         if (confirmedGuestNames.length > assignedPasses) {
              form.setError("guests", { type: "manual", message: `Solo tienes ${assignedPasses} pases asignados.` });
              return; // Stop submission
         }
         onConfirm(confirmedGuestNames, false); // Confirming attendance
         toast({ title: "¡Confirmación Exitosa!", description: "Hemos recibido tu confirmación." });
    } else {
         onConfirm([], true); // Rejecting attendance
         toast({ title: "Respuesta Recibida", description: "Gracias por hacérnoslo saber." });
    }
  };

   const handleInitialChoice = (attend: boolean) => {
        setAttending(attend);
        form.setValue('willAttend', attend);
        setShowForm(false); // Hide initial buttons, show form/rejection message
        if (!attend) {
             // If rejecting directly, call onConfirm immediately
             onConfirm([], true);
             toast({ title: "Respuesta Recibida", description: "Gracias por hacérnoslo saber." });
        }
    };


     if (attending === false) {
         // Show rejection message immediately if "No" was clicked initially
         return (
             <Card className="bg-muted/50 p-6 rounded-lg shadow">
                 <CardContent className="flex items-center gap-4">
                     <AlertCircle className="h-8 w-8 text-muted-foreground" />
                     <p className="text-muted-foreground">Gracias por informarnos. Lamentamos que no puedas acompañarnos.</p>
                 </CardContent>
             </Card>
         );
     }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg border-none bg-background">
      <CardHeader>
        <CardTitle className="text-center text-2xl md:text-3xl">¿Nos acompañas?</CardTitle>
      </CardHeader>
      <CardContent>
       {showForm ? (
           <div className="flex justify-center gap-4 mt-4 mb-6">
               <Button size="lg" onClick={() => handleInitialChoice(true)}>Sí, asistiré</Button>
               <Button size="lg" variant="outline" onClick={() => handleInitialChoice(false)}>No podré asistir</Button>
           </div>
       ) : (

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Guest Name Fields */}
          {watchWillAttend && (
            <div className="space-y-4">
              <Label className="text-lg">Nombre(s) de los asistentes ({fields.length}/{assignedPasses} pases):</Label>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Input
                    placeholder={`Nombre del asistente ${index + 1}`}
                    {...form.register(`guests.${index}.name`)}
                    className={form.formState.errors.guests?.[index]?.name ? 'border-destructive' : ''}
                  />
                  {fields.length > 1 && (
                     <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        aria-label="Eliminar asistente"
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                  )}
                </div>
              ))}

              {fields.length < assignedPasses && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: '' })}
                  className="text-primary border-primary hover:bg-primary/10"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Agregar Asistente
                </Button>
              )}
              {form.formState.errors.guests && typeof form.formState.errors.guests.message === 'string' && (
                  <p className="text-sm text-destructive mt-2">{form.formState.errors.guests.message}</p>
              )}
               {form.formState.errors.guests?.root && ( // Display root errors for the array
                   <p className="text-sm text-destructive mt-2">{form.formState.errors.guests.root.message}</p>
               )}
            </div>
          )}


           {/* Final Submit Button */}
           <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
               Enviar Confirmación
           </Button>
        </form>
       )}
      </CardContent>
    </Card>
  );
};

export default ConfirmationForm;

