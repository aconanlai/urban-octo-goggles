for i in *.mp4;
  do name=`echo $i | cut -d'.' -f1`;
  # ffmpeg -i "$i" "${name}.mov";
  ffmpeg -i "$i" -vcodec libx264 -profile:v main -level 3.1 -preset medium -crf 23 -x264-params ref=4 -acodec copy -movflags +faststart "${name}-converted.mp4";
done