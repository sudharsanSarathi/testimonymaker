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

export default function Autoscroll() {
  return (
    <div className="relative w-full overflow-hidden bg-transparent py-8" style={{ height: '200px' }} data-name="Autoscroll">
      {/* Left gradient fade */}
      <div className="absolute left-0 top-0 bottom-0 w-[58px] bg-gradient-to-r from-[#b3dcb1] to-transparent z-10 pointer-events-none" />
      
      {/* Right gradient fade */}
      <div className="absolute right-0 top-0 bottom-0 w-[58px] bg-gradient-to-l from-[#b3dcb1] to-transparent z-10 pointer-events-none" />
      
      {/* Infinite scrolling container */}
      <div className="flex animate-scroll-left items-center" style={{ height: '100%' }}>
        {/* First set of images - 30% smaller width, 20% larger images */}
        <div className="flex-shrink-0 flex items-center gap-5" style={{ width: '980px' }}>
          {/* Group 1 - Left side images - 20% larger */}
          <div className="relative flex flex-col gap-2" style={{ width: Math.round(115 * 1.2) + 'px' }}>
            <div 
              className="rounded-[4.548px] bg-cover bg-center bg-no-repeat" 
              style={{ 
                backgroundImage: `url('${imgImage2434}')`,
                width: Math.round(115 * 1.2) + 'px',
                height: Math.round(61 * 1.2) + 'px'
              }} 
            />
            <div 
              className="rounded-[4.548px] bg-cover bg-center bg-no-repeat" 
              style={{ 
                backgroundImage: `url('${imgImage2435}')`,
                width: Math.round(114 * 1.2) + 'px',
                height: Math.round(54 * 1.2) + 'px'
              }} 
            />
          </div>

          {/* Group 2 - Second column - 20% larger */}
          <div className="relative flex flex-col gap-2" style={{ width: Math.round(106 * 1.2) + 'px' }}>
            <div 
              className="rounded-[4.548px] bg-cover bg-center bg-no-repeat" 
              style={{ 
                backgroundImage: `url('${imgImage2422}')`,
                width: Math.round(106 * 1.2) + 'px',
                height: Math.round(115 * 1.2) + 'px'
              }} 
            />
          </div>

          {/* Group 3 - Third column - 20% larger */}
          <div className="relative flex flex-col gap-2" style={{ width: Math.round(110 * 1.2) + 'px' }}>
            <div 
              className="rounded-[4.548px] bg-cover bg-center bg-no-repeat" 
              style={{ 
                backgroundImage: `url('${imgImage2428}')`,
                width: Math.round(110 * 1.2) + 'px',
                height: Math.round(48 * 1.2) + 'px'
              }} 
            />
            <div 
              className="rounded-[4.548px] bg-cover bg-center bg-no-repeat" 
              style={{ 
                backgroundImage: `url('${imgImage2431}')`,
                width: Math.round(110 * 1.2) + 'px',
                height: Math.round(52 * 1.2) + 'px'
              }} 
            />
          </div>

          {/* Group 4 - Fourth column - 20% larger */}
          <div className="relative flex flex-col gap-2" style={{ width: Math.round(106 * 1.2) + 'px' }}>
            <div 
              className="rounded-[6.317px] bg-cover bg-center bg-no-repeat" 
              style={{ 
                backgroundImage: `url('${imgImage2423}')`,
                width: Math.round(106 * 1.2) + 'px',
                height: Math.round(136 * 1.2) + 'px'
              }} 
            />
          </div>

          {/* Group 5 - Fifth column - 20% larger */}
          <div className="relative flex flex-col gap-2" style={{ width: Math.round(111 * 1.2) + 'px' }}>
            <div 
              className="rounded-[4.548px] bg-cover bg-center bg-no-repeat" 
              style={{ 
                backgroundImage: `url('${imgImage2419}')`,
                width: Math.round(111 * 1.2) + 'px',
                height: Math.round(105 * 1.2) + 'px'
              }} 
            />
            <div 
              className="rounded-[4.548px] bg-cover bg-center bg-no-repeat" 
              style={{ 
                backgroundImage: `url('${imgImage2427}')`,
                width: Math.round(111 * 1.2) + 'px',
                height: Math.round(35 * 1.2) + 'px'
              }} 
            />
          </div>

          {/* Group 6 - Sixth column - 20% larger */}
          <div className="relative flex flex-col gap-2" style={{ width: Math.round(112 * 1.2) + 'px' }}>
            <div 
              className="rounded-[4.548px] bg-cover bg-center bg-no-repeat" 
              style={{ 
                backgroundImage: `url('${imgImage2430}')`,
                width: Math.round(110 * 1.2) + 'px',
                height: Math.round(33 * 1.2) + 'px'
              }} 
            />
            <div 
              className="rounded-[4.548px] bg-cover bg-center bg-no-repeat" 
              style={{ 
                backgroundImage: `url('${imgImage2436}')`,
                width: Math.round(112 * 1.2) + 'px',
                height: Math.round(116 * 1.2) + 'px'
              }} 
            />
          </div>

          {/* Additional spacing to complete the row */}
          <div style={{ width: '80px' }}></div>
        </div>

        {/* Second set of images (duplicate for seamless loop) - 30% smaller width, 20% larger images */}
        <div className="flex-shrink-0 flex items-center gap-5" style={{ width: '980px' }}>
          {/* Group 1 - Left side images - 20% larger */}
          <div className="relative flex flex-col gap-2" style={{ width: Math.round(115 * 1.2) + 'px' }}>
            <div 
              className="rounded-[4.548px] bg-cover bg-center bg-no-repeat" 
              style={{ 
                backgroundImage: `url('${imgImage2434}')`,
                width: Math.round(115 * 1.2) + 'px',
                height: Math.round(61 * 1.2) + 'px'
              }} 
            />
            <div 
              className="rounded-[4.548px] bg-cover bg-center bg-no-repeat" 
              style={{ 
                backgroundImage: `url('${imgImage2435}')`,
                width: Math.round(114 * 1.2) + 'px',
                height: Math.round(54 * 1.2) + 'px'
              }} 
            />
          </div>

          {/* Group 2 - Second column - 20% larger */}
          <div className="relative flex flex-col gap-2" style={{ width: Math.round(106 * 1.2) + 'px' }}>
            <div 
              className="rounded-[4.548px] bg-cover bg-center bg-no-repeat" 
              style={{ 
                backgroundImage: `url('${imgImage2422}')`,
                width: Math.round(106 * 1.2) + 'px',
                height: Math.round(115 * 1.2) + 'px'
              }} 
            />
          </div>

          {/* Group 3 - Third column - 20% larger */}
          <div className="relative flex flex-col gap-2" style={{ width: Math.round(110 * 1.2) + 'px' }}>
            <div 
              className="rounded-[4.548px] bg-cover bg-center bg-no-repeat" 
              style={{ 
                backgroundImage: `url('${imgImage2428}')`,
                width: Math.round(110 * 1.2) + 'px',
                height: Math.round(48 * 1.2) + 'px'
              }} 
            />
            <div 
              className="rounded-[4.548px] bg-cover bg-center bg-no-repeat" 
              style={{ 
                backgroundImage: `url('${imgImage2431}')`,
                width: Math.round(110 * 1.2) + 'px',
                height: Math.round(52 * 1.2) + 'px'
              }} 
            />
          </div>

          {/* Group 4 - Fourth column - 20% larger */}
          <div className="relative flex flex-col gap-2" style={{ width: Math.round(106 * 1.2) + 'px' }}>
            <div 
              className="rounded-[6.317px] bg-cover bg-center bg-no-repeat" 
              style={{ 
                backgroundImage: `url('${imgImage2423}')`,
                width: Math.round(106 * 1.2) + 'px',
                height: Math.round(136 * 1.2) + 'px'
              }} 
            />
          </div>

          {/* Group 5 - Fifth column - 20% larger */}
          <div className="relative flex flex-col gap-2" style={{ width: Math.round(111 * 1.2) + 'px' }}>
            <div 
              className="rounded-[4.548px] bg-cover bg-center bg-no-repeat" 
              style={{ 
                backgroundImage: `url('${imgImage2419}')`,
                width: Math.round(111 * 1.2) + 'px',
                height: Math.round(105 * 1.2) + 'px'
              }} 
            />
            <div 
              className="rounded-[4.548px] bg-cover bg-center bg-no-repeat" 
              style={{ 
                backgroundImage: `url('${imgImage2427}')`,
                width: Math.round(111 * 1.2) + 'px',
                height: Math.round(35 * 1.2) + 'px'
              }} 
            />
          </div>

          {/* Group 6 - Sixth column - 20% larger */}
          <div className="relative flex flex-col gap-2" style={{ width: Math.round(112 * 1.2) + 'px' }}>
            <div 
              className="rounded-[4.548px] bg-cover bg-center bg-no-repeat" 
              style={{ 
                backgroundImage: `url('${imgImage2430}')`,
                width: Math.round(110 * 1.2) + 'px',
                height: Math.round(33 * 1.2) + 'px'
              }} 
            />
            <div 
              className="rounded-[4.548px] bg-cover bg-center bg-no-repeat" 
              style={{ 
                backgroundImage: `url('${imgImage2436}')`,
                width: Math.round(112 * 1.2) + 'px',
                height: Math.round(116 * 1.2) + 'px'
              }} 
            />
          </div>

          {/* Additional spacing to complete the row */}
          <div style={{ width: '80px' }}></div>
        </div>
      </div>

      {/* CSS Animation - Adjusted timing for new width */}
      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-980px);
          }
        }
        
        .animate-scroll-left {
          animation: scroll-left 15s linear infinite;
        }
      `}</style>
    </div>
  );
}