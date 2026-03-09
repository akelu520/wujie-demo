import React from "react";
import WujieReact from "wujie-react";

function App() {
  // 这里的 URL 指向我们待会儿要启动的子应用（端口 5174）
  const subAppUrl = "http://localhost:5174/";

  return (
    <div style={{ padding: "20px", background: "#f5f5f5", minHeight: "100vh" }}>
      <h1 style={{ color: "#61dafb" }}>这是 React 主应用 (Host)</h1>
      <div style={{ padding: "10px", background: "#fff", border: "1px solid #ddd" }}>
        <h3>子应用展示区：</h3>
        {/* Wujie 核心组件 */}
        <WujieReact
          width="100%"
          height="500px"
          name="my-sub-app" // 给子应用起个唯一的 ID
          url={subAppUrl}    // 子应用的地址
          sync={true}        // 开启路由同步
        />
      </div>
    </div>
  );
}

export default App;