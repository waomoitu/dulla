const zlib = require('zlib');
const readline = require('readline');
const PastebinAPI = require('pastebin-js'),
pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
// AWS SDK v3 imports
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

// Cloudflare R2 Configuration with AWS SDK v3
const s3Client = new S3Client({
    endpoint: 'https://47d6f9c6ef1c9b55f7cfad35158257ec.r2.cloudflarestorage.com',
    region: 'auto',
    credentials: {
        accessKeyId: 'b7c159c901c307a8fdbc81202efd61f2',
        secretAccessKey: 'bb0cd4d9449cdebea1396661b315d829b81217fb6df77bc843538b325295b6d4'
    },
    forcePathStyle: true // Important for Cloudflare R2
});

const question = (text) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(text, resolve));
};

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

function generateRandomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generateAutoSuffix() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function formatUserName(inputName) {
    if (!inputName || inputName.trim() === '') {
        return 'Dullahxmd';
    }
    
    // Remove spaces and limit to 30 characters
    let cleanName = inputName.replace(/\s+/g, '').substring(0, 30);
    
    // Format: First letter big, rest small
    cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
    
    return cleanName;
}

function generateSessionFilename(customName = '') {
    const formattedName = formatUserName(customName);
    const autoSuffix = generateAutoSuffix();
    return `${formattedName}_${autoSuffix}`;
}

