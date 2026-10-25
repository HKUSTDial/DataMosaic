# Product demo videos

Place the product walkthrough videos in this directory:

- `analyze-demo.mp4`: the DocMosaic walkthrough.
- `extract-demo.mp4`: the DBMosaic walkthrough.

WebM is also supported: `analyze-demo.webm` and `extract-demo.webm`.
If both formats are present, the player uses MP4.

The Product cards' **Demo** buttons open a video dialog. Without a video,
the dialog shows a workflow preview and **Video coming soon**. A playback
error also falls back to the preview.

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
