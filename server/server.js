const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 5000;


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});


const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); 
  } else {
    cb(new Error('Тільки зображення дозволені!'), false); 
  }
};

const upload = multer({ storage, fileFilter });


app.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не завантажено або невірний формат.' });
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;


    await Promise.all([
      sharp(filePath)
        .resize(800, 600)
        .toFile(`uploads/resized/${fileName}-large.jpg`)
        .catch((err) => console.error('Помилка при створенні large:', err)),
      sharp(filePath)
        .resize(400, 300)
        .toFile(`uploads/resized/${fileName}-medium.jpg`)
        .catch((err) => console.error('Помилка при створенні medium:', err)),
      sharp(filePath)
        .resize(100, 100)
        .toFile(`uploads/resized/${fileName}-thumbnail.jpg`)
        .catch((err) => console.error('Помилка при створенні thumbnail:', err)),
    ]);

    // НЕ видаляємо оригінальний файл
    // await fs.unlink(filePath);

    res.status(200).json({ message: 'Фото успішно завантажено!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка при обробці фото.' });
  }
});

// Маршрут для очищення обох папок (uploads та uploads/resized)
app.post('/clear-all', async (req, res) => {
  try {
    await fs.emptyDir('uploads'); // очищуємо основну папку
    await fs.emptyDir('uploads/resized'); // Очищуємо папку resized
    res.status(200).json({ message: 'Усі картинки успішно видалені!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка при очищенні папок.' });
  }
});

// Старт сервера
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});