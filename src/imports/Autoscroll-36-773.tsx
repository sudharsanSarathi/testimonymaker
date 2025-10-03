import imgImage2419 from "figma:asset/2b6be342f613e4351c62e04df42cbb2de19f1528.png";
import imgImage2427 from "figma:asset/4a85e77801acf505c18516368f3729c88628bcc9.png";
import imgImage2428 from "figma:asset/3d56193a31c01b61581c8459d1206cbf17daef03.png";
import imgImage2431 from "figma:asset/30ad9ae52edd2718826fcd66b2b8e2be8803640b.png";
import imgImage2434 from "figma:asset/2d12ef21d126cf0e4af3a689cba3e18bc0b08a59.png";
import imgImage2435 from "figma:asset/de6fa880bc229d19ef38f5a5a460a0d8c5461419.png";
import imgImage2430 from "figma:asset/45adeea822bb08ddc0cc165e04ec1b8e00b763d8.png";
import imgImage2436 from "figma:asset/3ffa72d924fbd0904203b0c02f825974286a8c9f.png";
import imgImage2422 from "figma:asset/d292fd061698dd6b1366006324265b6cc2e30b8b.png";
import imgImage2423 from "figma:asset/3c8846c94f364100c436b2c769a72b5a6efcf1c5.png";

function Group1272630213() {
  return (
    <div className="relative flex flex-col gap-2" style={{ width: Math.round(123 * 1.2) + 'px' }}>
      <div 
        className="rounded-[4.548px] bg-cover bg-center bg-no-repeat" 
        style={{ 
          backgroundImage: `url('${imgImage2419}')`,
          width: Math.round(123 * 1.2) + 'px',
          height: Math.round(117 * 1.2) + 'px'
        }} 
      />
      <div 
        className="rounded-[4.548px] bg-cover bg-center bg-no-repeat" 
        style={{ 
          backgroundImage: `url('${imgImage2427}')`,
          width: Math.round(123 * 1.2) + 'px',
          height: Math.round(39 * 1.2) + 'px'
        }} 
      />
    </div>
  );
}

function Group1272630212() {
  return (
    <div className="relative flex flex-col gap-2" style={{ width: Math.round(122 * 1.2) + 'px' }}>
      <div 
        className="rounded-[4.548px] bg-cover bg-center bg-no-repeat" 
        style={{ 
          backgroundImage: `url('${imgImage2428}')`,
          width: Math.round(122 * 1.2) + 'px',
          height: Math.round(53 * 1.2) + 'px'
        }} 
      />
      <div 
        className="rounded-[4.548px] bg-cover bg-center bg-no-repeat" 
        style={{ 
          backgroundImage: `url('${imgImage2431}')`,
          width: Math.round(122 * 1.2) + 'px',
          height: Math.round(57 * 1.2) + 'px'
        }} 
      />
    </div>
  );
}

function Group1272630211() {
  return (
    <div className="relative flex flex-col gap-2" style={{ width: Math.round(127 * 1.2) + 'px' }}>
      <div 
        className="rounded-[4.548px] bg-cover bg-center bg-no-repeat" 
        style={{ 
          backgroundImage: `url('${imgImage2434}')`,
          width: Math.round(127 * 1.2) + 'px',
          height: Math.round(68 * 1.2) + 'px'
        }} 
      />
      <div 
        className="rounded-[4.548px] bg-cover bg-center bg-no-repeat" 
        style={{ 
          backgroundImage: `url('${imgImage2435}')`,
          width: Math.round(127 * 1.2) + 'px',
          height: Math.round(59 * 1.2) + 'px'
        }} 
      />
    </div>
  );
}

function Group1272630214() {
  return (
    <div className="relative flex flex-col gap-2" style={{ width: Math.round(124 * 1.2) + 'px' }}>
      <div 
        className="rounded-[4.548px] bg-cover bg-center bg-no-repeat" 
        style={{ 
          backgroundImage: `url('${imgImage2430}')`,
          width: Math.round(122 * 1.2) + 'px',
          height: Math.round(37 * 1.2) + 'px'
        }} 
      />
      <div 
        className="rounded-[4.548px] bg-cover bg-center bg-no-repeat" 
        style={{ 
          backgroundImage: `url('${imgImage2436}')`,
          width: Math.round(124 * 1.2) + 'px',
          height: Math.round(129 * 1.2) + 'px'
        }} 
      />
    </div>
  );
}

function Group1272630215() {
  return (
    <div className="flex items-center gap-4" style={{ minWidth: Math.round(758 * 1.2) + 'px' }}>
      <Group1272630211 />
      <div className="relative flex flex-col gap-2" style={{ width: Math.round(118 * 1.2) + 'px' }}>
        <div 
          className="rounded-[5.048px] bg-cover bg-center bg-no-repeat" 
          style={{ 
            backgroundImage: `url('${imgImage2422}')`,
            width: Math.round(118 * 1.2) + 'px',
            height: Math.round(128 * 1.2) + 'px'
          }} 
        />
      </div>
      <Group1272630212 />
      <div className="relative flex flex-col gap-2" style={{ width: Math.round(118 * 1.2) + 'px' }}>
        <div 
          className="rounded-[7.012px] bg-cover bg-center bg-no-repeat" 
          style={{ 
            backgroundImage: `url('${imgImage2423}')`,
            width: Math.round(118 * 1.2) + 'px',
            height: Math.round(151 * 1.2) + 'px'
          }} 
        />
      </div>
      <Group1272630213 />
      <Group1272630214 />
    </div>
  );
}

export default function Autoscroll({ leftGradient = '#B2DCB1', rightGradient = '#B2DCB1' }) {
  return (
    <div className="relative w-full overflow-hidden bg-transparent" style={{ height: Math.round(168 * 1.2) + 'px' }} data-name="Autoscroll">
      {/* Left gradient fade */}
      <div className="absolute left-0 top-0 bottom-0 w-[58px] bg-gradient-to-r to-transparent z-10 pointer-events-none" style={{ background: `linear-gradient(to right, ${leftGradient}, transparent)` }} />
      
      {/* Right gradient fade */}
      <div className="absolute right-0 top-0 bottom-0 w-[58px] bg-gradient-to-l to-transparent z-10 pointer-events-none" style={{ background: `linear-gradient(to left, ${rightGradient}, transparent)` }} />
      
      {/* Infinite scrolling container */}
      <div className="flex animate-scroll-left items-center" style={{ height: '100%' }}>
        {/* First set of images */}
        <div className="flex-shrink-0" style={{ minWidth: Math.round(758 * 1.2) + 'px' }}>
          <Group1272630215 />
        </div>

        {/* Second set of images (duplicate for seamless loop) */}
        <div className="flex-shrink-0" style={{ minWidth: Math.round(758 * 1.2) + 'px' }}>
          <Group1272630215 />
        </div>

        {/* Third set for extra smooth scrolling */}
        <div className="flex-shrink-0" style={{ minWidth: Math.round(758 * 1.2) + 'px' }}>
          <Group1272630215 />
        </div>
      </div>

      {/* CSS Animation - Updated for new width */}
      <style jsx="true">{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-${Math.round(758 * 1.2)}px);
          }
        }
        
        .animate-scroll-left {
          animation: scroll-left 15s linear infinite;
        }
      `}</style>
    </div>
  );
}