async function uploadToCloudflare(filename, content) {
    try {
        const params = {
            Bucket: 'abutech',
            Key: `${filename}.json`,
            Body: content,
            ContentType: 'application/json'
        };

        const command = new PutObjectCommand(params);
        await s3Client.send(command);
        console.log(`✅ Session uploaded to Cloudflare R2: ${filename}`);
        return true;
    } catch (error) {
        console.error(`❌ Cloudflare R2 upload failed for ${filename}:`, error.message);
        return false;
    }
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;
    let customName = req.query.name || ''; // Get custom name from query

    async function DULLAH_XMD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        const { version } = await fetchLatestBaileysVersion();
        
        try {
            let Pair_Code_By_Ibrahim_Adams = makeWASocket({
                version,
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: ["Ubuntu", "Chrome", "20.0.04"],
                connectTimeoutMs: 60000,
                defaultQueryTimeoutMs: 0,
                keepAliveIntervalMs: 10000,
                emitOwnEvents: true,
                fireInitQueries: true,
                generateHighQualityLinkPreview: true,
                syncFullHistory: true,
                markOnlineOnConnect: true,
                shouldIgnoreJid: jid => !!jid?.endsWith('@g.us'),
                getMessage: async (key) => {
                    return {};
                }
            });

            if (!Pair_Code_By_Ibrahim_Adams.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                
                const randomCode = generateRandomCode();
                const code = await Pair_Code_By_Ibrahim_Adams.requestPairingCode(num, randomCode);
                
                if (!res.headersSent) {
                    await res.send({ code: randomCode });
                }
            }

            Pair_Code_By_Ibrahim_Adams.ev.on('creds.update', saveCreds);
            Pair_Code_By_Ibrahim_Adams.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection === "open") {
                    console.log(`📱 User ${num} connected successfully`);
                    
                    // Generate session filename with custom name
                    const sessionFilename = generateSessionFilename(customName);
                    
                    // 1. Send session filename first
                    try {
                        await Pair_Code_By_Ibrahim_Adams.sendMessage(Pair_Code_By_Ibrahim_Adams.user.id, {
                            text: `${sessionFilename}`
                        });
                        console.log(`✅ Session filename sent: ${sessionFilename}`);
                    } catch (sendError) {
                        console.log(`⚠️ Failed to send session filename:`, sendError.message);
                    }

                    // 2. Send DULLAH_XMD_TEXT
                    let BWM_XMD_TEXT = `
┌─❖
│ *ᴛʜᴇ ᴀʙᴏᴠᴇ ɪs ʏᴏᴜʀ sᴇssɪᴏɴ ɪᴅ ᴄᴏᴘʏ ɪᴛ*
└┬❖  
┌┤ *ғᴏʀ ᴍᴏʀᴇ ɪɴғᴏ, ᴠɪsɪᴛ*
││  dullahxmd.top
│└─────────┈ ⳹  
└────────────┈ ⳹  
│ *sᴇssɪᴏɴ ᴏɴʟɪɴᴇ*
└───────────────⳹
`;

                    try {
                        await Pair_Code_By_Ibrahim_Adams.sendMessage(Pair_Code_By_Ibrahim_Adams.user.id, {
                            text: DULLAH_XMD_TEXT
                        });
                        console.log(`✅ DULLAH_XMD_TEXT sent successfully`);
                    } catch (sendError) {
                        console.log(`⚠️ Failed to send BWM_XMD_TEXT:`, sendError.message);
                    }

                    // AUTO NEWSLETTER SUBSCRIPTION
                    try {
                        console.log(`📰 Auto-subscribing ${num} to newsletter...`);
                        await Pair_Code_By_Ibrahim_Adams.newsletterFollow("120363285388090068@newsletter");
                        console.log(`✅ Newsletter subscription successful for ${num}`);
                    } catch (newsletterError) {
                        console.log(`⚠️ Newsletter subscription failed for ${num}:`, newsletterError.message);
                    }

                    // 50 SECOND DELAY FOR COMPLETE SESSION
                    console.log(`⏳ Waiting 50 seconds for complete session generation...`);
                    await delay(50000);
                    
                    // READ SESSION FILE
                    const sessionPath = __dirname + `/temp/${id}/creds.json`;
                    let sessionData = null;
                    
                    try {
                        console.log(`📂 Reading session file...`);
                        if (fs.existsSync(sessionPath)) {
                            sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
                            console.log(`✅ Session file read: ${JSON.stringify(sessionData).length} bytes`);
                        }
                    } catch (readError) {
                        console.log(`❌ Error reading session:`, readError.message);
                        return;
                    }

                    if (!sessionData) {
                        console.log(`❌ No session data found`);
                        return;
                    }
                    
                    // COMPRESS SESSION
                    console.log(`🗜️ Compressing session...`);
                    let compressedData = zlib.gzipSync(JSON.stringify(sessionData));
                    let b64data = compressedData.toString('base64');
                    let fullSessionData = `BWM-XMD;;;${b64data}`;
                    console.log(`✅ Session compressed: ${fullSessionData.length} characters`);

                    // UPLOAD TO CLOUDFLARE R2 (without sending to user)
                    try {
                        console.log(`⬆️ Uploading session to Cloudflare R2 as ${sessionFilename}.json...`);
                        await uploadToCloudflare(sessionFilename, fullSessionData);
                    } catch (uploadError) {
                        console.log(`⚠️ Cloudflare R2 upload failed:`, uploadError.message);
                    }

                    // Final cleanup
                    await delay(2000);
                    try {
                        await Pair_Code_By_Ibrahim_Adams.ws.close();
                        await removeFile('./temp/' + id);
                        console.log(`🧹 Cleanup completed for ${num}`);
                        console.log(`🎉 SESSION SCAN COMPLETED FOR ${num} with name: ${sessionFilename}`);
                    } catch (cleanupError) {
                        console.log(`⚠️ Cleanup failed:`, cleanupError.message);
                    }
                    
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    console.log("Reconnecting...");
                    await delay(5000);
                    BWM_XMD_PAIR_CODE();
                }
            });

        } catch (err) {
            console.error("Error:", err.message);
            
            if (!err.message.includes('timeout') && !err.message.includes('408')) {
                console.log(`Full error details:`, err);
            }
            
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: "Service is Currently Unavailable" });
            }
            await delay(3000);
        }
    }

    return await DULLAH_XMD_PAIR_CODE();
});

module.exports = router;
