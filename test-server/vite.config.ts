import * as NodePath from 'node:path';
import * as NodeURL from 'node:url';

import * as Vite from 'vite';

import ViteReactPlugin from '@vitejs/plugin-react';
import ViteTSConfigPathsPlugin from 'vite-tsconfig-paths';

//

const __filename = NodeURL.fileURLToPath(import.meta.url);
const __dirname = NodePath.dirname(__filename);

//

export default Vite.defineConfig({
  plugins: [ViteReactPlugin(), ViteTSConfigPathsPlugin()],
  root: NodePath.resolve(__dirname, "src"),
  server: {
    port: 4000,
    open: true,
  },
});
