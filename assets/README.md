# Product demo videos

Place the product walkthrough videos in this directory:

- `analyze-demo.mp4`: the Analyze / DocPilot walkthrough.
- `extract-demo.mp4`: the Extract / DataMosaic walkthrough.

WebM is also supported: `analyze-demo.webm` and `extract-demo.webm`.
If both formats are present, the player uses MP4.

The Product cards' **Demo** buttons open a video dialog. Without a video,
the dialog shows a workflow preview and **Video coming soon**. A playback
error also falls back to the preview.

After adding or replacing a video, rebuild the frontend: restart `./start.sh`
for script deployment, or run `docker compose up -d --no-deps --build web`
for Docker deployment. Vite packages the videos with the frontend, so no
additional backend endpoint or proxy route is needed.
