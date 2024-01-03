import app from './app.js';
import configs from './src/configs/index.js';

const PORT = configs.app.port;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
