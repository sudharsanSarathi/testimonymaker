import svgPaths from "./svg-q4d4iak94h";
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
    <div className="content-stretch flex items-start justify-center overflow-clip relative shrink-0 w-2" data-name="Auto Layout Horizontal">
      <AutoLayoutVertical />
    </div>
  );
}

function Frame() {
  return <div className="absolute bg-no-repeat bg-size-[100%_100%] bg-top-left blur-sm filter h-[177.31px] left-1/2 translate-x-[-50%] translate-y-[-50%] w-[330px]" data-name="Frame" style={{ top: "calc(50% - 0.01px)", backgroundImage: `url('${imgFrame}')` }} />;
}

function ImageFrame() {
  return <div className="absolute bg-[rgba(180,86,86,0.2)] h-44 translate-x-[-50%] translate-y-[-50%] w-[324px]" data-name="image frame" style={{ top: "calc(50% + 0.155px)", left: "calc(50% - 3px)" }} />;
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
    <div className="absolute content-stretch flex items-center justify-center left-[3px] max-w-[330px] overflow-clip rounded-[6px] top-[3px] w-[318px]" data-name="Auto Layout Horizontal">
      <Frame1 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="h-[182px] max-w-[336px] relative shrink-0 w-[317px]" data-name="Frame">
      <AutoLayoutHorizontal1 />
    </div>
  );
}

function AutoLayoutHorizontal2() {
  return (
    <div className="bg-[#ffffff] content-stretch flex flex-col items-start justify-start relative rounded-bl-[7.5px] rounded-br-[7.5px] rounded-tr-[7.5px] shrink-0 w-[322px]" data-name="Auto Layout Horizontal">
      <Frame2 />
    </div>
  );
}

function AutoLayoutHorizontal3() {
  return (
    <div className="box-border content-stretch flex flex-col gap-1 items-start justify-start mb-[-10px] pl-0 pr-[31.38px] py-0 relative shrink-0 w-[326.38px]" data-name="Auto Layout Horizontal">
      <AutoLayoutHorizontal2 />
      <div className="flex flex-col font-['Helvetica_Neue:Regular',_sans-serif] justify-center leading-[19px] not-italic relative shrink-0 text-[#111b21] text-[14.2px] text-nowrap whitespace-pre">
        <p className="mb-0">{`Hey, did you get a chance to see the new Figr `}</p>
        <p>website?</p>
      </div>
    </div>
  );
}

function AutoLayoutVertical1() {
  return (
    <div className="box-border content-stretch flex flex-col items-end justify-start pb-[13px] pl-[9px] pr-[7px] pt-1.5 relative shrink-0 w-[342.38px]" data-name="Auto Layout Vertical">
      <AutoLayoutHorizontal3 />
      <div className="flex flex-col font-['Helvetica_Neue:Regular',_sans-serif] justify-center leading-[0] mb-[-10px] not-italic relative shrink-0 text-[#667781] text-[11px] text-nowrap">
        <p className="leading-[15px] whitespace-pre">17:07</p>
      </div>
    </div>
  );
}

function AutoLayoutHorizontal4() {
  return (
    <div className="bg-[#ffffff] box-border content-stretch flex h-[249px] items-start justify-start relative rounded-bl-[7.5px] rounded-br-[7.5px] rounded-tr-[7.5px] shadow-[0px_1px_0.5px_0px_rgba(11,20,26,0.13)] shrink-0 w-[342px]" data-name="Auto Layout Horizontal">
      <AutoLayoutVertical1 />
    </div>
  );
}

export default function ImageAndTextMessage() {
  return (
    <div className="content-stretch flex items-start justify-start relative rounded-[7.5px] size-full" data-name="Image and text message">
      <AutoLayoutHorizontal />
      <AutoLayoutHorizontal4 />
    </div>
  );
}