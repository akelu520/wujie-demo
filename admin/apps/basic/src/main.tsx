import ReactDOM from 'react-dom/client';
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import App from './App.tsx';
import './index.css';
import type { User } from '@/types/index.ts';

interface RenderProps {
  container?: HTMLElement;
  user?: User;
  [key: string]: unknown;
}

let root: ReactDOM.Root | null;

function render(props: RenderProps = {}) {
  const { container } = props;
  const mountPoint = container
    ? container.querySelector('#root')
    : document.getElementById('root');
  root = ReactDOM.createRoot(mountPoint as HTMLElement);
  root.render(<App qiankunProps={props} />);
}

renderWithQiankun({
  mount(props) { render(props as RenderProps); },
  bootstrap() { return Promise.resolve(); },
  unmount() { root?.unmount(); root = null; },
  update() { return Promise.resolve(); },
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render();
}
