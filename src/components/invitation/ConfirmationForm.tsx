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
  name: z.string()
    .min(1, "El nombre no puede estar vacío.")
    .trim()
    .refine(value => value.split(' ').filter(n => n.trim().length > 0).length >= 2, {
      message: "Por favor, ingresa nombre y apellido.",
    })
    .refine(value => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/.test(value), {
      message: "El nombre solo debe contener letras, espacios, apóstrofes o guiones.",
    }),
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
      if (isNaN(ageNum) || ageNum <= 0 || ageNum > 17) { // Assuming children are 17 or younger
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La edad debe ser un número válido entre 1 y 17.",
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
        const initialGuests = assignedPasses > 0 ? Array(Math.min(1, assignedPasses)).fill({ name: '', type: 'adult' as const, age: '' }) : [];
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
        return g.name.trim();
    }).filter(Boolean) || [];

    const totalConfirmed = adults.length + kids.length;

    if (totalConfirmed === 0 && assignedPasses > 0 && fields.length > 0) { // Check fields.length to ensure form was intended to be filled
         form.setError("guests", { type: "manual", message: "Debes ingresar al menos un nombre si deseas confirmar." });
         toast({ title: "Error", description: "Debes ingresar al menos un nombre.", variant: "destructive" });
         return;
    }

    if (totalConfirmed > assignedPasses) {
         form.setError("guests", { type: "manual", message: `Solo tienes ${assignedPasses} pases asignados.` });
          toast({ title: "Error", description: `Solo tienes ${assignedPasses} pases asignados.`, variant: "destructive" });
         return;
    }

     if (totalConfirmed < assignedPasses && totalConfirmed > 0) {
          toast({
            title: "Advertencia",
            description: `Solo se reservarán ${totalConfirmed} de los ${assignedPasses} pases disponibles. Los pases restantes (${assignedPasses - totalConfirmed}) no se considerarán.`,
            variant: "default",
            duration: 7000,
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
            if (assignedPasses === 0) {
                toast({
                    title: "Información",
                    description: "No tienes pases asignados. Si crees que es un error, por favor contacta a los novios.",
                    variant: "default",
                });
                // Keep showing initial choice or a message, don't proceed to form.
                setShowInitialChoice(true); // Or a different state to show a message
                return;
            }
            setShowAttendanceForm(true);
        } else {
             try {
                await onConfirm([], [], true);
                toast({ title: "Respuesta Recibida", description: "Gracias por hacérnoslo saber." });
             } catch (e) {
                toast({ title: "Error", description: "No se pudo enviar la respuesta.", variant: "destructive" });
                setShowInitialChoice(true);
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
           <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4 mb-6">
               <Button className="w-full sm:w-auto" size="lg" onClick={() => handleInitialChoice(true)} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Sí, asistiré
                </Button>
               <Button className="w-full sm:w-auto" size="lg" variant="outline" onClick={() => handleInitialChoice(false)} disabled={isLoading}>
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
                    <div className="flex items-start gap-2">
                      <div className="flex-grow">
                        <Input
                            placeholder={`Nombre completo del asistente ${index + 1}`}
                            {...form.register(`guests.${index}.name`)}
                            className={cn(form.formState.errors.guests?.[index]?.name ? 'border-destructive' : '', 'bg-background')}
                            disabled={isLoading}
                        />
                        {form.formState.errors.guests?.[index]?.name && (
                            <p className="text-sm text-destructive mt-1">{form.formState.errors.guests?.[index]?.name?.message}</p>
                        )}
                      </div>
                      {(fields.length > 1 || (fields.length === 1 && assignedPasses > 1) ) && (
                         <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            aria-label="Eliminar asistente"
                            className="text-destructive hover:bg-destructive/10 mt-1" // Align with input top
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                      )}
                    </div>
                    <Controller
                        control={form.control}
                        name={`guests.${index}.type`}
                        defaultValue="adult" // Default to adult
                        render={({ field: radioField }) => (
                          <RadioGroup
                            onValueChange={(value) => {
                                radioField.onChange(value);
                                if (value === 'adult') {
                                    form.setValue(`guests.${index}.age`, '');
                                    // Clear age error if any
                                    form.clearErrors(`guests.${index}.age`);
                                }
                            }}
                            value={radioField.value}
                            className="flex space-x-4 pt-1"
                            disabled={isLoading}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="adult" id={`adult-${field.id}-${index}`} />
                              <Label htmlFor={`adult-${field.id}-${index}`}>Adulto</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="child" id={`child-${field.id}-${index}`} />
                              <Label htmlFor={`child-${field.id}-${index}`}>Niño (hasta 17 años)</Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                      {form.watch(`guests.${index}.type`) === 'child' && (
                        <div className="mt-2 space-y-1">
                            <Label htmlFor={`age-${field.id}-${index}`}>Edad del niño (años)</Label>
                            <Input
                                id={`age-${field.id}-${index}`}
                                type="number"
                                placeholder="Ej: 5"
                                {...form.register(`guests.${index}.age`)}
                                className={cn(form.formState.errors.guests?.[index]?.age ? 'border-destructive' : '', 'bg-background w-full sm:w-1/2')}
                                disabled={isLoading}
                                min="1"
                                max="17"
                            />
                            {form.formState.errors.guests?.[index]?.age && (
                                <p className="text-sm text-destructive mt-1">{form.formState.errors.guests?.[index]?.age?.message}</p>
                            )}
                        </div>
                      )}
                    {form.formState.errors.guests?.[index]?.type && (
                        <p className="text-sm text-destructive mt-1">{form.formState.errors.guests?.[index]?.type?.message}</p>
                    )}
                  </div>
                ))}
                 {form.formState.errors.guests?.root && (
                   <p className="text-sm text-destructive mt-2">{form.formState.errors.guests.root.message}</p>
                 )}

                {fields.length < assignedPasses && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ name: '', type: 'adult' as const, age: '' })}
                    className="text-primary border-primary hover:bg-primary/10"
                    disabled={isLoading || fields.length >= assignedPasses}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Asistente ({fields.length}/{assignedPasses})
                  </Button>
                )}

              </div>
          ) : (
                <p className="text-center text-muted-foreground">No tienes pases asignados para confirmar. Si crees que es un error, por favor contacta a los novios.</p>
          )}

           {assignedPasses > 0 && (
               <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="lg" disabled={isLoading || !form.formState.isDirty || !form.formState.isValid && fields.length > 0}>
                 {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                 Enviar Confirmación
               </Button>
           )}
           {!form.formState.isValid && form.formState.isDirty && fields.length > 0 && (
                <p className="text-center text-xs text-destructive mt-2">Por favor, completa correctamente todos los campos requeridos.</p>
            )}
        </form>
       ) : (
            <div className="text-center text-muted-foreground p-4">
                 Procesando tu respuesta...
             </div>
       )}
      </CardContent>
    </Card>
  );
};

export default ConfirmationForm;
