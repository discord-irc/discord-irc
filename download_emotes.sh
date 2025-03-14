#!/bin/bash

is_custom_emotes=0
is_animated_emotes=0

mkdir -p tmp

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
	if [[ "$line" =~ ^\ *"'"?([^"'"]+)"'"?:\ "'"([0-9]+)"'"(,|$) ]]
	then
		emote_name="${BASH_REMATCH[1]}"
		emote_id="${BASH_REMATCH[2]}"
		match=1
	fi

	[[ "$match" == "1" ]] || continue

	if [[ "$is_custom_emotes" == "1" ]]
	then
		echo -n "emote: $emote_name ... "
		dst_file="src/img/emotes/$emote_name.png"
		if [ -f "$dst_file" ]
		then
			if file "$dst_file" | grep -q "PNG image"
			then
				echo "OK (cache)"
				continue
			else
				echo "cache is not PNG downloading"
			fi
		else
			echo "downloading"
		fi
		cdn_url="https://cdn.discordapp.com/emojis/$emote_id.png"
		if ! wget -O "tmp/$emote_name.png" "$cdn_url"
		then
			echo "Error: failed to download $emote_name with id $emote_id"
			echo "       $cdn_url"
			rm "tmp/$emote_name.png"
			exit 1
		fi
		mv "tmp/$emote_name.png" src/img/emotes/
	fi
	# works but we do not need it for now
	# we put the discord link there anyways
	# if [[ "$is_animated_emotes" == "1" ]]
	# then
	# 	echo "anim: $emote_name"
	# 	wget -O "$emote_name.gif" "https://cdn.discordapp.com/emojis/$emote_id.gif?size=80&quality=lossless"
	# fi
done < src/emotes.ts

