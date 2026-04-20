import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* 1. 背景图层：全屏铺满 */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/erii-bg.png" // 对应 public 文件夹下的图片名
          alt="Erii Background"
          fill
          className="object-cover"
          priority
        />
        {/* 暗色渐变遮罩：压暗背景，保证前景文字的绝对清晰 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70"></div>
      </div>

      {/* 2. 前景 UI 层：毛玻璃质感卡片 */}
      <div className="relative z-10 flex flex-col items-center p-12 md:p-16 rounded-3xl bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl transition-all duration-700 hover:bg-black/40">
        
        {/* 主标题 */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          上杉绘梨衣
        </h1>
        
        {/* 经典台词 */}
        <p className="text-red-400 text-lg md:text-xl mb-4 font-medium tracking-wide drop-shadow-md">
          "我是绘梨衣，我不喜欢那个世界，我只喜欢你。"
        </p>
        
        {/* 龙族红黑主题分割线 */}
        <div className="w-24 h-1 bg-red-600/80 rounded-full mb-10 shadow-[0_0_10px_rgba(220,38,38,0.8)]"></div>

        {/* 项目副标题 */}
        <p className="text-gray-300 mb-12 text-sm tracking-[0.3em] uppercase font-light">
          EriiNote V1.0 • 全栈 AI 工作台
        </p>

        {/* 交互按钮 */}
        <Link href="/chat" className="px-10 py-3.5 rounded-full bg-red-700/80 hover:bg-red-600 text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] border border-red-500/50 flex items-center gap-2">
          进入她的世界
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </main>
  );
}