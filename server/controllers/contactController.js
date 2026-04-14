const Contact = require('../models/Contact');
const Workspace = require('../models/Workspace');
const { logActivity } = require('../utils/activityLogger');

async function assertWorkspaceMember(workspaceId, userId) {
    const workspace = await Workspace.findById(workspaceId).select('members');
    if (!workspace) return { ok: false, status: 404, message: 'Workspace not found' };
    const isMember = workspace.members.some((m) => String(m) === String(userId));
    if (!isMember) return { ok: false, status: 403, message: 'Access denied for this workspace' };
    return { ok: true };
}

exports.listContacts = async (req, res) => {
    try {
        const { workspaceId } = req.query;
        if (!workspaceId) return res.status(400).json({ message: 'workspaceId is required' });

        const access = await assertWorkspaceMember(workspaceId, req.user.id);
        if (!access.ok) return res.status(access.status).json({ message: access.message });

        const contacts = await Contact.find({ workspace: workspaceId }).sort({ updatedAt: -1 });
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createContact = async (req, res) => {
    try {
        const { workspaceId, name, email, phone, company, tags } = req.body;
        if (!workspaceId) return res.status(400).json({ message: 'workspaceId is required' });
        if (!name) return res.status(400).json({ message: 'name is required' });

        const access = await assertWorkspaceMember(workspaceId, req.user.id);
        if (!access.ok) return res.status(access.status).json({ message: access.message });

        const contact = await Contact.create({
            workspace: workspaceId,
            owner: req.user.id,
            name,
            email,
            phone,
            company,
            tags: Array.isArray(tags) ? tags : [],
        });

        await logActivity({
            workspace: workspaceId,
            actor: req.user.id,
            type: 'CONTACT',
            action: 'CREATED',
            entityType: 'Contact',
            entityId: contact._id,
            message: `Created contact “${contact.name}”`,
        });

        res.status(201).json(contact);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) return res.status(404).json({ message: 'Contact not found' });

        const access = await assertWorkspaceMember(contact.workspace, req.user.id);
        if (!access.ok) return res.status(access.status).json({ message: access.message });

        Object.assign(contact, req.body);
        await contact.save();

        await logActivity({
            workspace: contact.workspace,
            actor: req.user.id,
            type: 'CONTACT',
            action: 'UPDATED',
            entityType: 'Contact',
            entityId: contact._id,
            message: `Updated contact “${contact.name}”`,
        });

        res.json(contact);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) return res.status(404).json({ message: 'Contact not found' });

        const access = await assertWorkspaceMember(contact.workspace, req.user.id);
        if (!access.ok) return res.status(access.status).json({ message: access.message });

        await Contact.findByIdAndDelete(contact._id);

        await logActivity({
            workspace: contact.workspace,
            actor: req.user.id,
            type: 'CONTACT',
            action: 'DELETED',
            entityType: 'Contact',
            entityId: contact._id,
            message: `Deleted contact “${contact.name}”`,
        });

        res.json({ message: 'Contact deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

