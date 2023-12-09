import { getRandomFromArray } from "../utils/functions"

const randomColors = ['#ff2a6d', '#d1f7ff', '#05d9e8', '#7f46fa', '#053fed', '#f37b29', '#7ED7C1', '#A7D397', '#D4ADFC', '#FA2FB5', '#10d902']

export const getRandomColor = ():string => {
	return getRandomFromArray(randomColors)
}

export default randomColors