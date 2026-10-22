const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOADS_DIR));

// Tự động khởi tạo thư mục và database mẫu nếu chưa có
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([
        {
            id: "app-demo-1",
            name: "Telegram Mini App Bot",
            version: "v2.8.0",
            category: "Android",
            filename: "app-demo.apk",
            size: "28.5 MB",
            downloads: 1420,
            rating: "4.9",
            description: "Ứng dụng nhắn tin bảo mật và quản lý Bot Telegram tự động.",
            changelog: "Cập nhật kết nối Webhook Cloudflare Workers D1.",
            createdAt: new Date().toISOString()
        }
    ], null, 2));
}

// Cấu hình Multer lưu trữ file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${path.basename(file.originalname, ext)}-${uniqueSuffix}${ext}`);
    }
});
const upload = multer({ storage });

const readData = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const writeData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// API Endpoints
app.get('/api/apps', (req, res) => {
    res.json(readData());
});

app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === 'admin123') {
        res.json({ success: true, token: 'VIP-PRO-ADMIN-SECRET-TOKEN' });
    } else {
        res.status(401).json({ success: false, message: 'Sai mật khẩu Admin!' });
    }
});

app.post('/api/admin/upload', upload.single('softwareFile'), (req, res) => {
    try {
        const { name, version, category, rating, description, changelog } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ success: false, message: 'Vui lòng chọn file phần mềm!' });
        }

        const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
        const apps = readData();

        const newApp = {
            id: 'app-' + Date.now(),
            name,
            version: version || 'v1.0.0',
            category: category || 'Windows',
            filename: file.filename,
            size: sizeMB,
            downloads: 0,
            rating: rating || '5.0',
            description,
            changelog: changelog || 'Phiên bản đầu tiên.',
            createdAt: new Date().toISOString()
        };

        apps.unshift(newApp);
        writeData(apps);

        res.json({ success: true, message: 'Đã tải lên phần mềm thành công!', app: newApp });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi upload file!' });
    }
});

app.get('/api/download/:id', (req, res) => {
    const apps = readData();
    const appItem = apps.find(a => a.id === req.params.id);

    if (!appItem) return res.status(404).send('Không tìm thấy phần mềm!');

    appItem.downloads = (appItem.downloads || 0) + 1;
    writeData(apps);

    const filePath = path.join(UPLOADS_DIR, appItem.filename);
    res.download(filePath, appItem.filename);
});

app.delete('/api/admin/apps/:id', (req, res) => {
    let apps = readData();
    const appItem = apps.find(a => a.id === req.params.id);

    if (appItem) {
        const filePath = path.join(UPLOADS_DIR, appItem.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        apps = apps.filter(a => a.id !== req.params.id);
        writeData(apps);
    }

    res.json({ success: true, message: 'Đã xóa ứng dụng thành công!' });
});

app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 WEB SERVER ĐÃ SẴN SÀNG TẠI: http://localhost:${PORT}`);
    console.log(`👑 ADMIN DASHBOARD: http://localhost:${PORT}/admin.html`);
    console.log(`=================================================`);
});
