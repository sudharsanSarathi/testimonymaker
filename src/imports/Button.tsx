export default function Button() {
  return (
    <div className="bg-[#04a444] relative rounded-[8px] shadow-[0px_4px_0px_0px_#000000] size-full" data-name="button">
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex gap-2.5 items-center justify-center px-[84px] py-4 relative size-full">
          <div className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[12px] text-nowrap">
            <p className="leading-[normal] whitespace-pre">Add to chat</p>
          </div>
        </div>
      </div>
    </div>
  );
}