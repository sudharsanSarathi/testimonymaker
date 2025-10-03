import imgImage from "figma:asset/216772b72be47c45b2b975cc6d2ca591798cd09a.png";

export default function WhatsappBackground() {
  return (
    <div className="relative size-full" data-name="whatsapp_background">
      <div 
        className="absolute inset-0 opacity-40" 
        data-name="Image" 
        style={{ 
          backgroundImage: `url('${imgImage}')`,
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto',
          backgroundPosition: 'top left'
        }} 
      />
    </div>
  );
}