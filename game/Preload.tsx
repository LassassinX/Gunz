"use client"
import * as sounds from "./gameUtils/sounds"

export default () => {
	return <>
		{
			Object.values(sounds).map((sound, i) => {
				if (typeof sound === 'string')
					return 	<audio preload="true" autoPlay={true} muted={true} src={sound} key={i}></audio>
				else
					return null
			})
		}
	</> 

}