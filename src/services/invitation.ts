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
    Asistentes: string[]; // For adult guests
    Kids: string[]; // For child guests
    // Add other fields if necessary
}

// Define the structure for submission data
export interface ConfirmationSubmissionData {
    adults: string[];
    kids: string[];
    rejected: boolean;
}

/**
 * Fetches invitation data from MongoDB based on the BodaID.
 * Handles fused invitations by checking a 'fusionadas' collection.
 * @param initialInvitationId The BodaID to search for.
 * @returns A promise resolving to the InvitationData or null if not found.
 */
export async function getInvitationData(initialInvitationId: string): Promise<InvitationData | null> {
    console.log(`Attempting to fetch data for initial BodaID: ${initialInvitationId}`);
    let client;
    try {
        client = await clientPromise;
        console.log("Successfully connected to MongoDB client.");
        const db = client.db("invitaciones"); // Database name
        const confirmacionesCollection = db.collection("confirmaciones");
        const fusionadasCollection = db.collection("fusionadas");

        let currentBodaID = initialInvitationId;
        let invitationDocument = await confirmacionesCollection.findOne({ BodaID: currentBodaID });

        if (!invitationDocument) {
            console.log(`BodaID ${currentBodaID} not found in 'confirmaciones'. Checking 'fusionadas'...`);
            const fusionRecord = await fusionadasCollection.findOne({ BodaIDantiguo: currentBodaID });

            if (fusionRecord && fusionRecord.BodaIDnuevo) {
                const newBodaID = fusionRecord.BodaIDnuevo as string;
                console.log(`BodaID ${currentBodaID} found in 'fusionadas'. New BodaID to search: ${newBodaID}`);
                currentBodaID = newBodaID; // Update currentBodaID to the new one
                invitationDocument = await confirmacionesCollection.findOne({ BodaID: currentBodaID });
            } else {
                console.log(`BodaID ${initialInvitationId} not found in 'fusionadas' either.`);
            }
        }

        if (invitationDocument) {
            console.log(`Found invitation data for effective BodaID: ${currentBodaID}`);
            // Ensure _id is converted to string for serialization
            // Important: Create a plain object to pass to client components
            const plainInvitation: InvitationData = {
                _id: invitationDocument._id.toString(), // Convert ObjectId to string
                BodaID: currentBodaID, // This is the effective BodaID
                Nombre: invitationDocument.Nombre as string,
                Confirmado: invitationDocument.Confirmado as boolean,
                PasesAsignados: invitationDocument.PasesAsignados as number,
                PasesConfirmados: invitationDocument.PasesConfirmados as number,
                Asistentes: (invitationDocument.Asistentes as string[]) || [], // Default to empty array
                Kids: (invitationDocument.Kids as string[]) || [], // Default to empty array
            };
            return plainInvitation;
        } else {
            console.log(`No invitation data found for initial BodaID: ${initialInvitationId} (after potential fusion check).`);
            return null; // Explicitly return null if not found
        }
    } catch (error) {
        console.error('Error fetching invitation data from MongoDB:', error);
        return null;
    }
}


/**
 * Submits the confirmation data to MongoDB.
 * @param bodaIdToUpdate The BodaID of the invitation to update (this should be the effective BodaID).
 * @param data The confirmation data (adults list, kids list, and rejection status).
 * @returns A promise resolving when the submission is complete.
 */
export async function submitConfirmation(bodaIdToUpdate: string, data: ConfirmationSubmissionData): Promise<void> {
    console.log(`Attempting to submit confirmation for BodaID: ${bodaIdToUpdate}`);
    let client;
    try {
        client = await clientPromise;
        console.log("Successfully connected to MongoDB client for submission.");
        const db = client.db("invitaciones");
        const collection = db.collection("confirmaciones");

        let updateData: Partial<Omit<InvitationData, '_id' | 'BodaID' | 'Nombre' | 'PasesAsignados'>> = {}; // More precise type
        const totalConfirmedPasses = data.adults.length + data.kids.length;

        if (data.rejected) {
            console.log(`Updating BodaID ${bodaIdToUpdate} as REJECTED.`);
            updateData = {
                Confirmado: true,
                PasesConfirmados: 0,
                Asistentes: [],
                Kids: [],
            };
        } else {
            console.log(`Updating BodaID ${bodaIdToUpdate} as CONFIRMED with ${data.adults.length} adults and ${data.kids.length} kids.`);
            updateData = {
                Confirmado: true,
                PasesConfirmados: totalConfirmedPasses,
                Asistentes: data.adults,
                Kids: data.kids,
            };
        }

        const result = await collection.updateOne(
            { BodaID: bodaIdToUpdate }, // Filter document by BodaID
            { $set: updateData }      // Set the new values
        );

        if (result.matchedCount === 0) {
            console.error(`Failed to submit confirmation: BodaID ${bodaIdToUpdate} not found.`);
            throw new Error(`Invitation with ID ${bodaIdToUpdate} not found.`);
        }

        if (result.modifiedCount === 0 && result.matchedCount === 1) {
            console.warn(`Confirmation data for BodaID ${bodaIdToUpdate} was already up-to-date.`);
        } else {
            console.log(`Successfully submitted confirmation for BodaID: ${bodaIdToUpdate}`);
        }

    } catch (error) {
        console.error('Error submitting confirmation data to MongoDB:', error);
        throw new Error('Failed to submit confirmation data to database.');
    }
}
