// components/OfferCopy.tsx — an offer's description. Plain lines are paragraphs;
// lines that start with "• " are the package's inclusions and are drawn as a
// list. A one-paragraph offer (no "• " lines) renders exactly as a single <p>.
export function OfferCopy({ text }: { text: string | null }) {
  const lines = (text ?? '').split('\n').map((l) => l.trim()).filter(Boolean)
  const paragraphs = lines.filter((l) => !l.startsWith('• '))
  const includes = lines.filter((l) => l.startsWith('• ')).map((l) => l.slice(2))
  return (
    <>
      {paragraphs.map((p) => <p key={p} className="copy">{p}</p>)}
      {includes.length > 0 && (
        <ul className="offer-includes">
          {includes.map((item) => <li key={item}>{item}</li>)}
        </ul>
      )}
    </>
  )
}
