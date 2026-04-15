const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Deal = require('../models/Deal');
const Contact = require('../models/Contact');
const Event = require('../models/Event');
const Matter = require('../models/Matter');
const Activity = require('../models/Activity');
const Document = require('../models/Document');
const Communication = require('../models/Communication');
const MessageTemplate = require('../models/MessageTemplate');

const STAGES = ['Lead', 'Contacted', 'Qualified', 'Won', 'Lost'];
const EVENT_TYPES = ['Call', 'Meeting', 'Email', 'Follow-up', 'Task'];
const MATTER_STATUS = ['Open', 'In Progress', 'Review', 'Closed'];
const MATTER_PRIORITY = ['Low', 'Medium', 'High'];
const COMM_TYPES = ['Email', 'SMS', 'WhatsApp', 'Call'];
const COMM_STATUS = ['Sent', 'Delivered', 'Pending'];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function ensureSeedForWorkspace(workspace, actor) {
  const workspaceId = workspace._id;
  const memberIds = (workspace.members || [])
    .map((m) => m?.user?._id || m?.user || null)
    .filter(Boolean);
  const assigneeId = memberIds[0] || actor._id;

  const [contactCount, dealCount, eventCount, matterCount, docCount, tmplCount, commCount] = await Promise.all([
    Contact.countDocuments({ workspace: workspaceId }),
    Deal.countDocuments({ workspace: workspaceId }),
    Event.countDocuments({ workspace: workspaceId }),
    Matter.countDocuments({ workspace: workspaceId }),
    Document.countDocuments({ workspaceId }),
    MessageTemplate.countDocuments({ workspaceId }),
    Communication.countDocuments({ workspaceId }),
  ]);

  if (contactCount < 6) {
    const batch = [];
    for (let i = contactCount; i < 6; i += 1) {
      batch.push({
        workspace: workspaceId,
        owner: actor._id,
        name: `Demo Contact ${i + 1}`,
        company: `Company ${i + 1}`,
        email: `demo.contact.${i + 1}@example.com`,
        phone: `+1-555-010${i}`,
        tags: ['demo', i % 2 === 0 ? 'hot' : 'new'],
      });
    }
    await Contact.insertMany(batch);
  }

  const contacts = await Contact.find({ workspace: workspaceId }).limit(10);

  if (dealCount < 10) {
    const batch = [];
    for (let i = dealCount; i < 10; i += 1) {
      const stage = STAGES[i % STAGES.length];
      const contact = contacts[i % Math.max(contacts.length, 1)];
      batch.push({
        workspace: workspaceId,
        title: `Demo Deal ${i + 1}`,
        description: `Seeded deal for ${workspace.name} (${stage}).`,
        amount: 1000 + i * 750,
        stage,
        assignee: assigneeId,
        contact: contact
          ? {
              name: contact.name,
              email: contact.email,
              phone: contact.phone,
            }
          : undefined,
        notes: [
          { content: 'Initial outreach completed.' },
          { content: 'Follow-up scheduled with stakeholder.' },
        ],
      });
    }
    await Deal.insertMany(batch);
  }

  const deals = await Deal.find({ workspace: workspaceId }).limit(10);
  const linkedDeal = deals[0];
  const linkedContact = contacts[0];

  if (eventCount < 6) {
    const batch = [];
    for (let i = eventCount; i < 6; i += 1) {
      batch.push({
        workspace: workspaceId,
        createdBy: actor._id,
        assignee: assigneeId,
        title: `Demo Event ${i + 1}`,
        type: EVENT_TYPES[i % EVENT_TYPES.length],
        status: 'Scheduled',
        startAt: daysFromNow(i + 1),
        endAt: daysFromNow(i + 1.25),
        deal: linkedDeal?._id,
        contact: linkedContact?._id,
        notes: 'Auto-seeded for QA walkthrough.',
      });
    }
    await Event.insertMany(batch);
  }

  if (matterCount < 6) {
    const batch = [];
    for (let i = matterCount; i < 6; i += 1) {
      batch.push({
        workspace: workspaceId,
        createdBy: actor._id,
        assignee: assigneeId,
        contact: linkedContact?._id,
        title: `Demo Matter ${i + 1}`,
        status: MATTER_STATUS[i % MATTER_STATUS.length],
        priority: MATTER_PRIORITY[i % MATTER_PRIORITY.length],
        dueAt: daysFromNow(i + 3),
        description: 'Seeded matter for testing list/edit/delete flows.',
        tags: ['demo', 'qa'],
      });
    }
    await Matter.insertMany(batch);
  }

  if (docCount < 5) {
    const batch = [];
    for (let i = docCount; i < 5; i += 1) {
      batch.push({
        name: `Demo File ${i + 1}.pdf`,
        originalName: `demo-file-${i + 1}.pdf`,
        path: `uploads/demo-file-${i + 1}.pdf`,
        size: 15000 + i * 2000,
        mimeType: 'application/pdf',
        workspaceId,
        contactId: linkedContact?._id,
        dealId: linkedDeal?._id,
        tags: ['demo', 'docs'],
        folder: i % 2 === 0 ? 'Root' : 'Contracts',
        uploadedBy: actor._id,
      });
    }
    await Document.insertMany(batch);
  }

  if (tmplCount < 4) {
    const batch = [];
    for (let i = tmplCount; i < 4; i += 1) {
      const type = i % 3 === 0 ? 'Email' : i % 3 === 1 ? 'SMS' : 'WhatsApp';
      batch.push({
        name: `Demo Template ${i + 1}`,
        subject: type === 'Email' ? `Follow-up ${i + 1}` : '',
        content: `Hi {{name}}, this is a seeded ${type} template #${i + 1}.`,
        type,
        workspaceId,
        createdBy: actor._id,
      });
    }
    await MessageTemplate.insertMany(batch);
  }

  if (commCount < 8) {
    const batch = [];
    for (let i = commCount; i < 8; i += 1) {
      batch.push({
        type: COMM_TYPES[i % COMM_TYPES.length],
        direction: i % 2 === 0 ? 'Outbound' : 'Inbound',
        subject: `Demo Communication ${i + 1}`,
        content: `Seeded communication log ${i + 1} for QA checks.`,
        status: randomFrom(COMM_STATUS),
        workspaceId,
        contactId: linkedContact?._id,
        dealId: linkedDeal?._id,
        sentBy: actor._id,
      });
    }
    await Communication.insertMany(batch);
  }

  const activityCount = await Activity.countDocuments({ workspace: workspaceId });
  if (activityCount < 8) {
    const batch = [];
    for (let i = activityCount; i < 8; i += 1) {
      batch.push({
        workspace: workspaceId,
        actor: actor._id,
        type: randomFrom(['DEAL', 'CONTACT', 'EVENT', 'MATTER']),
        action: i % 2 === 0 ? 'CREATED' : 'UPDATED',
        entityType: 'Seed',
        entityId: linkedDeal?._id,
        message: `Seeded activity ${i + 1} for workspace ${workspace.name}.`,
      });
    }
    await Activity.insertMany(batch);
  }
}

async function run() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm';
  await mongoose.connect(mongoUri);

  const preferredEmail = process.env.SEED_EMAIL || 'admin@gmail.com';
  const actor =
    (await User.findOne({ email: preferredEmail })) ||
    (await User.findOne({})) ||
    (await User.create({
      name: 'Admin',
      email: preferredEmail,
      password: process.env.SEED_PASSWORD || 'Admin@123',
    }));

  const workspaces = await Workspace.find({ 'members.user': actor._id });

  if (workspaces.length === 0) {
    const created = await Workspace.create({
      name: 'Demo Workspace',
      owner: actor._id,
      members: [{ user: actor._id, role: 'Super Admin' }],
    });
    actor.workspaces = [...new Set([...(actor.workspaces || []).map(String), String(created._id)])];
    await actor.save();
    workspaces.push(created);
  }

  for (const workspace of workspaces) {
    await ensureSeedForWorkspace(workspace, actor);
    console.log(`Seeded workspace: ${workspace.name} (${workspace._id})`);
  }

  console.log(`Done. Seeded ${workspaces.length} workspace(s) for ${actor.email}.`);
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('Seed failed:', err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});

