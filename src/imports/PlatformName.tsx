import imgImage2440 from "figma:asset/c5ce0adc7eea34ba9a39faded395244025fe4a0f.png";
import imgImage2441 from "figma:asset/714f454dd81357b3380e5a8802a30600c95b5efe.png";
import imgImage2442 from "figma:asset/246a70c155ba2500099383dafa16f07918df8665.png";

function Instagram() {
  return (
    <div className="absolute h-[99px] left-[35px] top-[59px] w-[100px]" data-name="Instagram">
      <div className="absolute bg-[7.35%_71.88%] bg-no-repeat bg-size-[236%_132.32%] h-[99px] left-0 top-0 w-[100px]" data-name="image 2440" style={{ backgroundImage: `url('${imgImage2440}')` }} />
    </div>
  );
}

function Whatsapp() {
  return (
    <div className="absolute h-[103px] left-[188px] top-[35px] w-[100px]" data-name="whatsapp">
      <div className="absolute bg-[92.65%_67.86%] bg-no-repeat bg-size-[236%_127.18%] h-[103px] left-0 top-0 w-[100px]" data-name="image 2443" style={{ backgroundImage: `url('${imgImage2440}')` }} />
    </div>
  );
}

function Linkedin() {
  return (
    <div className="absolute h-[100px] left-[330px] top-[237px] w-[102px]" data-name="Linkedin">
      <div className="absolute bg-[58.62%_46.67%] bg-no-repeat bg-size-[128.43%_115%] h-[100px] left-0 top-0 w-[102px]" data-name="image 2441" style={{ backgroundImage: `url('${imgImage2441}')` }} />
    </div>
  );
}

function Telegram() {
  return (
    <div className="absolute h-[100px] left-[201px] top-[237px] w-[101px]" data-name="telegram">
      <div className="absolute bg-[66.67%_38.1%] bg-no-repeat bg-size-[123.76%_121%] h-[100px] left-0 top-0 w-[101px]" data-name="image 2442" style={{ backgroundImage: `url('${imgImage2442}')` }} />
    </div>
  );
}

export default function PlatformName() {
  return (
    <div className="bg-white relative size-full" data-name="platform name">
      <Instagram />
      <Whatsapp />
      <Linkedin />
      <Telegram />
      <Instagram />
      <Whatsapp />
      <Linkedin />
      <Telegram />
    </div>
  );
}