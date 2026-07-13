export function SystemArchitecture() {
  return <figure className="system-architecture" data-reveal>
    <div className="system-window-bar">
      <span>system / ai-orchestration</span>
      <span>05 services</span>
    </div>
    <ol className="system-flow" aria-label="AI workflow architecture">
      <li><span>01</span><div><small>Interface</small><strong>FastAPI gateway</strong></div></li>
      <li><span>02</span><div><small>Control plane</small><strong>Async orchestration</strong></div></li>
      <li className="system-services"><span>03</span><div><small>Model services</small><div><b>Agents</b><b>Retrieval</b><b>Generation</b></div></div></li>
      <li><span>04</span><div><small>Reliability</small><strong>Cache · Retry · Fallback</strong></div></li>
      <li><span>05</span><div><small>Output</small><strong>Results + evaluation</strong></div></li>
    </ol>
    <figcaption><span className="architecture-pulse" />A compact view of the platform work behind the interface.</figcaption>
  </figure>
}
