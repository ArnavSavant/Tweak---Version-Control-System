#!/usr/bin/env node

import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { diffLines } from "diff";
import chalk from "chalk";
import { Command } from "commander";
const program = new Command();
class Tweak {
	constructor(repoPath = ".") {
		this.repoPath = path.join(repoPath, ".tweak");
		this.objectsPath = path.join(this.repoPath, "objects"); // .tweak/objects
		this.headPath = path.join(this.repoPath, "HEAD"); // .tweak/HEAD
		this.indexPath = path.join(this.repoPath, "index"); // .tweak/index

		this.init();
	}

	async init() {
		await fs.mkdir(this.objectsPath, { recursive: true });
		try {
			await fs.writeFile(this.headPath, "", { flag: "wx" });
			// wx: open for writing exclusively and fails if the file already exists
			await fs.writeFile(this.indexPath, JSON.stringify([]), { flag: "wx" });
		} catch (error) {
			console.log("Tweak already initialized");
		}
	}

	// Hash the content of the file
	hashObject(content) {
		return crypto.createHash("sha1").update(content, "utf-8").digest("hex");
	}

	// function to add a file to the staging area
	async add(fileToBeAdded) {
		//fileToBeAdded: path to the file that needs to be added path/to/file
		const fileData = await fs.readFile(fileToBeAdded, "utf-8"); //read the file
		const fileHash = this.hashObject(fileData); //hash the file content
		console.log(fileHash);

		const newFileHashedObjectPath = path.join(this.objectsPath, fileHash); //.tweak/objects/abc123
		await fs.writeFile(newFileHashedObjectPath, fileData);
		await this.updateStagingArea(fileToBeAdded, fileHash);
		console.log(`${fileToBeAdded} added successfully`);
	}

	// function to update the staging area
	async updateStagingArea(filePath, fileHash) {
		const index = JSON.parse(await fs.readFile(this.indexPath, "utf-8")); // read the index file

		index.push({ path: filePath, hash: fileHash }); // add the file to the index

		await fs.writeFile(this.indexPath, JSON.stringify(index)); // update the index file
	}

	// function to commit the changes
	async commit(message) {
		const index = JSON.parse(await fs.readFile(this.indexPath, "utf-8")); // read the index file
		const parentCommit = await this.getCurrentHead(); // get the parent commit

		const commitData = {
			timeStamp: new Date().toISOString(),
			message,
			files: index,
			parent: parentCommit,
		};

		const commitHash = this.hashObject(JSON.stringify(commitData)); // hash the commit data

		const commitPath = path.join(this.objectsPath, commitHash); // .tweak/objects/abc123

		await fs.writeFile(commitPath, JSON.stringify(commitData)); // write the commit data to the file

		await fs.writeFile(this.headPath, commitHash); // update the HEAD file with the new commit hash

		await fs.writeFile(this.indexPath, JSON.stringify([])); // clear the staging area

		console.log(`Commit ${commitHash} created successfully`);
	}

	// function to get the current commit hash
	async getCurrentHead() {
		try {
			return await fs.readFile(this.headPath, "utf-8");
		} catch (error) {
			return null;
		}
	}

	// function to log the commit history
	async log() {
		let currentCommitHash = await this.getCurrentHead();
		while (currentCommitHash) {
			const commitData = await this.getCommitData(currentCommitHash);
			console.log("-------------------------------------");
			console.log(`Commit: ${currentCommitHash}`);
			console.log(`Date: ${commitData.timeStamp}`);
			console.log(`Message: ${commitData.message}`);

			currentCommitHash = commitData.parent;
		}
	}

	async showCommitDiff(commitHash) {
		const commitData = await this.getCommitData(commitHash);
		if (!commitData) {
			console.log("Commit not found");
			return;
		}
		for (const file of commitData.files) {
			console.log(`File : ${file.path}`);
			const fileContent = await this.getFileContent(file.hash);
			if (commitData.parent) {
				const parentCommitData = await this.getCommitData(commitData.parent);
				const parentFileContent = await this.getParentFileContent(
					parentCommitData,
					file.path
				);
				if (parentFileContent !== undefined) {
					console.log("\nDiff:");
					const diff = diffLines(parentFileContent, fileContent);
					diff.forEach((part) => {
						if (part.added) {
							process.stdout.write(chalk.green("++" + part.value));
						} else if (part.removed) {
							process.stdout.write(chalk.red("--" + part.value));
							console.log("");
						} else {
							process.stdout.write(chalk.grey(part.value));
						}
					});
				} else {
					console.log("This is a new file in this commit");
				}
			} else {
				console.log("This is the first commit");
			}
		}
	}
	async getCommitData(currentCommitHash) {
		const commitPath = path.join(this.objectsPath, currentCommitHash);
		try {
			const commitData = JSON.parse(await fs.readFile(commitPath), "utf-8");
			return commitData;
		} catch (error) {
			console.log("Failed to read commit data", error);
			return null;
		}
	}

	async getFileContent(fileHash) {
		const hashedFilePath = path.join(this.objectsPath, fileHash);
		return await fs.readFile(hashedFilePath, "utf-8");
	}
	async getParentFileContent(parentCommitData, filePath) {
		const parentFile = parentCommitData.files.find(
			(file) => file.path === filePath
		);
		if (parentFile) {
			return await this.getFileContent(parentFile.hash);
		}
	}
}

program.command("init").action(async () => {
	const tweak = new Tweak();
});

program.command("add <file>").action(async (file) => {
	const tweak = new Tweak();
	await tweak.add(file);
});

program.command("commit <message>").action(async (message) => {
	const tweak = new Tweak();
	await tweak.commit(message);
});

program.command("log").action(async () => {
	const tweak = new Tweak();
	await tweak.log();
});

program.command("show <commit>").action(async (commit) => {
	const tweak = new Tweak();
	await tweak.showCommitDiff(commit);
});

program.parse(process.argv);
