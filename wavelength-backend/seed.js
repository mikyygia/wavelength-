import db from './db/database.js';
import { v4 as uuid } from 'uuid';

// ─── UC Irvine coordinates ───
const BASE_LAT = 33.6461;
const BASE_LNG = -117.8427;

// ─── Demo Signals ───
const signals = [
    { mood: 'happy', note: 'the sunset from aldrich park rn is unreal 🌅', lat: BASE_LAT + 0.001, lng: BASE_LNG + 0.001 },
    { mood: 'anxious', note: 'midterms are killing me. anyone else feel like theyre drowning?', lat: BASE_LAT - 0.001, lng: BASE_LNG + 0.002 },
    { mood: 'calm', note: 'sitting in the science library. rain outside. peace.', lat: BASE_LAT + 0.002, lng: BASE_LNG - 0.001, song_url: 'https://open.spotify.com/track/3xKsf9qdS1CyvXSMEid6g8' },
    { mood: 'lonely', note: 'transferred here last quarter. still havent made a single friend.', lat: BASE_LAT - 0.002, lng: BASE_LNG - 0.002 },
    { mood: 'energized', note: 'just aced my chem final LET\'S GOOO', lat: BASE_LAT + 0.0015, lng: BASE_LNG + 0.003 },
    { mood: 'grateful', note: 'a stranger held the door for me today and said "you got this". needed that.', lat: BASE_LAT - 0.0005, lng: BASE_LNG + 0.0015 },
    { mood: 'sad', note: 'called home today. mom sounded tired. feeling far away.', lat: BASE_LAT + 0.003, lng: BASE_LNG - 0.002 },
    { mood: 'overwhelmed', note: '3 papers. 2 exams. 1 brain cell left.', lat: BASE_LAT - 0.003, lng: BASE_LNG + 0.001 },
    { mood: 'calm', note: 'found a cat behind engineering. we just vibed for 20 mins.', lat: BASE_LAT + 0.0008, lng: BASE_LNG - 0.003 },
    { mood: 'happy', note: 'free boba at the student center today 🧋', lat: BASE_LAT - 0.001, lng: BASE_LNG - 0.001 },
];

// ─── Demo Static Reports ───
const staticReports = [
    {
        type: 'harassment', severity: 'high',
        title: 'aggressive individual near engineering building',
        description: 'person was shouting at students near the main entrance around 9pm. campus security was called.',
        lat: BASE_LAT + 0.001, lng: BASE_LNG + 0.002,
        location_label: 'engineering building entrance',
        status: 'active', source: 'community',
        confirmations: 12, affected_count: 4,
    },
    {
        type: 'suspicious', severity: 'medium',
        title: 'unknown vehicle parked 3hrs near dorms',
        description: 'white van with no plates has been sitting in the residence hall lot since 6pm. no one has gotten in or out.',
        lat: BASE_LAT - 0.002, lng: BASE_LNG + 0.001,
        location_label: 'residence hall parking lot',
        status: 'monitoring', source: 'community',
        confirmations: 3, affected_count: 0,
    },
    {
        type: 'threat', severity: 'critical',
        title: 'suspicious package reported near admin building',
        description: 'unattended backpack found outside the admin building. campus police investigating.',
        lat: BASE_LAT + 0.002, lng: BASE_LNG + 0.001,
        location_label: 'administration building',
        status: 'resolved', source: 'alert',
        confirmations: 24, affected_count: 50,
        resolution_note: 'campus security cleared — false alarm. bag belonged to a student.',
    },
    {
        type: 'crowd', severity: 'low',
        title: 'large unsanctioned gathering at main quad',
        description: 'about 200 people gathering. seems peaceful but blocking walkways.',
        lat: BASE_LAT - 0.0005, lng: BASE_LNG - 0.001,
        location_label: 'aldrich park',
        status: 'active', source: 'community',
        confirmations: 7, affected_count: 200,
    },
    {
        type: 'infrastructure', severity: 'medium',
        title: 'broken streetlight on ring road — very dark stretch',
        description: 'the area between lot 16 and the ARC is completely dark. dangerous for night walkers.',
        lat: BASE_LAT + 0.003, lng: BASE_LNG - 0.001,
        location_label: 'ring road near ARC',
        status: 'active', source: 'community',
        confirmations: 9, affected_count: 0,
    },
    {
        type: 'suspicious', severity: 'high',
        title: 'person following students near parking structure',
        description: 'multiple reports of someone in dark clothing following people walking to their cars after 10pm.',
        lat: BASE_LAT - 0.001, lng: BASE_LNG + 0.003,
        location_label: 'parking structure 3',
        status: 'active', source: 'community',
        confirmations: 6, affected_count: 3,
    },
];

