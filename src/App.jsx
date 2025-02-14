import React, { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  // Обробник вибору файлу
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage('Будь ласка, виберіть файл.');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message);
      } else {
        setMessage(result.error || 'Помилка при завантаженні фото.');
      }
    } catch (error) {
      setMessage('Помилка при завантаженні фото.');
    }
  };

  const handleClearForm = () => {
    setFile(null); 
    setMessage(''); 
  };

  const handleClearAll = async () => {
    try {
      const response = await fetch('http://localhost:5000/clear-all', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message);
      } else {
        setMessage(result.error || 'Помилка при очищенні папок.');
      }
    } catch (error) {
      setMessage('Помилка при очищенні папок.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Завантаження фото</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit">Завантажити</button>
        <button type="button" onClick={handleClearForm} style={{ marginLeft: '10px' }}>
          Очистити форму
        </button>
      </form>
      <button onClick={handleClearAll} style={{ marginTop: '20px', display: 'block' }}>
        Прибрати всі картинки
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default App;