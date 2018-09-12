const axios = require("axios")
const cheerio = require("cheerio")

args = process.argv

if (args.length < 3) {
	console.log("Please mention a .gitignore name")
	process.exit()
}

// console.log("Looking for the appropriate .gitignore file")
axios.get("https://github.com/github/gitignore").then(res => {
	ignores = parsePage(res.data).filter(ign => ign.toLowerCase().includes(args[2].toLowerCase()))
	if (ignores[0]) {
		// console.log("Found: ", ignores[0], ", fetching its contents")
		axios.get(`https://raw.githubusercontent.com/github/gitignore/master/${ignores[0]}`).then(file => {
			console.log(file.data)
		})
	}else{
		console.log("Couldn't find it. Sorry!")
	}
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