// ─── Seed ───
function seed() {
    console.log('🌱 seeding wavelength database...\n');

    // Clear existing data
    db.prepare('DELETE FROM replies').run();
    db.prepare('DELETE FROM signals').run();
    db.prepare('DELETE FROM static_reports').run();

    // Seed signals (staggered timestamps for realistic opacity decay)
    signals.forEach((s, i) => {
        const hoursAgo = i * 2.5; // spread across 0-25 hours
        const created = new Date(Date.now() - hoursAgo * 3600000);
        const expires = new Date(created.getTime() + 24 * 3600000);

        const id = uuid();
        db.prepare(`
      INSERT INTO signals (id, lat, lng, mood, note, song_url, reaction_felt, reaction_hug, reaction_heart, created_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
            id, s.lat, s.lng, s.mood, s.note, s.song_url || null,
            Math.floor(Math.random() * 20), Math.floor(Math.random() * 15), Math.floor(Math.random() * 25),
            created.toISOString(), expires.toISOString()
        );
        console.log(`  📍 signal: ${s.mood} — "${s.note.slice(0, 40)}..."`);
    });

    // Seed static reports (staggered)
    staticReports.forEach((r, i) => {
        const hoursAgo = i * 3;
        const created = new Date(Date.now() - hoursAgo * 3600000);

        const id = uuid();
        db.prepare(`
      INSERT INTO static_reports (id, type, severity, title, description, lat, lng, location_label, status, resolved_at, resolution_note, affected_count, confirmations, start_date, created_at, source, news_links)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]')
    `).run(
            id, r.type, r.severity, r.title, r.description || null,
            r.lat, r.lng, r.location_label || null,
            r.status, r.status === 'resolved' ? created.toISOString() : null,
            r.resolution_note || null, r.affected_count || 0, r.confirmations || 0,
            created.toISOString(), created.toISOString(), r.source
        );
        console.log(`  ⚡ static: [${r.severity}] ${r.title.slice(0, 50)}...`);
    });

    // Seed some replies
    const signalIds = db.prepare('SELECT id FROM signals LIMIT 3').all();
    const sampleReplies = [
        'you\'re not alone in this 💛',
        'felt that. hang in there.',
        'sending you a virtual hug 🫂',
        'this campus needs more of this energy',
        'literally me rn',
    ];

    signalIds.forEach(({ id }) => {
        const numReplies = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < numReplies; j++) {
            const replyId = uuid();
            const text = sampleReplies[Math.floor(Math.random() * sampleReplies.length)];
            const replyTime = new Date(Date.now() - Math.random() * 12 * 3600000);
            db.prepare(`
        INSERT INTO replies (id, signal_id, text, created_at) VALUES (?, ?, ?, ?)
      `).run(replyId, id, text, replyTime.toISOString());
        }
    });

    console.log('\n✅ seed complete!\n');

    // Summary
    const signalCount = db.prepare('SELECT COUNT(*) as c FROM signals').get().c;
    const staticCount = db.prepare('SELECT COUNT(*) as c FROM static_reports').get().c;
    const replyCount = db.prepare('SELECT COUNT(*) as c FROM replies').get().c;
    console.log(`  ${signalCount} signals`);
    console.log(`  ${staticCount} static reports`);
    console.log(`  ${replyCount} replies`);
}

seed();
