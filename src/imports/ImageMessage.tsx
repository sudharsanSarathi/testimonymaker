import svgPaths from "./svg-3r109npxqd";
import imgFrame from "figma:asset/d6d85b86ac35534cc227a7c159b4e7e14daa5bb3.png";

function AutoLayoutVertical() {
  return (
    <div className="h-[13px] relative shrink-0 w-2" data-name="Auto Layout Vertical">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 13">
        <g id="Auto Layout Vertical">
          <path d={svgPaths.p363bcd00} fill="var(--fill-0, black)" id="Vector" opacity="0.13" />
          <path d={svgPaths.p1ba102c0} fill="var(--fill-0, white)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function AutoLayoutHorizontal() {
  return (
    <div className="absolute content-stretch flex items-start justify-center left-0 overflow-clip top-0.5 w-2" data-name="Auto Layout Horizontal">
      <AutoLayoutVertical />
    </div>
  );
}

function Frame() {
  return <div className="absolute bg-no-repeat bg-size-[100%_100%] bg-top-left blur-sm filter h-[177.31px] left-1/2 translate-x-[-50%] translate-y-[-50%] w-[330px]" data-name="Frame" style={{ top: "calc(50% - 0.01px)", backgroundImage: `url('${imgFrame}')` }} />;
}

function ImageFrame() {
  return <div className="absolute bg-[rgba(180,86,86,0.2)] h-[175.69px] left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] w-[330px]" data-name="image frame" />;
}

function Frame1() {
  return (
    <div className="basis-0 grow h-[175.69px] min-h-px min-w-px relative shrink-0" data-name="Frame">
      <Frame />
      <ImageFrame />
    </div>
  );
}

function AutoLayoutHorizontal1() {
  return (
    <div className="absolute content-stretch flex items-center justify-center left-[3px] max-w-[330px] overflow-clip rounded-[6px] top-[3px] w-[330px]" data-name="Auto Layout Horizontal">
      <Frame1 />
      <div className="absolute bg-gradient-to-t bottom-[0.01px] from-[#0b141a80] h-7 left-0 right-0 to-[#0b141a00]" data-name="Rectangle" />
    </div>
  );
}

function Frame2() {
  return (
    <div className="h-[181.69px] max-w-[336px] relative shrink-0 w-[336px]" data-name="Frame">
      <AutoLayoutHorizontal1 />
      <div className="absolute flex flex-col font-['Helvetica_Neue:Regular',_sans-serif] justify-center leading-[0] left-[301.11px] not-italic text-[10px] text-[rgba(255,255,255,0.9)] text-nowrap top-[168.18px] translate-y-[-50%]">
        <p className="leading-[15px] whitespace-pre">17:10</p>
      </div>
    </div>
  );
}

function AutoLayoutHorizontal2() {
  return (
    <div className="absolute bg-[#ffffff] bottom-[0.31px] box-border content-stretch flex items-start justify-start left-2 right-0 rounded-bl-[7.5px] rounded-br-[7.5px] rounded-tr-[7.5px] shadow-[0px_1px_0.5px_0px_rgba(11,20,26,0.13)] top-0.5" data-name="Auto Layout Horizontal">
      <Frame2 />
    </div>
  );
}

export default function ImageMessage() {
  return (
    <div className="relative rounded-[7.5px] size-full" data-name="Image message">
      <AutoLayoutHorizontal />
      <AutoLayoutHorizontal2 />
    </div>
  );
}