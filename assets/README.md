# Product demo assets

Workflow cards display these animations:

- `DocMosaic-demo.gif`: the DocMosaic card.
- `DBMosaic-demo.gif`: the DBMosaic card.
- `StructMosaic-demo.gif`: the StructMosaic card, converted from `structmosaic.mp4` with looping playback.
- `OntoMosaic-Doc-demo.gif`: the OntoMosaic-Doc card.
- `OntoMosaic-DB-demo.gif`: the OntoMosaic-DB card and video fallback.
- `OntoMosaic-Enterprise-demo.gif`: the OntoMosaic-Enterprise card, converted from `OntoMosaic-Enterprise-demo.mp4` with looping playback.

The full animation is fitted inside a shared 2:1 frame without cropping.

The DocMosaic card has **Demo-Agentic** and **Demo-Interactive** buttons.
Each opens its own narrated, full-HD product video, including on GitHub Pages:

- `DocMosaic-agentic-product-v2.mp4` (37.2 seconds): an agent locates evidence,
  extracts financial values, generates and executes Python, and verifies the answer.
- `DocMosaic-interaction-flight-product.mp4` (44 seconds): a paper plane follows
  the evidence through the report, collects source-linked values, and traces
  answer citations back to the original pages.

Both illustrate a saved, successful Nike FY2021 inventory-turnover run. Cost of
sales is 24,576 million USD (E3, PDF p.59); inventories are 6,854 and 7,367 million
USD (E4, PDF p.61). The verified result is 3.46 times. The animation timing is
condensed and does not represent a fresh model run or a latency measurement.
Both films use synthetic English narration.

Video-generation scripts, source PDFs, runtime logs, prior UI recordings,
narration sidecars, and intermediate exports are not included in this website
update. The portal imports only the two product videos above.

`extract-demo.mp4` remains the DBMosaic walkthrough for the local portal
(WebM is also supported). The ontology **Demo** button plays `OntoMosaic-DB-demo.mp4` (30 seconds), including on GitHub Pages. Its onscreen branding, English narration and subtitles use OntoMosaic-DB; playback errors fall back to the GIF.

After adding or replacing a video, rebuild the frontend: restart `./start.sh`
for script deployment, or run `docker compose up -d --no-deps --build web`
for Docker deployment. Vite packages the videos with the frontend, so no
additional backend endpoint or proxy route is needed.

## Research figures

- `research/datamosaic-framework.png`: the shared DataMosaic system overview for
  the research and demo papers, rendered from Figure 1 (page 2) of the
  [VLDB demo PDF](https://www.vldb.org/pvldb/vol19/p4570-zhang.pdf).
  The research paper's PDF was unavailable when the thumbnails were added;
  both entries intentionally use this same system overview, not distinct figures.
- `research/docpilot-framework.png`: the original framework diagram copied from
  `module/DocPilot/assets/framework.png`.

These figures are bundled locally with the portal. Publication titles and
labels within the original diagrams are preserved independently of UI names.
