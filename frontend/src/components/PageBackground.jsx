import { usePageBackground } from '../hooks/usePageBackground';

export default function PageBackground() {
  const { url, overlay } = usePageBackground();

  return (
    <>
      {/* Image de fond fixe qui couvre tout */}
      <div
        className="fixed inset-0 z-0 transition-all duration-700"
        style={{
          backgroundImage: `url(${url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Overlay coloré semi-transparent pour lisibilité */}
      <div className={`fixed inset-0 z-0 ${overlay} transition-all duration-700`} />
    </>
  );
}