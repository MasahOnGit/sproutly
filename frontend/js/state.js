/**
 * Global frontend application state.
 *
 * This object stores shared data used across the application,
 * including authentication status and plant data.
 */
export const state = {

    /**
     * Plants loaded from the backend database
     * for authenticated users.
     */
    plants: [],

    /**
     * Current application mode.
     *
     * Possible values:
     * - 'guest'
     * - 'user'
     */
    mode: 'guest',

    /**
     * Currently authenticated user information.
     *
     * Null when the user is not logged in.
     */
    loggedInUser: null,

    /**
     * Temporary plants stored locally in guest mode.
     *
     * Guest plants are not saved to the backend database.
     */
    guestPlants: []
};