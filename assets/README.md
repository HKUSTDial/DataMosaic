# Product demo assets

Workflow cards display these animated GIFs:

- `DocMosaic-demo.gif`: the DocMosaic card.
- `DBMosaic-demo.gif`: the DBMosaic card.
- `OntoMosaic-Text2SQL-demo.gif`: the ontology card and its **Demo** dialog.

The full animation is fitted inside a shared 2:1 frame without cropping.

Place the product walkthrough videos in this directory:

- `analyze-demo.mp4`: the DocMosaic walkthrough.
- `extract-demo.mp4`: the DBMosaic walkthrough.

WebM is also supported: `analyze-demo.webm` and `extract-demo.webm`.
If both formats are present, the player uses MP4.

The DocMosaic and DBMosaic **Demo** buttons open a video dialog. Without a video,
the dialog shows a workflow preview and **Video coming soon**. A playback
error also falls back to the preview. The ontology **Demo** button opens its GIF
in the same dialog, with the same expand and close controls.

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
