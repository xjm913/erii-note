"use client";

import { useState, useRef, useEffect } from "react";
// --- 🚨 新增：排版与高亮工具 ---
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

// 定义消息的类型
interface Message {
  role: "user" | "erii";
  content: string;
}

export default function ChatPage() {
  // 初始化聊天记录，默认让小怪兽先打个招呼
  const [messages, setMessages] = useState<Message[]>([
    { role: "erii", content: "Sakura，你来了。" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // 🚨 新增：防抖与上传状态提示

  // 用于自动滚动到底部的引用
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 每次消息更新，自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    // 1. 先把用户的话上屏显示
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setInput("");
    setIsLoading(true);

    try {
      // 🚨 核心跨次元呼叫：请求 Python 后端
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 这里的 { message: userText } 必须和咱们后端的 Pydantic (ChatRequest) 模型严丝合缝！
        body: JSON.stringify({ message: userText }),
      });

      if (!response.ok) {
        throw new Error(`HTTP 错误! 状态码: ${response.status}`);
      }

      // // 解析 Python 返回的 JSON
      // const data = await response.json();

      // // 2. 把小怪兽的回复上屏
      // setMessages((prev) => [...prev, { role: "erii", content: data.reply }]);

      // 打字机模式

      // 核心改造 1：不再使用 .json()，而是获取底层的读取器
      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      // 2. 先给绘梨衣创建一个“空的气泡”，放在屏幕上准备接字
      setMessages((prev) => [...prev, { role: 'erii', content: '' }])

      // 🚨 核心改造 2：死循环不断读取管道里的数据流
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // 3. 把网络传输的二进制碎片，解码成真正的字符串
          const chunkText = decoder.decode(value, { stream: true })

          // 4. 把新蹦出来的字，实时拼接到最后一条消息（绘梨衣的气泡）里
          setMessages((prev) => {
            const newMessages = [...prev]
            const lastIndex = newMessages.length - 1
            newMessages[lastIndex].content += chunkText
            return newMessages
          })
        }
      }





    } catch (error) {
      console.error("跨次元通讯失败:", error);
      setMessages((prev) => [
        ...prev,
        { role: "erii", content: "（脑电波连接失败，看看是不是后端服务没开，或者跨域报错了？）" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  // 🚨 新增：处理文件上传的核心逻辑
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // 💡 前端老兵秒懂：物理文件必须用 FormData 打包，绝对不能用 JSON.stringify
    const formData = new FormData();
    formData.append("file", file); // 这里的 "file" 必须和后端 API 接收的参数名一模一样

    try {
      // 在屏幕上先给用户一个反馈
      setMessages((prev) => [...prev, { role: "user", content: `[📎 上传了文件: ${file.name}]` }]);

      const response = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        // ⚠️ 极其关键的暗坑：用 fetch 发送 FormData 时，千万不要手动设置 Content-Type！
        // 浏览器会自动帮你设置成 multipart/form-data 并加上随机 boundary 边界符
        body: formData,
      });

      const data = await response.json();

      if (data.status === "success") {
        setMessages((prev) => [...prev, { role: "erii", content: `Sakura，我已经收到文件了哦，后端说：${data.message}` }]);
      } else {
        setMessages((prev) => [...prev, { role: "erii", content: `抱歉，文件读取失败了：${data.message}` }]);
      }
    } catch (error) {
      console.error("上传错误:", error);
      setMessages((prev) => [...prev, { role: "erii", content: "网络好像断开了..." }]);
    } finally {
      setIsUploading(false);
      // 清空 input 的 value，保证下次传同一个文件也能触发 onChange
      e.target.value = "";
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center p-4 font-sans"
      // 这里我放了一张极具龙族氛围的二次元红黑樱花图直链
      style={{ backgroundImage: "url('/erii-chat.png')" }}
    >
      {/* 聊天记录展示区：去掉了边框和背景模糊，通透感拉满 */}
      <div className="flex-1 w-full max-w-3xl flex flex-col mb-6 overflow-hidden pt-10">
        <div className="overflow-y-auto space-y-6 pr-2 pb-4 flex-1">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-lg ${msg.role === "user"
                  ? "bg-red-600/90 text-white rounded-tr-sm" // 用户的气泡：龙族红
                  : "bg-black/70 text-white/95 rounded-tl-sm" // 绘梨衣的气泡：深邃黑
                  }`}
              >
                {/* 🚨 替换开始：使用 Markdown 引擎渲染，并劫持 code 标签进行高亮 */}
                {/* react-markdown 新版移除了 className，需由外层容器承载排版类名 */}
                <div className="prose prose-invert max-w-none break-words">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // 劫持所有的 <code> 标签
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          // 如果是多行代码块，使用 SyntaxHighlighter 进行高亮渲染
                          <SyntaxHighlighter
                            {...props}
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            className="rounded-md my-2 text-sm shadow-black/50 shadow-inner"
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        ) : (
                          // 如果是单行代码（比如 `npm install`），做个简单的红字轻量背景高亮
                          <code {...props} className="bg-black/40 text-red-300 px-1.5 py-0.5 rounded text-sm font-mono">
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
                {/* 🚨 替换结束 */}
              </div>
            </div>
          ))}

          {/* 打字 Loading 态 */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-black/70 text-white/80 rounded-2xl rounded-tl-sm px-5 py-3 animate-pulse">
                小怪兽正在小本本上写字...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 底部输入区 */}
      <div className="w-full max-w-3xl flex gap-3 pb-8">
        {/* 🚨 新增：极其优雅的隐藏式文件上传组件 */}
        <div className="relative flex items-center justify-center">
          <input
            type="file"
            id="file-upload"
            accept=".txt,.md" // 目前后端咱们只写了解析文本，先限制一下格式
            className="hidden" // 隐藏极其丑陋的原生 input
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <label
            htmlFor="file-upload"
            className={`cursor-pointer rounded-full p-2 text-xl transition-all ${isUploading ? "text-gray-500 bg-gray-200/20" : "text-white hover:bg-white/20"
              }`}
            title="上传文档"
          >
            {isUploading ? "⏳" : "📎"}
          </label>
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="对绘梨衣说点什么..."
          className="flex-1 bg-black/60 text-white placeholder-white/50 border border-white/10 rounded-full px-6 py-4 outline-none focus:ring-2 focus:ring-red-500/50 shadow-xl"
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="bg-red-600/90 hover:bg-red-700 text-white rounded-full px-8 py-4 font-bold transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(220,38,38,0.5)]"
        >
          发送
        </button>
      </div>
    </div>
  );
}