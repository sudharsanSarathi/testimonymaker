import svgPaths from "./svg-ao7k4qyvow";
import { imgGroup } from "./svg-dn50e";

function Group() {
  return (
    <div className="absolute bottom-[77.42%] left-[0.28%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-1px_0px] mask-size-[8px_13px] right-[97.72%] top-0" data-name="Group" style={{ maskImage: `url('${imgGroup}')` }}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 13">
        <g id="Group">
          <path d={svgPaths.p2c424000} fill="var(--fill-0, black)" id="Vector" opacity="0.13" />
          <path d={svgPaths.p28507500} fill="var(--fill-0, white)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function ClipPathGroup() {
  return (
    <div className="absolute bottom-[75.92%] contents left-0 right-[97.72%] top-0" data-name="Clip path group">
      <Group />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute bottom-[3.7%] left-[2.28%] right-[0.18%] top-0" data-name="Group">
      <div className="absolute bottom-[-2.88%] left-[-0.15%] right-[-0.15%] top-0">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 344 54">
          <g filter="url(#filter0_d_3_113)" id="Group">
            <path d={svgPaths.p2013e600} fill="var(--fill-0, white)" id="Vector" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="53.5" id="filter0_d_3_113" width="343.38" x="0.5" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="1" />
              <feGaussianBlur stdDeviation="0.25" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.0431373 0 0 0 0 0.0784314 0 0 0 0 0.101961 0 0 0 0.13 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_3_113" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_3_113" mode="normal" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function AutoLayoutHorizontal() {
  return (
    <div className="absolute box-border content-stretch flex inset-[11.11%_1.89%_18.52%_5.13%] items-start justify-start pl-0 pr-[31.38px] py-0" data-name="Auto Layout Horizontal">
      <div className="flex flex-col font-['Helvetica_Neue:Regular',_sans-serif] justify-center leading-[19px] not-italic relative shrink-0 text-[#111b21] text-[14.2px] text-nowrap whitespace-pre">
        <p className="mb-0">{`Hey, did you get a chance to see the new Figr `}</p>
        <p>website?kjfsdjk</p>
      </div>
    </div>
  );
}

function Group1272630209() {
  return (
    <div className="absolute contents inset-[11.11%_1.89%_9.26%_5.13%]">
      <AutoLayoutHorizontal />
      <div className="absolute flex flex-col font-['Helvetica_Neue:Regular',_sans-serif] inset-[62.96%_1.89%_9.26%_90.14%] justify-center leading-[0] not-italic text-[#667781] text-[11px] text-nowrap">
        <p className="leading-[15px] whitespace-pre">17:07</p>
      </div>
    </div>
  );
}

export default function TextMessage() {
  return (
    <div className="relative size-full" data-name="Text message">
      <ClipPathGroup />
      <Group1 />
      <Group1272630209 />
    </div>
  );
}