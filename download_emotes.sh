#!/bin/bash

is_custom_emotes=0
is_animated_emotes=0

if [ ! -d src/img/emotes/ ]
then
	echo "Error: folder not found src/img/emotes/"
	exit 1
fi

while IFS='' read -r line
do
	if [[ "$line" =~ ^const\ emoteMappings ]]
	then
		is_custom_emotes=1
		continue
	fi
	if [[ "$line" =~ ^const\ animatedEmoteMappings ]]
	then
		is_animated_emotes=1
		continue
	fi
	if [[ "$line" == "}" ]]
	then
		is_custom_emotes=0
		is_animated_emotes=0
		continue
	fi
	match=0
	if [[ "$line" =~ ^\ *"'"(.*)"'":\ "'"([0-9]+)"'", ]]
	then
		emote_name="${BASH_REMATCH[1]}"
		emote_id="${BASH_REMATCH[1]}"
		match=1
	fi

	[[ "$match" == "1" ]] || continue

	if [[ "$is_custom_emotes" == "1" ]]
	then
		echo "emote: $emote_name"
		wget -O "src/img/emotes/$emote_name.png" "https://cdn.discordapp.com/emojis/$emote_id.png"
	fi
	# works but we do not need it for now
	# we put the discord link there anyways
	# if [[ "$is_animated_emotes" == "1" ]]
	# then
	# 	echo "anim: $emote_name"
	# 	wget -O "$emote_name.gif" "https://cdn.discordapp.com/emojis/$emote_id.gif?size=80&quality=lossless"
	# fi
done < src/emotes.ts

