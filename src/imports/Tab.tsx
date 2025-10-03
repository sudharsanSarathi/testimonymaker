function Frame1430104033() {
  return (
    <div className="absolute bg-black box-border content-stretch flex gap-2.5 h-11 items-center justify-center left-0 px-[53px] py-[5px] rounded-[30px] top-0 w-[198px]">
      <div className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[12px] text-nowrap text-white">
        <p className="leading-[normal] whitespace-pre">Create a new testimonial</p>
      </div>
    </div>
  );
}

function Frame1430104032() {
  return (
    <div className="absolute h-11 left-0.5 top-0.5 w-[198px]">
      <Frame1430104033 />
    </div>
  );
}

function Group1272630217() {
  return (
    <div className="absolute contents left-0 top-0">
      <div className="absolute bg-white h-12 left-0 rounded-[30px] top-0 w-[440px]" />
      <Frame1430104032 />
    </div>
  );
}

function Frame1430104034() {
  return (
    <div className="absolute h-11 left-[205px] top-0.5 w-[198px]">
      <div className="absolute font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[0] left-[19px] not-italic text-[12px] text-black text-nowrap top-3.5">
        <p className="leading-[normal] whitespace-pre">Highlight words in screenshot</p>
      </div>
    </div>
  );
}

function Group1272630218() {
  return (
    <div className="absolute contents left-0 top-0">
      <Group1272630217 />
      <Frame1430104034 />
    </div>
  );
}

export default function Tab() {
  return (
    <div className="relative size-full" data-name="tab">
      <Group1272630218 />
    </div>
  );
}