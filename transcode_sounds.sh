ffmpeg -y -i aaagh1.mp3 -ar 16000 -ab 48k -codec:a libmp3lame -ac 1 aaagh1-enc.mp3
aws s3 cp aaagh1-enc.mp3 s3://alexa-ghosts/aaagh1.mp3 --acl public-read

ffmpeg -y -i cant-hear.mp3 -ar 16000 -ab 48k -codec:a libmp3lame -ac 1 cant-hear-enc.mp3
aws s3 cp cant-hear-enc.mp3 s3://alexa-ghosts/cant-hear.mp3 --acl public-read

ffmpeg -y -i i-see-dead-people.mp3 -ar 16000 -ab 48k -codec:a libmp3lame -ac 1 i-see-dead-people-enc.mp3
aws s3 cp i-see-dead-people-enc.mp3 s3://alexa-ghosts/i-see-dead-people.mp3 --acl public-read

ffmpeg -y -i creepy.mp3 -ar 16000 -ab 48k -codec:a libmp3lame -ac 1 creepy-enc.mp3
aws s3 cp creepy-enc.mp3 s3://alexa-ghosts/creepy.mp3 --acl public-read

ffmpeg -y -i creepy-ghost-scream.mp3 -ar 16000 -ab 48k -codec:a libmp3lame -ac 1 creepy-ghost-scream-enc.mp3
aws s3 cp creepy-ghost-scream-enc.mp3 s3://alexa-ghosts/creepy-ghost-scream.mp3 --acl public-read
