ffmpeg -y -i aaagh1.mp3 -ar 16000 -ab 48k -codec:a libmp3lame -ac 1 aaagh1_enc.mp3
aws s3 cp aaagh1_enc.mp3 s3://alexa-ghosts/aaagh1_enc.mp3
