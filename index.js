const express = require('express');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const app = express();
const PORT = 3000;
const CLIENT_ID = '767562230559-rjuctftbomrtakmn0s7k3mff6pqg1ohp.apps.googleusercontent.com'; // Replace with your Client ID
const CLIENT_SECRET = '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'; // Replace with your Client Secret
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';
const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
const  SCOPES =  [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar'
];

app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    res.redirect('/getSlots');
    //res.send('Authorization successful! You can now make API requests.');
  } catch (error) {
    console.error('Error exchanging code for tokens:', error.message);
    res.status(500).send('Error exchanging code for tokens');
  }
});

app.get('/getSlots', async (req, res) => {
  try {
    // Check if tokens are available, if not redirect to /auth
    if (!oAuth2Client.credentials) {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      });
      return res.redirect(authUrl);
    }
    // Tokens are available, proceed with /getSlots logic
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    const calendarId = 'jwrtube@gmail.com'; // Replace with your calendar ID
    const startTime = '2024-02-15T08:00:00.000Z';
    const endTime = '2024-02-16T17:00:00.000Z';
    const response = await calendar.freebusy.query({
      resource: {
        timeMin: startTime,
        timeMax: endTime,
        items: [{ id: calendarId }],
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching calendar events:', error.message);
    res.status(500).send('Error fetching calendar events');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

