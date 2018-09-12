#! /usr/bin/env node

const axios = require("axios")
const cheerio = require("cheerio")
const fs = require("fs")

args = process.argv

if (args.length < 3) {
	console.log("Please mention a .gitignore type\n\n\tExample: \n\t\t1. getignored go\n\t\t2. getignored python\n\t\t3. getignored node")
	process.exit()
}

const parsePage = (html) => {
	let links = []
	const $ = cheerio.load(html)

	$('a.js-navigation-open').each((i, ele) => {
		title = ele.attribs.title
		if (title != undefined) links.push(title)
	})

	return links.filter(link => link.includes(".gitignore"))
}

const printIgnore = (name) => {
	axios.get(`https://raw.githubusercontent.com/github/gitignore/master/${name}`).then(file => {
		console.log(file.data)
	}).catch(err => console.log("Could not fetch the file at this time. Please check your network connection and try again"))
}

const searchFile = (names) => {
	fs.readFile("./.ignore-names", (err, data) => {
		if (err) {
			names(null)
			return 
		} 
		names(JSON.parse(data).names)
	})
}

const scrapeRepo = (call) => {
	axios.get("https://github.com/github/gitignore").then(res => {
		ignoreNames = parsePage(res.data)
		fs.writeFile("./.ignore-names", JSON.stringify({names: ignoreNames}), () => {})
		call(ignoreNames)
	}).catch(err => {
		call(null)
	})
}

const getIgnoreNames = (call) => {
	searchFile(names => {
		if (names != null) call(names)
		else scrapeRepo(names => {
			call(names)
		})		
	})
}

getIgnoreNames(names => {
	if (names == null) {
		console.log("Couldn't connect to the gitignore repo")
		return
	}

	let name = names.filter(name => name.toLowerCase().includes(args[2].toLowerCase()))[0]
	if (name) {
		printIgnore(name)
	} else console.log("The .gitignore type you are looking for couldn't be found. Sorry!") 
})