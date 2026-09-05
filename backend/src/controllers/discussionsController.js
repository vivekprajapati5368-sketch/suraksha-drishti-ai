const db = require('../database/db');

function getDiscussions(req, res) {
  try {
    const { channel = 'all', q = '' } = req.query;

    let query = 'SELECT * FROM discussions WHERE 1=1';
    const params = [];

    if (channel && channel !== 'all') {
      query += ' AND channel = ?';
      params.push(channel);
    }

    if (q && q.trim() !== '') {
      query += ' AND (title LIKE ? OR content LIKE ? OR author_name LIKE ? OR agency LIKE ? OR tags LIKE ?)';
      const searchPattern = `%${q.trim()}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY pinned DESC, created_at DESC';

    const rows = db.prepare(query).all(...params);

    const formatted = rows.map(r => {
      let replies = [];
      try {
        replies = JSON.parse(r.replies_json || '[]');
      } catch {
        replies = [];
      }
      return {
        ...r,
        pinned: Boolean(r.pinned),
        replies
      };
    });

    res.json({
      success: true,
      data: formatted,
      count: formatted.length
    });
  } catch (err) {
    console.error('Error fetching discussions:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch discussions: ' + err.message });
  }
}

function createDiscussion(req, res) {
  try {
    const {
      title,
      content,
      channel = 'general',
      author_name = 'Crisis Responder',
      author_role = 'Field Coordinator',
      agency = 'NDMA Taskforce',
      priority = 'Medium',
      tags = ''
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const stmt = db.prepare(`
      INSERT INTO discussions (channel, title, content, author_name, author_role, agency, priority, tags, likes_count, pinned, replies_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, '[]')
    `);

    const result = stmt.run(channel, title, content, author_name, author_role, agency, priority, tags);
    const newId = result.lastInsertRowid;

    const created = db.prepare('SELECT * FROM discussions WHERE id = ?').get(newId);

    res.status(201).json({
      success: true,
      message: 'Discussion created successfully',
      data: {
        ...created,
        pinned: false,
        replies: []
      }
    });
  } catch (err) {
    console.error('Error creating discussion:', err);
    res.status(500).json({ success: false, message: 'Failed to create discussion: ' + err.message });
  }
}

function addReply(req, res) {
  try {
    const { id } = req.params;
    const {
      content,
      author_name = 'Responder',
      author_role = 'Officer',
      agency = 'Emergency Response'
    } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Reply content cannot be empty' });
    }

    const row = db.prepare('SELECT * FROM discussions WHERE id = ?').get(id);
    if (!row) {
      return res.status(404).json({ success: false, message: 'Discussion thread not found' });
    }

    let replies = [];
    try {
      replies = JSON.parse(row.replies_json || '[]');
    } catch {
      replies = [];
    }

    const newReply = {
      id: 'rep_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      author_name,
      author_role,
      agency,
      content: content.trim(),
      created_at: new Date().toISOString()
    };

    replies.push(newReply);

    db.prepare('UPDATE discussions SET replies_json = ? WHERE id = ?').run(JSON.stringify(replies), id);

    res.json({
      success: true,
      message: 'Reply added successfully',
      data: newReply,
      allReplies: replies
    });
  } catch (err) {
    console.error('Error adding reply:', err);
    res.status(500).json({ success: false, message: 'Failed to add reply: ' + err.message });
  }
}

function likeDiscussion(req, res) {
  try {
    const { id } = req.params;
    const row = db.prepare('SELECT likes_count FROM discussions WHERE id = ?').get(id);
    if (!row) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    const newCount = (row.likes_count || 0) + 1;
    db.prepare('UPDATE discussions SET likes_count = ? WHERE id = ?').run(newCount, id);

    res.json({
      success: true,
      likes_count: newCount
    });
  } catch (err) {
    console.error('Error liking discussion:', err);
    res.status(500).json({ success: false, message: 'Failed to like discussion: ' + err.message });
  }
}

function togglePin(req, res) {
  try {
    const { id } = req.params;
    const row = db.prepare('SELECT pinned FROM discussions WHERE id = ?').get(id);
    if (!row) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    const newPinned = row.pinned ? 0 : 1;
    db.prepare('UPDATE discussions SET pinned = ? WHERE id = ?').run(newPinned, id);

    res.json({
      success: true,
      pinned: Boolean(newPinned)
    });
  } catch (err) {
    console.error('Error toggling pin:', err);
    res.status(500).json({ success: false, message: 'Failed to toggle pin: ' + err.message });
  }
}

module.exports = {
  getDiscussions,
  createDiscussion,
  addReply,
  likeDiscussion,
  togglePin
};
