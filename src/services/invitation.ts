// src/services/invitation.ts
'use server'; // Ensure this code runs only on the server

import clientPromise from '@/lib/mongodb';
import type { ObjectId } from 'mongodb'; // Import ObjectId type

// Define the structure of the invitation data from MongoDB
export interface InvitationData {
    _id: ObjectId | string; // MongoDB ObjectId or its string representation
    BodaID: string;
    Nombre: string;
    Confirmado: boolean;
    PasesAsignados: number;
    PasesConfirmados: number;
    Asistentes: string[];
    // Add other fields if necessary
}

// Define the structure for submission data
export interface ConfirmationSubmissionData {
    guests: string[];
    rejected: boolean;
}

/**
 * Fetches invitation data from MongoDB based on the BodaID.
 * @param invitationId The BodaID to search for.
 * @returns A promise resolving to the InvitationData or null if not found.
 */
export async function getInvitationData(invitationId: string): Promise<InvitationData | null> {
    console.log(`Attempting to fetch data for BodaID: ${invitationId}`);
    let client;
    try {
        client = await clientPromise;
        console.log("Successfully connected to MongoDB client.");
        const db = client.db("invitaciones"); // Database name
        const collection = db.collection("confirmaciones"); // Collection name

        console.log(`Querying collection 'confirmaciones' for BodaID: ${invitationId}`);
        const invitation = await collection.findOne({ BodaID: invitationId });

        if (invitation) {
            console.log(`Found invitation data for BodaID: ${invitationId}`);
            // Ensure _id is converted to string for serialization
            // Important: Create a plain object to pass to client components
            const plainInvitation: InvitationData = {
                _id: invitation._id.toString(), // Convert ObjectId to string
                BodaID: invitation.BodaID,
                Nombre: invitation.Nombre,
                Confirmado: invitation.Confirmado,
                PasesAsignados: invitation.PasesAsignados, // Use PasesAsignados
                PasesConfirmados: invitation.PasesConfirmados, // Use PasesConfirmados
                Asistentes: invitation.Asistentes || [], // Default to empty array if null/undefined
            };
            return plainInvitation;
        } else {
            console.log(`No invitation data found for BodaID: ${invitationId}`);
            return null; // Explicitly return null if not found
        }
    } catch (error) {
        console.error('Error fetching invitation data from MongoDB:', error);
        // Rethrow or handle as appropriate for your application
        // Returning null might be suitable if not found is a possible outcome handled upstream
        return null;
         // Or: throw new Error('Failed to fetch invitation data from database.');
    }
    // Note: Connection closing is typically handled by the client management strategy
    // (global promise ensures connection reuse). Explicitly closing here might prematurely
    // terminate the connection if the app expects it to persist.
}


/**
 * Submits the confirmation data to MongoDB.
 * @param invitationId The BodaID of the invitation to update.
 * @param data The confirmation data (guests list and rejection status).
 * @returns A promise resolving when the submission is complete.
 */
export async function submitConfirmation(invitationId: string, data: ConfirmationSubmissionData): Promise<void> {
    console.log(`Attempting to submit confirmation for BodaID: ${invitationId}`);
    let client;
    try {
        client = await clientPromise;
        console.log("Successfully connected to MongoDB client for submission.");
        const db = client.db("invitaciones");
        const collection = db.collection("confirmaciones");

        let updateData: Partial<InvitationData> = {};

        if (data.rejected) {
            console.log(`Updating BodaID ${invitationId} as REJECTED.`);
            updateData = {
                Confirmado: true,
                PasesConfirmados: 0,
                Asistentes: [], // Clear attendees if rejected
            };
        } else {
            console.log(`Updating BodaID ${invitationId} as CONFIRMED with ${data.guests.length} guests.`);
            updateData = {
                Confirmado: true,
                PasesConfirmados: data.guests.length,
                Asistentes: data.guests,
            };
        }

        const result = await collection.updateOne(
            { BodaID: invitationId }, // Filter document by BodaID
            { $set: updateData }      // Set the new values
        );

        if (result.matchedCount === 0) {
            console.error(`Failed to submit confirmation: BodaID ${invitationId} not found.`);
            throw new Error(`Invitation with ID ${invitationId} not found.`);
        }

        if (result.modifiedCount === 0 && result.matchedCount === 1) {
            console.warn(`Confirmation data for BodaID ${invitationId} was already up-to-date.`);
             // Consider if this should be an error or just a warning
        } else {
            console.log(`Successfully submitted confirmation for BodaID: ${invitationId}`);
        }

    } catch (error) {
        console.error('Error submitting confirmation data to MongoDB:', error);
        // Rethrow or handle as appropriate
        throw new Error('Failed to submit confirmation data to database.');
    }
}

// Removed Google Sheets related functions as they are no longer used.
// Removed getMusic as it's handled client-side.
