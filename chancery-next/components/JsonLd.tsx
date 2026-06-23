// components/JsonLd.tsx — render a JSON-LD <script> (server component).
// Escaping `<` -> < prevents any string value from closing the <script> early.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
