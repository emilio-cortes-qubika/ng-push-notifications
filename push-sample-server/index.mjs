import express, { json } from 'express';
import { authenticateAdmin } from './auth.mjs';
import { configDotenv } from 'dotenv';
import corsMiddleware from 'cors';

import webPush from 'web-push';
import { deleteSubscription, fetchSubscriptions, initDb, insertSubscription } from './db.mjs';
const { setVapidDetails, sendNotification } = webPush;

// read dotenv file
configDotenv();

// Initialize the database
initDb();

// Initialize the web-push library with our VAPID keys
const vapidKeys = {
  publicKey: process.env.PUBLIC_VAPID_KEY,
  privateKey: process.env.PRIVATE_VAPID_KEY,
};

setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  vapidKeys.publicKey,
  vapidKeys.privateKey
);


// Initialize the express app
const app = express();
const port = process.env.PORT || 3000;
app.use(corsMiddleware());
app.use(json());

// Subscription endpoint
app.post('/subscriptions', async (req, res) => {
  const subscription = req.body;

  await insertSubscription(subscription);

  res.status(201).send({ success: true });
});

// Send notification endpoint
app.post('/send', authenticateAdmin, async (req, res) => {
  const notificationPayload = {
    notification: req.body,
  };

  const subscriptions = await fetchSubscriptions();

  const processNotification = async (subscription) => {
    try {
      await sendNotification(subscription.data, JSON.stringify(notificationPayload));
      return { message: 'Notification sent successfully.', subscription };
    } catch (err) {
      if (err.statusCode === 410) {
        // Subscription has been removed
        await deleteSubscription(subscription.id);
        return { message: 'Subscription has been removed.', subscription };
      }
      console.error('Error sending notification: ', err);
      return { message: 'Error sending notification.', subscription };
    }
  };

  const promises = subscriptions.map(processNotification);

  await Promise.all(promises)
    .then((logs) => res.status(200).json({ notificationPayload, logs }))
    .catch(error => {
      console.error('Error while sending notifications: ', error);
      res.status(500).json({ notificationPayload, error });
    });
});

// Start the server
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});