"""Rebrand the existing workflow animation without changing its timing/content."""
from pathlib import Path
import subprocess
import imageio_ffmpeg
root=Path(__file__).resolve().parents[1]
ff=imageio_ffmpeg.get_ffmpeg_exe()
# Extend the adjacent blank background over the old title, then compose the SVG-rendered label.
filters='[0:v]split[base][patch];[patch]crop=280:45:400:45[bg];[base][bg]overlay=114:45[clean];[clean][1:v]overlay=114:45,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a[out]'
subprocess.run([ff,'-y','-v','error','-i',str(root/'OntoMosaic-Text2SQL-demo.gif'),'-i',str(root/'ontomosaic-db-source/title.png'),'-filter_complex',filters,'-map','[out]','-loop','0',str(root/'OntoMosaic-DB-demo.gif')],check=True)
