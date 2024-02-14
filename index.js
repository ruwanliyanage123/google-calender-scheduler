const express = require('express');
const { google } = require('googleapis');
const { OAuth2 } = require('google-auth-library/build/src/auth/oauth2');
const app = express();
const port = 3000;
const calendarId = 'ruwanliyanagephotography@gmail.com'; // Replace with your actual calendar ID
const clientId = '24879820254-u6v1m5ost962n9ekbr0gadb62umu7nqn.apps.googleusercontent.com'; // Replace with your OAuth2 client ID
const clientSecret = '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'; // Replace with your OAuth2 client secret
const redirectUri = 'http://localhost:3000/oauth2callback'; // Replace with your OAuth2 redirect URI

const oauth2Client = new OAuth2(clientId, clientSecret, redirectUri);

// Replace 'path/to/your/token.json' with the actual path or filename you want to use for storing the token
const TOKEN_PATH = './token.json';

app.get('/free-slot', (req, res) => {
   const authUrl = oauth2Client.generateAuthUrl({
     access_type: 'offline',
     scope: ['https://www.googleapis.com/auth/calendar.readonly'],
   });
 
   res.redirect(authUrl);
 });

 app.get('/oauth2callback', async (req, res) => {
   const code = req.query.code;
 
   // Get the access token using the authorization code
   const { tokens } = await oauth2Client.getToken(code);
   oauth2Client.setCredentials(tokens);
 
   res.send('Authorization successful! You can close this window.');
 
   // Now you can use oauth2Client to make API requests
   listFreeSlots();
 });

async function listFreeSlots() {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days from now

  const events = await calendar.events.list({
    calendarId,
    timeMin,
    timeMax,
    maxResults: 10, // Adjust as needed
    singleEvents: true,
    orderBy: 'startTime',
  });

  const busySlots = events.data.items.map(event => ({
    start: event.start.dateTime || event.start.date,
    end: event.end.dateTime || event.end.date,
  }));

  // Your logic to find free slots based on busySlots
  console.log('Busy Slots:', busySlots);

  // Example logic: Assume working hours are 9 AM to 5 PM
  const workingHours = Array.from({ length: 5 }, (_, i) => {
    const start = new Date();
    start.setHours(9 + i, 0, 0, 0);

    const end = new Date();
    end.setHours(17 + i, 0, 0, 0);

    return { start: start.toISOString(), end: end.toISOString() };
  });

  const freeSlots = workingHours.filter(workingHour => {
    return !busySlots.some(busySlot => {
      const busyStart = new Date(busySlot.start);
      const busyEnd = new Date(busySlot.end);
      const workingStart = new Date(workingHour.start);
      const workingEnd = new Date(workingHour.end);

      return (
        (busyStart >= workingStart && busyStart < workingEnd) ||
        (busyEnd > workingStart && busyEnd <= workingEnd)
      );
    });
  });

  console.log('Free Slots:', freeSlots);
}

