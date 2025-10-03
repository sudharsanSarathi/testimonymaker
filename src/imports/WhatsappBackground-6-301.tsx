import imgImage from "figma:asset/216772b72be47c45b2b975cc6d2ca591798cd09a.png";

export default function WhatsappBackground() {
  return (
    <div className="bg-[#efeae2] relative size-full" data-name="whatsapp_background">
      <div className="absolute bg-[position:200%_0%] bg-no-repeat bg-size-[99.64%_128.74%] inset-0 opacity-40" data-name="Image" style={{ backgroundImage: `url('${imgImage}')` }} />
    </div>
  );
}