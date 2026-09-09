/**
 * Textura de papel mimeografado aplicada sobre toda a página.
 * Fixa, decorativa e sem custo de interação.
 */
export function PaperTexture() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50">
      <div className="paper-grain absolute inset-0" />
      <div className="paper-dots absolute inset-0" />
    </div>
  );
}
