/**
 * Represents music information.
 */
export interface Music {
  /**
   * The URL of the music file.
   */
  musicUrl: string;
}

/**
 * Asynchronously retrieves music information for a given invitation ID.
 *
 * @param invitationId The ID of the invitation for which to retrieve music data.
 * @returns A promise that resolves to a Music object containing the music URL.
 * @throws Will throw an error if the fetch fails or the invitation ID is invalid.
 */
export async function getMusic(invitationId: string): Promise<Music> {
  // TODO: Implement this by calling the actual backend API endpoint.
  // Example:
  // const response = await fetch(`/api/music/${invitationId}`);
  // if (!response.ok) {
  //   throw new Error(`Failed to fetch music for invitation ${invitationId}`);
  // }
  // const data = await response.json();
  // return { musicUrl: data.musicUrl };

  console.warn(`Fetching placeholder music for invitation ID: ${invitationId}`);

  // Return placeholder data for now, pointing to the local file
  return {
    musicUrl: '/music/UnPactoConDios.mp3', // Updated music URL
  };
}

// TODO: Implement functions to fetch and submit confirmation data
export interface ConfirmationData {
    guests: string[];
    rejected: boolean;
}

/**
 * Fetches the current confirmation status for a given invitation ID.
 * @param invitationId The ID of the invitation.
 * @returns A promise resolving to the ConfirmationData or null if not found.
 */
export async function getConfirmation(invitationId: string): Promise<ConfirmationData | null> {
    // TODO: Implement backend API call
    console.warn(`Fetching placeholder confirmation for invitation ID: ${invitationId}`);
    // Example placeholder logic:
    // if (invitationId === 'rejected-id') return { guests: [], rejected: true };
    // if (invitationId === 'confirmed-id') return { guests: ['Placeholder Guest 1', 'Placeholder Guest 2'], rejected: false };
    return null; // Default: No confirmation yet
}

/**
 * Submits the confirmation data for a given invitation ID.
 * @param invitationId The ID of the invitation.
 * @param data The confirmation data (guests list and rejection status).
 * @returns A promise resolving when the submission is complete.
 */
export async function submitConfirmation(invitationId: string, data: ConfirmationData): Promise<void> {
    // TODO: Implement backend API call (e.g., using POST or PUT)
    console.warn(`Submitting placeholder confirmation for invitation ID: ${invitationId}`, data);
    // Example:
    // const response = await fetch(`/api/confirmations/${invitationId}`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(data),
    // });
    // if (!response.ok) {
    //     throw new Error('Failed to submit confirmation');
    // }
    return Promise.resolve();
}

/**
 * Fetches the number of assigned passes for a given invitation ID.
 * @param invitationId The ID of the invitation.
 * @returns A promise resolving to the number of assigned passes.
 */
export async function getAssignedPasses(invitationId: string): Promise<number> {
    // TODO: Implement backend API call
     console.warn(`Fetching placeholder assigned passes for invitation ID: ${invitationId}`);
     return 4; // Placeholder
}
