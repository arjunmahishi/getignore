const axios = require("axios")
const cheerio = require("cheerio")

axios.get("https://github.com/github/gitignore").then(res => {
	ignores = parsePage(res.data)
	console.log(ignores.length)
})

const parsePage = (html) => {
	let links = []
	const $ = cheerio.load(html)

	$('a.js-navigation-open').each((i, ele) => {
		title = ele.attribs.title
		if (title != undefined) links.push(title)
	})

	return links.filter(link => link.includes(".gitignore"))
}
