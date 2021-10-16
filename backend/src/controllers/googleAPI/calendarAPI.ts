import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import _ from 'lodash';
import * as schema from '../../utils/googleSchema';

const calendar = google.calendar('v3');

/**
 * Run freeBusyQuery for items and return array containing objects
 * with id and start of next or current event
 * @param client OAuth2Client
 * @param items Items to query
 * @param start Start time
 * @param end End time
 * @returns
 */
export const freeBusyQuery = async (
    client: OAuth2Client,
    items: any[],
    start: string,
    end: string
): Promise<any> => {
    try {
        const queryResult = await calendar.freebusy.query({
            requestBody: {
                timeMin: start,
                timeMax: end,
                items: items,
                calendarExpansionMax: items.length
            },
            auth: client
        });

        const calendars = queryResult.data.calendars;
        const results: any = {};

        _.forIn(calendars, (data: schema.FreeBusyCalendar, id: string) => {
            let startOfReservation: string | null | undefined = end;

            if (Array.isArray(data.busy) && data.busy.length !== 0) {
                startOfReservation = data.busy[0].start;
            }

            results[id] = startOfReservation;
        });

        return results;
    } catch (err) {
        throw err;
    }
};

/**
 * Create an event, will not check if the rooms is free
 * @param client OAuth2Client
 * @param room Room email
 * @param organizer Email of the current user
 * @param title Title of the event
 * @param start Start of the event
 * @param end End of the event
 */
export const createEvent = async (
    client: OAuth2Client,
    room: string,
    organizer: string,
    title: string,
    start: string,
    end: string
): Promise<schema.EventData> => {
    try {
        const startDt: schema.EventDateTier = {
            dateTime: start
        };
        const endDt: schema.EventDateTier = {
            dateTime: end
        };

        const attendeeList: schema.EventAttendee[] = [
            { email: room, resource: true },
            { email: organizer, responseStatus: 'accepted' }
        ];

        const event: schema.EventData = {
            summary: title,
            start: startDt,
            end: endDt,
            attendees: attendeeList,
            reminders: {
                useDefault: false
            }
        };

        const eventResult = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
            auth: client
        });

        return eventResult.data;
    } catch (err) {
        throw err;
    }
};

/**
 * Deletes the event of the current client
 * @param client OAuth2Client
 * @param eventId Id of the event to delete
 */
export const deleteEvent = async (client: OAuth2Client, eventId: string) => {
    try {
        await calendar.events.delete({
            calendarId: 'primary',
            eventId: eventId,
            sendUpdates: 'none',
            auth: client
        });
    } catch (err) {
        throw err;
    }
};

/**
 * Gets response status of the room of the event
 * @param client OAuth2Client
 * @param roomId Id of the room (email)
 * @param eventId Id of the event to lookup
 */
export const getEventData = async (
    client: OAuth2Client,
    eventId: string
): Promise<schema.EventData> => {
    try {
        const response = await calendar.events.get({
            calendarId: 'primary',
            eventId: eventId,
            auth: client
        });

        return response.data;
    } catch (err) {
        throw err;
    }
};
