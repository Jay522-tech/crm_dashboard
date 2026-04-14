const nodemailer = require('nodemailer');
const Event = require('../models/Event');

let reminderTimer = null;
let warnedMissingConfig = false;

function getTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        if (!warnedMissingConfig) {
            warnedMissingConfig = true;
            console.warn('⚠️ Email reminder disabled: SMTP_HOST/SMTP_USER/SMTP_PASS missing');
        }
        return null;
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });
}

async function sendDueEventReminders() {
    const transporter = getTransporter();
    if (!transporter) return;

    const now = new Date();

    const dueEvents = await Event.find({
        status: 'Scheduled',
        reminderSentAt: null,
        startAt: { $lte: now },
    })
        .populate('assignee', 'name email')
        .populate('createdBy', 'name email')
        .populate('deal', 'title')
        .limit(50);

    for (const event of dueEvents) {
        const recipient = event.assignee?.email || event.createdBy?.email;
        if (!recipient) {
            event.reminderSentAt = new Date();
            await event.save();
            continue;
        }

        const who = event.assignee?.name || event.createdBy?.name || 'there';
        const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

        try {
            await transporter.sendMail({
                from: fromAddress,
                to: recipient,
                subject: `Reminder: ${event.title}`,
                text: [
                    `Hi ${who},`,
                    '',
                    `This is a reminder for your scheduled event: ${event.title}`,
                    `Type: ${event.type}`,
                    `Start: ${event.startAt.toLocaleString()}`,
                    event.deal?.title ? `Deal: ${event.deal.title}` : null,
                    '',
                    'CRM Dashboard Reminder Service',
                ].filter(Boolean).join('\n'),
            });

            event.reminderSentAt = new Date();
            await event.save();
        } catch (error) {
            console.error(`❌ Failed to send reminder for event ${event._id}:`, error.message);
        }
    }
}

function startEventReminderService() {
    if (reminderTimer) return;

    // Check every 30 seconds; send for events whose time has arrived.
    reminderTimer = setInterval(() => {
        sendDueEventReminders().catch((error) => {
            console.error('❌ Event reminder job failed:', error.message);
        });
    }, 30000);

    console.log('⏰ Event reminder service started');
}

module.exports = { startEventReminderService };

