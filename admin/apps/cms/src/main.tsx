import ReactDOM from 'react-dom/client';
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import App from './App.tsx';
import './locales';
import './index.css';

interface RenderProps {
  container?: HTMLElement;
  [key: string]: unknown;
}

let root: ReactDOM.Root | null = null;

function render(props: RenderProps = {}) {
  const { container } = props;
  if (props.language) {
    import('i18next').then(({ default: i18next }) => { i18next.changeLanguage(props.language as string); });
  }
  const mountPoint = container ? (container.querySelector('#root') ?? container) : document.getElementById('root');
  root = ReactDOM.createRoot(mountPoint!);
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
