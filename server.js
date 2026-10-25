const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { TeamSpeak } = require('ts3-nodejs-library');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// پوشه فایل‌های استاتیک (HTML, CSS)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// مسیرهای صفحات
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/logs', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'logs.html'));
});

app.get('/shop', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'shop.html'));
});

// اتصال به تیم‌اسپیک برای لایو لاگ (tsww.ir)
async function initTeamSpeakLogs() {
    try {
        const ts = await TeamSpeak.connect({
            host: "5.57.37.100",
            queryport: 26434,
            serverport: 12050,
            username: "Wanted-Rp-Ranksystem",
            password: "Z26pfkNmZtPA",
            nickname: "Wanted-Rp-Ranksystem"
        });

        console.log("Connected to TeamSpeak Server Query successfully!");

        // گوش دادن به رویدادهای سرور (مثلاً ورود کاربر یا پیام‌ها)
        ts.on("clientconnect", (event) => {
            io.emit("logMessage", `[ورود کاربر] کاربر ${event.client.data.client_nickname} وارد سرور شد.`);
        });

        ts.on("clientdisconnect", (event) => {
            io.emit("logMessage", `[خروج کاربر] کاربری از سرور خارج شد.`);
        });

        ts.on("textmessage", (event) => {
            io.emit("logMessage", `[چت عمومی] ${event.invokerName}: ${event.msg}`);
        });

    } catch (error) {
        console.error("TeamSpeak Connection Error:", error);
        setTimeout(() => initTeamSpeakLogs(), 10000); // تلاش مجدد بعد از ۱۰ ثانیه
    }
}

initTeamSpeakLogs();

// پورت سرور
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
// بررسی اطلاعات لاگین در سرور
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // نام کاربری و رمز عبور دلخواه خودتان برای ورود به پنل
    const ADMIN_USER = "admin";
    const ADMIN_PASS = "secret123";

    if (username === ADMIN_USER && password === ADMIN_PASS) {
        // اگر درست بود، هدایت به صفحه لاگ‌ها
        res.redirect('/logs');
    } else {
        // اگر اشتباه بود، بازگشت به صفحه ورود با خطا
        res.send(`<script>alert('نام کاربری یا رمز عبور اشتباه است!'); window.location.href='/';</script>`);
    }
});
