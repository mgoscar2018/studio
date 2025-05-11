// src/components/invitation/ConfirmationForm.tsx
'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Trash2, PlusCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const guestSchema = z.object({
  name: z.string().min(1, "El nombre no puede estar vacío").trim(),
  type: z.enum(['adult', 'child'], { required_error: "Debes seleccionar si es adulto o niño." }),
  age: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'child') {
    if (!data.age || data.age.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La edad es requerida para niños.",
        path: ['age'],
      });
    } else {
      const ageNum = parseInt(data.age, 10);
      if (isNaN(ageNum) || ageNum <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La edad debe ser un número positivo.",
          path: ['age'],
        });
      }
    }
  }
});

const formSchema = z.object({
  guests: z.array(guestSchema)
});


interface ConfirmationFormProps {
  invitationId: string;
  assignedPasses: number;
  onConfirm: (adults: string[], kids: string[], rejected: boolean) => Promise<void>;
  isLoading: boolean;
}

const ConfirmationForm: React.FC<ConfirmationFormProps> = ({
    invitationId,
    assignedPasses,
    onConfirm,
    isLoading
}) => {
  const { toast } = useToast();
  const [showInitialChoice, setShowInitialChoice] = useState(true);
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guests: [],
    },
    mode: 'onChange', // Validate on change for better UX
  });

 const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "guests",
 });

 useEffect(() => {
    if (showAttendanceForm) {
        // Add age field to initial guests
        const initialGuests = assignedPasses > 0 ? Array(1).fill({ name: '', type: 'adult' as const, age: '' }) : [];
         replace(initialGuests);
    } else {
        replace([]);
    }
 }, [showAttendanceForm, assignedPasses, replace]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const adults = values.guests?.filter(g => g.type === 'adult').map(g => g.name.trim()).filter(Boolean) || [];
    const kids = values.guests?.filter(g => g.type === 'child').map(g => {
        const ageNum = parseInt(g.age || '', 10);
        if (g.name.trim() && !isNaN(ageNum) && ageNum > 0) {
            return `${g.name.trim()} (${ageNum} años)`;
        }
        return g.name.trim(); // Fallback, though validation should prevent this
    }).filter(Boolean) || [];

    const totalConfirmed = adults.length + kids.length;

    if (totalConfirmed === 0 && assignedPasses > 0) {
         form.setError("guests", { type: "manual", message: "Debes ingresar al menos un nombre." });
         toast({ title: "Error", description: "Debes ingresar al menos un nombre.", variant: "destructive" });
         return;
    }

    if (totalConfirmed > assignedPasses) {
         form.setError("guests", { type: "manual", message: `Solo tienes ${assignedPasses} pases asignados.` });
          toast({ title: "Error", description: `Solo tienes ${assignedPasses} pases asignados.`, variant: "destructive" });
         return;
    }

     if (totalConfirmed < assignedPasses && totalConfirmed > 0) { // Only show if some passes are confirmed
          toast({
            title: "Advertencia",
            description: `Solo se reservarán ${totalConfirmed} de los ${assignedPasses} pases disponibles.`,
            variant: "default", // Changed from destructive for non-critical warning
          });
     }

     try {
        await onConfirm(adults, kids, false);
        toast({ title: "¡Confirmación Exitosa!", description: "Hemos recibido tu confirmación." });
     } catch (e) {
         toast({ title: "Error", description: "No se pudo enviar la confirmación.", variant: "destructive" });
     }
  };

   const handleInitialChoice = async (attend: boolean) => {
        setShowInitialChoice(false);
        if (attend) {
            setShowAttendanceForm(true);
        } else {
             try {
                await onConfirm([], [], true);
                toast({ title: "Respuesta Recibida", description: "Gracias por hacérnoslo saber." });
             } catch (e) {
                toast({ title: "Error", description: "No se pudo enviar la respuesta.", variant: "destructive" });
                setShowInitialChoice(true); // Allow user to try again
             }
        }
    };


  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg border-none bg-background">
      <CardHeader>
        <CardTitle className="text-center text-2xl md:text-3xl">¿Nos acompañas?</CardTitle>
      </CardHeader>
      <CardContent>
       {showInitialChoice ? (
           <div className="flex justify-center gap-4 mt-4 mb-6">
               <Button size="lg" onClick={() => handleInitialChoice(true)} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Sí, asistiré
                </Button>
               <Button size="lg" variant="outline" onClick={() => handleInitialChoice(false)} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    No podré asistir
                </Button>
           </div>
       ) : showAttendanceForm ? (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {assignedPasses > 0 ? (
              <div className="space-y-4">
                <Label className="text-lg">Nombre de los asistentes:</Label>
                {fields.map((field, index) => (
                  <div key={field.id} className="p-3 border rounded-md space-y-3 bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder={`Nombre del asistente ${index + 1}`}
                        {...form.register(`guests.${index}.name`)}
                        className={cn(form.formState.errors.guests?.[index]?.name ? 'border-destructive' : '', 'bg-background')}
                        disabled={isLoading}
                      />
                      {/* Allow removal only if more than one guest or if 0 passes (though 0 passes form is hidden) */}
                      {(fields.length > 1 ) && (
                         <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            aria-label="Eliminar asistente"
                            className="text-destructive hover:bg-destructive/10"
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                      )}
                    </div>
                    <Controller
                        control={form.control}
                        name={`guests.${index}.type`}
                        render={({ field: radioField }) => (
                          <RadioGroup
                            onValueChange={(value) => {
                                radioField.onChange(value);
                                // Reset age if switching from child to adult
                                if (value === 'adult') {
                                    form.setValue(`guests.${index}.age`, '');
                                }
                            }}
                            value={radioField.value} // Ensure value is controlled
                            className="flex space-x-4"
                            disabled={isLoading}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="adult" id={`adult-${field.id}`} />
                              <Label htmlFor={`adult-${field.id}`}>Adulto</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="child" id={`child-${field.id}`} />
                              <Label htmlFor={`child-${field.id}`}>Niño</Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                      {/* Conditional Age Input */}
                      {form.watch(`guests.${index}.type`) === 'child' && (
                        <div className="mt-2 space-y-1">
                            <Label htmlFor={`age-${field.id}`}>Edad del niño (años)</Label>
                            <Input
                                id={`age-${field.id}`}
                                type="number" // Use number type for better UX on mobile
                                placeholder="Ej: 5"
                                {...form.register(`guests.${index}.age`)}
                                className={cn(form.formState.errors.guests?.[index]?.age ? 'border-destructive' : '', 'bg-background w-1/2')} // Limit width
                                disabled={isLoading}
                                min="1" // Basic HTML5 validation
                            />
                            {form.formState.errors.guests?.[index]?.age && (
                                <p className="text-sm text-destructive">{form.formState.errors.guests?.[index]?.age?.message}</p>
                            )}
                        </div>
                      )}

                    {form.formState.errors.guests?.[index]?.name && (
                        <p className="text-sm text-destructive">{form.formState.errors.guests?.[index]?.name?.message}</p>
                    )}
                    {form.formState.errors.guests?.[index]?.type && (
                        <p className="text-sm text-destructive">{form.formState.errors.guests?.[index]?.type?.message}</p>
                    )}
                    {/* Removed root error for specific age as it's handled per field */}
                  </div>
                ))}
                 {form.formState.errors.guests?.root && ( // For array-level errors like too many guests
                   <p className="text-sm text-destructive mt-2">{form.formState.errors.guests.root.message}</p>
                 )}

                {fields.length < assignedPasses && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    // Add age field to new guests
                    onClick={() => append({ name: '', type: 'adult' as const, age: '' })}
                    className="text-primary border-primary hover:bg-primary/10"
                    disabled={isLoading || fields.length >= assignedPasses}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Asistente
                  </Button>
                )}

              </div>
          ) : ( // This case (assignedPasses === 0) should ideally not show the form for adding guests.
                // Or it means they can't confirm anyone.
                <p className="text-center text-muted-foreground">No tienes pases asignados para confirmar.</p>
          )}

           {assignedPasses > 0 && (
               <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="lg" disabled={isLoading || !form.formState.isDirty || !form.formState.isValid}>
                 {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                 Enviar Confirmación
               </Button>
           )}
           {!form.formState.isValid && form.formState.isDirty && (
                <p className="text-center text-xs text-destructive mt-2">Por favor, completa todos los campos requeridos.</p>
            )}
        </form>
       ) : ( // This is the state after "No podré asistir" is clicked and processed.
            <div className="text-center text-muted-foreground p-4">
                 Procesando tu respuesta...
             </div>
       )}
      </CardContent>
    </Card>
  );
};

export default ConfirmationForm;
