// src/components/invitation/ConfirmationForm.tsx
'use client';

import type React from 'react';
import { useState, useEffect } from 'react'; // Import useEffect
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Removed Checkbox import as it's not directly used for willAttend logic anymore
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Trash2, PlusCircle, AlertCircle, Loader2 } from 'lucide-react'; // Added Loader2 for loading state
import { useToast } from '@/hooks/use-toast';


// Adjusted schema: No longer needs willAttend boolean directly,
// as the form is only shown when attending.
// Focus on the guest list validation.
const formSchema = z.object({
    guests: z.array(
        z.object({ name: z.string().min(1, "El nombre no puede estar vacío").trim() })
    )
    // Removed refine based on willAttend
});


interface ConfirmationFormProps {
  invitationId: string;
  assignedPasses: number;
  onConfirm: (guests: string[], rejected: boolean) => Promise<void>; // Make onConfirm async
  isLoading: boolean; // Receive loading state from parent
}

const ConfirmationForm: React.FC<ConfirmationFormProps> = ({
    invitationId,
    assignedPasses,
    onConfirm,
    isLoading // Use loading state passed from parent
}) => {
  const { toast } = useToast();
  const [showInitialChoice, setShowInitialChoice] = useState(true); // Controls visibility for initial choice
  const [showAttendanceForm, setShowAttendanceForm] = useState(false); // Controls visibility of the guest entry form

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Initialize with one guest field if showing the form, otherwise empty
      guests: showAttendanceForm && assignedPasses > 0 ? [{ name: '' }] : [],
    },
    mode: 'onChange', // Validate on change for better UX
  });

 const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "guests",
 });

 // Effect to initialize guest fields when the form becomes visible
 useEffect(() => {
    if (showAttendanceForm) {
        const initialGuests = assignedPasses > 0 ? Array(1).fill({ name: '' }) : [];
         // Use replace to reset the array when the form appears
         replace(initialGuests);
    } else {
        // Clear fields if form is hidden
        replace([]);
    }
 }, [showAttendanceForm, assignedPasses, replace]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const confirmedGuestNames = values.guests?.map(g => g.name).filter(Boolean) || []; // No trim needed due to schema

    if (confirmedGuestNames.length === 0 && assignedPasses > 0) {
         // This case should ideally be prevented by UI logic, but double-check
         form.setError("guests", { type: "manual", message: "Debes ingresar al menos un nombre." });
         toast({ title: "Error", description: "Debes ingresar al menos un nombre.", variant: "destructive" });
         return;
    }

    if (confirmedGuestNames.length > assignedPasses) {
         form.setError("guests", { type: "manual", message: `Solo tienes ${assignedPasses} pases asignados.` });
          toast({ title: "Error", description: `Solo tienes ${assignedPasses} pases asignados.`, variant: "destructive" });
         return;
    }

     if (confirmedGuestNames.length < assignedPasses) {
          toast({
            title: "Advertencia",
            description: `Solo se reservarán ${confirmedGuestNames.length} de los ${assignedPasses} pases disponibles.`,
            variant: "default", // Use default or a custom warning variant
          });
     }

     try {
        await onConfirm(confirmedGuestNames, false); // Submit attendance
        toast({ title: "¡Confirmación Exitosa!", description: "Hemos recibido tu confirmación." });
        // The parent component will handle hiding the form upon successful state update
     } catch (e) {
         // Error handled by parent, maybe show a specific toast here if needed
         toast({ title: "Error", description: "No se pudo enviar la confirmación.", variant: "destructive" });
     }

  };

   const handleInitialChoice = async (attend: boolean) => {
        // e.preventDefault(); // REMOVED: Allow default button behavior (no scroll jump)
        setShowInitialChoice(false); // Hide initial buttons
        if (attend) {
            setShowAttendanceForm(true); // Show the guest entry form
        } else {
             // Handle rejection immediately
             try {
                await onConfirm([], true); // Call onConfirm with rejected=true
                toast({ title: "Respuesta Recibida", description: "Gracias por hacérnoslo saber." });
                 // Parent component will update state and likely hide this form/show rejection message
             } catch (e) {
                toast({ title: "Error", description: "No se pudo enviar la respuesta.", variant: "destructive" });
                setShowInitialChoice(true); // Show buttons again on error
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
                {/* Pass attend=true */}
               <Button size="lg" onClick={() => handleInitialChoice(true)} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Sí, asistiré
                </Button>
                 {/* Pass attend=false */}
               <Button size="lg" variant="outline" onClick={() => handleInitialChoice(false)} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    No podré asistir
                </Button>
           </div>
       ) : showAttendanceForm ? (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {assignedPasses > 0 ? (
              <div className="space-y-4">
                <Label className="text-lg">Nombre de los asistentes:</Label> {/* Changed label text */}
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Input
                      placeholder={`Nombre del asistente ${index + 1}`}
                      {...form.register(`guests.${index}.name`)}
                      className={form.formState.errors.guests?.[index]?.name ? 'border-destructive' : ''}
                      disabled={isLoading} // Disable input during submission
                    />
                    {(fields.length > 1 || assignedPasses === 0) && ( // Allow removal even if only one field but 0 passes (edge case)
                       <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          aria-label="Eliminar asistente"
                          className="text-destructive hover:bg-destructive/10"
                          disabled={isLoading} // Disable button during submission
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                  </div>
                ))}
                 {form.formState.errors.guests?.root && ( // Display root errors for the array
                   <p className="text-sm text-destructive mt-2">{form.formState.errors.guests.root.message}</p>
                 )}
                  {/* Display individual field errors */}
                 {form.formState.errors.guests?.map((error, index) => error?.name && (
                     <p key={index} className="text-sm text-destructive">{error.name.message}</p>
                 ))}


                {fields.length < assignedPasses && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ name: '' })}
                    className="text-primary border-primary hover:bg-primary/10"
                    disabled={isLoading || fields.length >= assignedPasses} // Disable if loading or max passes reached
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Asistente
                  </Button>
                )}

              </div>
          ) : (
                <p className="text-center text-muted-foreground">No tienes pases asignados.</p>
          )}


           {/* Final Submit Button - Only show if passes > 0 */}
           {assignedPasses > 0 && (
               <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="lg" disabled={isLoading || !form.formState.isValid}>
                 {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                 Enviar Confirmación
               </Button>
           )}
        </form>
       ) : (
            // This state (initial choice made, but form not shown) usually means rejection was chosen
            // The parent component should ideally handle showing the rejection message.
            // Adding a fallback message here just in case.
            <div className="text-center text-muted-foreground p-4">
                 Procesando tu respuesta...
             </div>
       )}
      </CardContent>
    </Card>
  );
};

export default ConfirmationForm;
