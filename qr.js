const PastebinAPI = require('pastebin-js'),
pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const QRCode = require('qrcode');
const readline = require('readline');
const express = require('express');
const zlib = require('zlib');
const path = require('path');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
// AWS SDK v3 imports
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    Browsers,
    delay,
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
        return 'Bwmxmd';
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
            Bucket:  'abutech',
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
    let responseSent = false;
    let customName = req.query.name || ''; // Get custom name from query

    async function BWM_XMD_QR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        const { version } = await fetchLatestBaileysVersion();
        
        try {
            let Qr_Code_By_Ibrahim_Adams = makeWASocket({
                version,
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: ["Ubuntu", "Chrome", "20.0.04"],
                connectTimeoutMs: 60000,
                defaultQueryTimeoutMs: 0,
                keepAliveIntervalMs: 10000,
                emitOwnEvents: true,
                fireInitQueries: true,
                generateHighQualityLinkPreview: true,
                syncFullHistory: true,
                markOnlineOnConnect: true,
                getMessage: async (key) => {
                    return {};
                }
            });

            Qr_Code_By_Ibrahim_Adams.ev.on('creds.update', saveCreds);
            Qr_Code_By_Ibrahim_Adams.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect, qr } = s;
                
                if (qr && !responseSent) {
                    const qrImage = await QRCode.toDataURL(qr);
                    const htmlContent = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>BWM XMD - Advanced QR Scanner</title>
                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700&display=swap" rel="stylesheet">
                        <style>
                            :root {
                                --primary-blue: #0066ff;
                                --accent-cyan: #00d4ff;
                                --success-green: #00c851;
                                --warning-orange: #ff8800;
                                --error-red: #ff4444;
                                --dark-bg: #0a0a1a;
                                --card-bg: rgba(10, 20, 40, 0.9);
                                --border-glow: rgba(0, 102, 255, 0.3);
                                --text-primary: #ffffff;
                                --text-secondary: #a0a0a0;
                                --neon-purple: #9d4edd;
                                --electric-blue: #4cc9f0;
                            }
                            
                            * {
                                margin: 0;
                                padding: 0;
                                box-sizing: border-box;
                            }
                            
                            body {
                                font-family: 'Inter', sans-serif;
                                background: linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #16213e 100%);
                                min-height: 100vh;
                                color: var(--text-primary);
                                position: relative;
                                overflow-x: hidden;
                                padding: 20px 0;
                            }
                            
                            /* Enhanced Animated Background */
                            .animated-bg {
                                position: fixed;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                                z-index: -1;
                                background: 
                                    radial-gradient(circle at 15% 85%, rgba(0, 102, 255, 0.15) 0%, transparent 60%),
                                    radial-gradient(circle at 85% 15%, rgba(157, 78, 221, 0.12) 0%, transparent 60%),
                                    radial-gradient(circle at 50% 50%, rgba(76, 201, 240, 0.08) 0%, transparent 70%);
                                animation: bgPulse 12s ease-in-out infinite;
                            }

                            @keyframes bgPulse {
                                0%, 100% { opacity: 0.8; transform: scale(1) rotate(0deg); }
                                50% { opacity: 1; transform: scale(1.1) rotate(2deg); }
                            }

                            /* Enhanced Floating Orbs */
                            .floating-orb {
                                position: fixed;
                                border-radius: 50%;
                                background: linear-gradient(135deg, rgba(0, 102, 255, 0.2), rgba(76, 201, 240, 0.1));
                                animation: floatOrb 20s ease-in-out infinite;
                                backdrop-filter: blur(15px);
                                border: 1px solid rgba(255, 255, 255, 0.1);
                            }

                            .orb1 {
                                width: 250px;
                                height: 250px;
                                top: 5%;
                                left: 5%;
                                animation-delay: 0s;
                                background: linear-gradient(135deg, rgba(157, 78, 221, 0.25), rgba(0, 102, 255, 0.15));
                            }

                            .orb2 {
                                width: 180px;
                                height: 180px;
                                top: 65%;
                                right: 10%;
                                animation-delay: -7s;
                                background: linear-gradient(135deg, rgba(76, 201, 240, 0.2), rgba(0, 212, 255, 0.1));
                            }

                            .orb3 {
                                width: 120px;
                                height: 120px;
                                bottom: 15%;
                                left: 15%;
                                animation-delay: -14s;
                                background: linear-gradient(135deg, rgba(0, 200, 81, 0.15), rgba(0, 102, 255, 0.1));
                            }

                            @keyframes floatOrb {
                                0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
                                25% { transform: translate(40px, -40px) scale(1.15) rotate(90deg); }
                                50% { transform: translate(-30px, 30px) scale(0.85) rotate(180deg); }
                                75% { transform: translate(30px, 40px) scale(1.05) rotate(270deg); }
                            }

                            /* Main Container - Scrollable like pair HTML */
                            .page-container {
                                display: flex;
                                justify-content: center;
                                align-items: flex-start;
                                min-height: 100vh;
                                padding: 40px 20px;
                                position: relative;
                                z-index: 10;
                            }

                            .main-container {
                                width: 100%;
                                max-width: 550px;
                                padding: 45px;
                                background: var(--card-bg);
                                border-radius: 25px;
                                border: 2px solid rgba(76, 201, 240, 0.2);
                                box-shadow: 
                                    0 25px 50px rgba(0, 0, 0, 0.4),
                                    0 0 40px rgba(76, 201, 240, 0.15),
                                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
                                backdrop-filter: blur(25px);
                                position: relative;
                                margin: 0 auto;
                                text-align: center;
                            }

                            .main-container::before {
                                content: '';
                                position: absolute;
                                top: 0;
                                left: 0;
                                right: 0;
                                bottom: 0;
                                border-radius: 25px;
                                padding: 2px;
                                background: linear-gradient(135deg, var(--electric-blue), var(--neon-purple), var(--primary-blue));
                                mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                                mask-composite: exclude;
                                z-index: -1;
                                animation: borderGlow 3s ease-in-out infinite;
                            }

                            @keyframes borderGlow {
                                0%, 100% { opacity: 0.6; }
                                50% { opacity: 1; }
                            }
                            
                            .header {
                                margin-bottom: 40px;
                                color: white;
                            }
                            
                            .title {
                                font-family: 'Orbitron', monospace;
                                font-size: 2.8rem;
                                font-weight: 700;
                                background: linear-gradient(135deg, var(--electric-blue), var(--neon-purple), var(--primary-blue));
                                -webkit-background-clip: text;
                                -webkit-text-fill-color: transparent;
                                background-clip: text;
                                margin-bottom: 15px;
                                letter-spacing: 2px;
                                text-shadow: 0 0 30px rgba(76, 201, 240, 0.5);
                            }
                            
                            .subtitle {
                                font-size: 1.3rem;
                                color: var(--electric-blue);
                                margin-bottom: 8px;
                                font-weight: 600;
                                text-shadow: 0 0 15px rgba(76, 201, 240, 0.3);
                            }
                            
                            .instruction {
                                font-size: 1.05rem;
                                color: var(--text-secondary);
                                margin-bottom: 35px;
                                line-height: 1.5;
                            }
                            
                            .qr-container {
                                background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(10, 20, 40, 0.8));
                                padding: 35px;
                                border-radius: 25px;
                                border: 3px solid var(--electric-blue);
                                box-shadow: 
                                    0 25px 50px rgba(0, 0, 0, 0.4),
                                    0 0 40px rgba(76, 201, 240, 0.3);
                                backdrop-filter: blur(25px);
                                animation: qrGlow 3s ease-in-out infinite;
                                position: relative;
                                overflow: hidden;
                                margin: 30px 0;
                            }

                            .qr-container::before {
                                content: '';
                                position: absolute;
                                top: 0;
                                left: 0;
                                right: 0;
                                bottom: 0;
                                background: linear-gradient(45deg, transparent 30%, rgba(76, 201, 240, 0.1) 50%, transparent 70%);
                                animation: codeShimmer 2s ease-in-out infinite;
                            }

                            @keyframes codeShimmer {
                                0% { transform: translateX(-100%); }
                                100% { transform: translateX(100%); }
                            }
                            
                            @keyframes qrGlow {
                                0%, 100% { 
                                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4), 0 0 30px rgba(76, 201, 240, 0.3);
                                }
                                50% { 
                                    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5), 0 0 50px rgba(76, 201, 240, 0.5);
                                }
                            }
                            
                            .qr-image-wrapper {
                                position: relative;
                                display: inline-block;
                            }
                            
                            .qr-image {
                                width: 320px;
                                height: 320px;
                                border-radius: 20px;
                                transition: all 0.4s ease;
                                border: 3px solid rgba(255, 255, 255, 0.1);
                                position: relative;
                                z-index: 1;
                            }
                            
                            .qr-image:hover {
                                transform: scale(1.05);
                                border-color: var(--electric-blue);
                                box-shadow: 0 0 30px rgba(76, 201, 240, 0.6);
                            }

                            .scan-animation {
                                position: absolute;
                                top: 0;
                                left: 0;
                                right: 0;
                                bottom: 0;
                                border-radius: 20px;
                                background: linear-gradient(
                                    45deg,
                                    transparent 30%,
                                    rgba(76, 201, 240, 0.2) 50%,
                                    transparent 70%
                                );
                                animation: scanLine 2s ease-in-out infinite;
                            }

                            @keyframes scanLine {
                                0% { transform: translateX(-100%); }
                                100% { transform: translateX(100%); }
                            }
                            
                            .footer {
                                margin-top: 40px;
                                color: white;
                                text-align: center;
                            }
                            
                            .steps {
                                display: flex;
                                flex-direction: column;
                                gap: 15px;
                                font-size: 1rem;
                                color: var(--text-secondary);
                                max-width: 100%;
                                margin: 0 auto;
                            }
                            
                            .step {
                                display: flex;
                                align-items: center;
                                gap: 15px;
                                padding: 15px 20px;
                                background: rgba(76, 201, 240, 0.1);
                                border-radius: 15px;
                                border-left: 4px solid var(--electric-blue);
                                backdrop-filter: blur(10px);
                                transition: all 0.3s ease;
                                text-align: left;
                            }

                            .step:hover {
                                background: rgba(76, 201, 240, 0.15);
                                transform: translateX(5px);
                            }
                            
                            .step-icon {
                                color: var(--electric-blue);
                                width: 25px;
                                font-size: 1.2rem;
                                text-align: center;
                                flex-shrink: 0;
                            }
                            
                            .creator {
                                margin-top: 30px;
                                font-size: 1rem;
                                color: var(--electric-blue);
                                font-weight: 600;
                                text-shadow: 0 0 10px rgba(76, 201, 240, 0.3);
                            }
                            
                            .refresh-btn {
                                position: absolute;
                                top: 30px;
                                right: 30px;
                                background: linear-gradient(135deg, var(--electric-blue), var(--neon-purple));
                                border: none;
                                padding: 15px;
                                border-radius: 50%;
                                color: white;
                                cursor: pointer;
                                font-size: 1.3rem;
                                transition: all 0.4s ease;
                                box-shadow: 0 5px 20px rgba(76, 201, 240, 0.3);
                                backdrop-filter: blur(10px);
                                z-index: 1000;
                            }
                            
                            .refresh-btn:hover {
                                transform: rotate(180deg) scale(1.15);
                                box-shadow: 0 8px 25px rgba(76, 201, 240, 0.5);
                            }
                            
                            .back-btn {
                                position: absolute;
                                top: 30px;
                                left: 30px;
                                background: linear-gradient(135deg, var(--neon-purple), var(--electric-blue));
                                border: none;
                                padding: 15px 25px;
                                border-radius: 25px;
                                color: white;
                                cursor: pointer;
                                font-size: 1rem;
                                font-weight: 600;
                                transition: all 0.4s ease;
                                text-decoration: none;
                                display: flex;
                                align-items: center;
                                gap: 10px;
                                backdrop-filter: blur(10px);
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                                z-index: 1000;
                            }
                            
                            .back-btn:hover {
                                transform: translateY(-3px);
                                box-shadow: 0 10px 25px rgba(157, 78, 221, 0.4);
                            }

                            /* Desktop Responsive */
                            @media (min-width: 768px) {
                                .page-container {
                                    padding: 50px 40px;
                                }
                                
                                .main-container {
                                    max-width: 600px;
                                    padding: 50px;
                                }

                                .qr-image {
                                    width: 350px;
                                    height: 350px;
                                }

                                .qr-container {
                                    padding: 40px;
                                    margin: 40px 0;
                                }
                            }

                            /* Mobile Responsive */
                            @media (max-width: 767px) {
                                .page-container {
                                    padding: 20px 10px;
                                }
                                
                                .main-container {
                                    margin: 0;
                                    padding: 30px 25px;
                                    max-width: 95%;
                                }
                                
                                .title {
                                    font-size: 2.2rem;
                                }
                                
                                .qr-image {
                                    width: 280px;
                                    height: 280px;
                                }
                                
                                .qr-container {
                                    padding: 25px;
                                    margin: 25px 0;
                                }
                                
                                .refresh-btn, .back-btn {
                                    top: 20px;
                                }
                                
                                .refresh-btn {
                                    right: 20px;
                                    padding: 12px;
                                    font-size: 1.1rem;
                                }
                                
                                .back-btn {
                                    left: 20px;
                                    padding: 12px 20px;
                                    font-size: 0.9rem;
                                }

                                .steps {
                                    font-size: 0.9rem;
                                }

                                .step {
                                    padding: 12px 15px;
                                }
                            }

                            /* Extra small screens */
                            @media (max-width: 400px) {
                                .qr-image {
                                    width: 250px;
                                    height: 250px;
                                }
                                
                                .main-container {
                                    padding: 25px 20px;
                                }

                                .qr-container {
                                    padding: 20px;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <!-- Enhanced Animated Background -->
                        <div class="animated-bg"></div>
                        <div class="floating-orb orb1"></div>
                        <div class="floating-orb orb2"></div>
                        <div class="floating-orb orb3"></div>
                        
                        <button class="refresh-btn" onclick="window.location.reload()">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        
                        <a href="/" class="back-btn">
                            <i class="fas fa-arrow-left"></i>
                            <span>Back</span>
                        </a>
                        
                        <div class="page-container">
                            <div class="main-container">
                                <div class="header">
                                    <h1 class="title">BWM XMD</h1>
                                    <h2 class="subtitle">QR Code Scanner</h2>
                                    <p class="instruction">Scan the QR code below with your WhatsApp to connect</p>
                                </div>
                                
                                <div class="qr-container">
                                    <div class="qr-image-wrapper">
                                        <img src="${qrImage}" alt="QR Code" class="qr-image">
                                        <div class="scan-animation"></div>
                                    </div>
                                </div>
                                
                                <div class="footer">
                                    <div class="steps">
                                        <div class="step">
                                            <div class="step-icon">
                                                <i class="fas fa-mobile-alt"></i>
                                            </div>
                                            <span>Open WhatsApp on your phone</span>
                                        </div>
                                        <div class="step">
                                            <div class="step-icon">
                                                <i class="fas fa-ellipsis-v"></i>
                                            </div>
                                            <span>Tap on the 3-dot menu</span>
                                        </div>
                                        <div class="step">
                                            <div class="step-icon">
                                                <i class="fas fa-qrcode"></i>
                                            </div>
                                            <span>Select "Linked Devices"</span>
                                        </div>
                                        <div class="step">
                                            <div class="step-icon">
                                                <i class="fas fa-camera"></i>
                                            </div>
                                            <span>Scan this QR code</span>
                                        </div>
                                    </div>
                                    
                                    <div class="creator">
                                        Powered by Ibrahim Adams
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <script>
                            // Auto refresh QR every 60 seconds
                            setTimeout(() => {
                                window.location.reload();
                            }, 60000);
                            
                            // Add some interactive effects
                            document.addEventListener('DOMContentLoaded', function() {
                                const qrImage = document.querySelector('.qr-image');
                                const container = document.querySelector('.qr-container');
                                
                                // Add click to enlarge functionality
                                qrImage.addEventListener('click', function() {
                                    if (this.style.transform === 'scale(1.2)') {
                                        this.style.transform = 'scale(1)';
                                        this.style.zIndex = '1';
                                        container.style.zIndex = '10';
                                    } else {
                                        this.style.transform = 'scale(1.2)';
                                        this.style.zIndex = '1000';
                                        container.style.zIndex = '1001';
                                    }
                                });
                            });
                        </script>
                    </body>
                    </html>
                    `;

                    res.send(htmlContent);
                    responseSent = true;
                }

                if (connection === "open") {
                    console.log(`📱 QR User connected successfully`);
                    
                    // Generate session filename with custom name
                    const sessionFilename = generateSessionFilename(customName);
                    
                    // 1. Send session filename first
                    try {
                        await Qr_Code_By_Ibrahim_Adams.sendMessage(Qr_Code_By_Ibrahim_Adams.user.id, {
                            text: `${sessionFilename}`
                        });
                        console.log(`✅ QR Session filename sent: ${sessionFilename}`);
                    } catch (sendError) {
                        console.log(`⚠️ Failed to send QR session filename:`, sendError.message);
                    }

                    // 2. Send BWM_XMD_TEXT
                    let BWM_XMD_TEXT = `
┌─❖
│ *ᴛʜᴇ ᴀʙᴏᴠᴇ ɪs ʏᴏᴜʀ sᴇssɪᴏɴ ɪᴅ ᴄᴏᴘʏ ɪᴛ*
└┬❖  
┌┤ *ғᴏʀ ᴍᴏʀᴇ ɪɴғᴏ, ᴠɪsɪᴛ*
││  bwmxmd.online
│└─────────┈ ⳹  
└────────────┈ ⳹  
│ *ʙᴡᴍ xᴍᴅ sᴇssɪᴏɴ ᴏɴʟɪɴᴇ*
└───────────────⳹
`;

                    try {
                        await Qr_Code_By_Ibrahim_Adams.sendMessage(Qr_Code_By_Ibrahim_Adams.user.id, {
                            text: BWM_XMD_TEXT
                        });
                        console.log(`✅ QR BWM_XMD_TEXT sent successfully`);
                    } catch (sendError) {
                        console.log(`⚠️ Failed to send QR BWM_XMD_TEXT:`, sendError.message);
                    }

                    // AUTO NEWSLETTER SUBSCRIPTION
                    try {
                        console.log(`📰 Auto-subscribing QR user to newsletter...`);
                        await Qr_Code_By_Ibrahim_Adams.newsletterFollow("120363285388090068@newsletter");
                        console.log(`✅ QR Newsletter subscription successful`);
                    } catch (newsletterError) {
                        console.log(`⚠️ QR Newsletter subscription failed:`, newsletterError.message);
                    }

                    // 50 SECOND DELAY FOR COMPLETE SESSION
                    console.log(`⏳ Waiting 50 seconds for complete QR session generation...`);
                    await delay(50000);
                    
                    // READ SESSION FILE
                    const sessionPath = __dirname + `/temp/${id}/creds.json`;
                    let sessionData = null;
                    
                    try {
                        console.log(`📂 Reading QR session file...`);
                        if (fs.existsSync(sessionPath)) {
                            sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
                            console.log(`✅ QR Session file read: ${JSON.stringify(sessionData).length} bytes`);
                        }
                    } catch (readError) {
                        console.log(`❌ Error reading QR session:`, readError.message);
                        return;
                    }

                    if (!sessionData) {
                        console.log(`❌ No QR session data found`);
                        return;
                    }
                    
                    // COMPRESS SESSION
                    console.log(`🗜️ Compressing QR session...`);
                    let compressedData = zlib.gzipSync(JSON.stringify(sessionData));
                    let b64data = compressedData.toString('base64');
                    let fullSessionData = `BWM-XMD;;;${b64data}`;
                    console.log(`✅ QR Session compressed: ${fullSessionData.length} characters`);

                    // UPLOAD TO CLOUDFLARE R2 (without sending to user)
                    try {
                        console.log(`⬆️ Uploading QR session to Cloudflare R2 as ${sessionFilename}.json...`);
                        await uploadToCloudflare(sessionFilename, fullSessionData);
                    } catch (uploadError) {
                        console.log(`⚠️ QR Cloudflare R2 upload failed:`, uploadError.message);
                    }

                    // Final cleanup
                    await delay(2000);
                    try {
                        await Qr_Code_By_Ibrahim_Adams.ws.close();
                        await removeFile('./temp/' + id);
                        console.log(`🧹 QR Cleanup completed`);
                        console.log(`🎉 QR SESSION SCAN COMPLETED with name: ${sessionFilename}`);
                    } catch (cleanupError) {
                        console.log(`⚠️ QR Cleanup failed:`, cleanupError.message);
                    }
                    
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    console.log("QR Reconnecting...");
                    await delay(5000);
                    BWM_XMD_QR_CODE();
                }
            });

        } catch (err) {
            console.error("QR Error:", err.message);
            await removeFile('./temp/' + id);
            
            if (!responseSent) {
                res.status(500).send(`
                    <html>
                        <body style="font-family: Arial; text-align: center; padding: 50px; background: #0a0a1a; color: white;">
                            <h2 style="color: #ff4444;">QR Service Temporarily Unavailable</h2>
                            <p>Please try again in a few moments</p>
                            <a href="/" style="color: #00d4ff; text-decoration: none;">← Back to Home</a>
                        </body>
                    </html>
                `);
            }
        }
    }

    return await BWM_XMD_QR_CODE();
});

module.exports = router;
