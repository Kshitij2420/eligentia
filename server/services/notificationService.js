const Notification = require('../models/Notification');

async function createNotification({ userId, title, message, type = 'general', relatedId = null }) {
  try {
    return await Notification.create({ userId, title, message, type, relatedId });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
    return null;
  }
}

async function notifyNewJobToStudents(studentUserIds, drive) {
  const notifications = studentUserIds.map((userId) => ({
    userId,
    title: 'New Placement Opportunity',
    message: `${drive.companyName || 'A company'} has posted a "${drive.title}" position. Check your eligibility and match now.`,
    type: 'new_job',
    relatedId: drive._id,
  }));
  if (notifications.length === 0) return [];
  return Notification.insertMany(notifications);
}

async function notifyStatusChange(userId, drive, newStatus) {
  return createNotification({
    userId,
    title: 'Application Status Updated',
    message: `Your application for "${drive.title}" is now: ${newStatus}.`,
    type: 'status_update',
    relatedId: drive._id,
  });
}

module.exports = { createNotification, notifyNewJobToStudents, notifyStatusChange };
