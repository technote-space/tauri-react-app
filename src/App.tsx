import {
  ChangeEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Layout, Responsive, WidthProvider } from 'react-grid-layout';
import ReactPlayer from 'react-player';
import './App.css';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

function App() {
  const [urls, setUrls]     = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const handleInputNewUrl   = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setNewUrl(e.target.value);
  }, [setNewUrl]);
  const handleClick         = useCallback(() => {
    if (newUrl) {
      setUrls(prev => [...new Set([...prev, newUrl])]);
      setNewUrl('');
    }
  }, [newUrl, setUrls, setNewUrl]);

  const [currentLayout, setCurrentLayout] = useState<Record<string, Layout>>({});
  const handleChangeLayout                = useCallback((layouts: Layout[]) => {
    setCurrentLayout(prev => Object.assign({}, ...Object.keys(prev).map((key, index) => ({ [key]: layouts[index] }))));
  }, [setCurrentLayout]);

  const handleDelete = useMemo(() => Object.assign({}, ...urls.map(url => ({
    [url]: () => {
      setCurrentLayout(prev => {
        delete prev[url];
        return prev;
      });
      setUrls(prev => prev.filter(_url => _url !== url));
    },
  }))), [urls, setCurrentLayout, setUrls]);

  const handleCopy = useCallback((e: MouseEvent<HTMLInputElement>) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText((e.target as HTMLInputElement).value)
        .then(() => alert('コピーしました'))
        .catch((error) => alert((error && error.message) || 'コピーに失敗しました'));
    }
  }, []);

  useEffect(() => {
    setCurrentLayout(currentLayout => {
      return Object.assign({}, ...urls.map(url => ({
        [url]: currentLayout[url] ?? {
          i: url,
          x: 0,
          y: 0,
          w: 4,
          h: 1,
        } as Layout,
      })));
    });
  }, [urls, setCurrentLayout]);

  const layouts = useMemo(() => ({
    lg: [
      ...urls.filter(url => url in currentLayout).map(url => currentLayout[url]),
    ],
  }), [urls, currentLayout]);

  return (
    <div className="App">
      <div className="input-area">
        <input
          className="input-new-url"
          type="text"
          value={ newUrl }
          onChange={ handleInputNewUrl }
        />
        <button onClick={ handleClick }>追加</button>
      </div>
      <ResponsiveReactGridLayout
        className="layout"
        rowHeight={ 290 }
        margin={ [10, 10] }
        layouts={ layouts }
        cols={ { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 } }
        measureBeforeMount={ false }
        onLayoutChange={ handleChangeLayout }
      >
        { urls.map(url =>
          <div className="card" key={ url }>
            <input
              className="input-url"
              type="text"
              value={ url }
              readOnly
              onClick={ handleCopy }
            />
            <ReactPlayer
              url={ url }
              controls={ true }
              width="auto"
              height={ currentLayout[url]?.h * 300 - 72 }
            />
            <button
              className="delete-button"
              onClick={ handleDelete[url] }
            >削除</button>
          </div>) }
      </ResponsiveReactGridLayout>
    </div>
  );
}

export default App;
