const nodemailer = require('nodemailer');
const Matter = require('../models/Matter');

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
            console.warn('⚠️ Matter email reminder disabled: SMTP_HOST/SMTP_USER/SMTP_PASS missing');
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

async function sendDueMatterReminders() {
    const transporter = getTransporter();
    if (!transporter) return;

    const now = new Date();
    const dueMatters = await Matter.find({
        dueAt: { $lte: now },
        reminderSentAt: null,
        status: { $in: ['Open', 'In Progress', 'Review'] },
    })
        .populate('assignee', 'name email')
        .populate('createdBy', 'name email')
        .limit(50);

    for (const matter of dueMatters) {
        const recipient = matter.assignee?.email || matter.createdBy?.email;
        if (!recipient) {
            matter.reminderSentAt = new Date();
            await matter.save();
            continue;
        }

        const who = matter.assignee?.name || matter.createdBy?.name || 'there';
        const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

        try {
            await transporter.sendMail({
                from: fromAddress,
                to: recipient,
                subject: `Matter Due Reminder: ${matter.title}`,
                text: [
                    `Hi ${who},`,
                    '',
                    `Your matter is due: ${matter.title}`,
                    `Status: ${matter.status || 'Open'}`,
                    `Priority: ${matter.priority || 'Medium'}`,
                    `Due: ${matter.dueAt ? new Date(matter.dueAt).toLocaleString() : 'N/A'}`,
                    '',
                    'CRM Dashboard Reminder Service',
                ].join('\n'),
            });

            matter.reminderSentAt = new Date();
            await matter.save();
        } catch (error) {
            console.error(`❌ Failed to send matter reminder for ${matter._id}:`, error.message);
        }
    }
}

function startMatterReminderService() {
    if (reminderTimer) return;

    reminderTimer = setInterval(() => {
        sendDueMatterReminders().catch((error) => {
            console.error('❌ Matter reminder job failed:', error.message);
        });
    }, 30000);

    console.log('⏰ Matter reminder service started');
}

module.exports = { startMatterReminderService };

