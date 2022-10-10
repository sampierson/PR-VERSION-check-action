const github = require('@actions/github');
const axios = require('axios');
const path = require('path');

class PullRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = "PullRequestError";
  }
}

class GitHubRepoChecker {

  constructor(owner, repo, token, debug = false) {
    this.owner = owner;
    this.repo = repo;
    this.token = token;
    this.octokit = github.getOctokit(this.token);
    this.verbose = debug;
  }

  async checkPullRequestVersionFiles(prNumber) {
    let aVersionFileChanged = false;

    const changedFiles = await this.getFilesChangedInPullRequest(prNumber);
    for (const file of changedFiles) {
      this.debug(`File ${file.filename} changed`);
      if (path.basename(file.filename) === 'VERSION') {
        aVersionFileChanged = true;
        await this.versionFileConflicts(file);
      }
    }
    if (!aVersionFileChanged) {
      throw new PullRequestError(`No VERSION file changed in ${this.owner}/${this.repo} Pull Request #${prNumber}`);
    }
    return true;
  }

  async getFilesChangedInPullRequest(prNumber) {
    const { data: files } = await this.octokit.rest.pulls.listFiles({
      owner: this.owner,
      repo: this.repo,
      pull_number: prNumber
    });
    return files;
  }

  /*
   This VERSION file changed in the Pull Request.  Check that its new content does not match what is already on trunk.
   This would indicate that two people changed the same file, one has merged already, and we have a conflict.
   */
  async versionFileConflicts(file) {
    const fileContentInPr = await this.getPrFileContents(file);
    const fileContentInTrunk = await this.getTrunkFileContents(file);
    this.debug(`Comparing PR ${JSON.stringify(fileContentInPr)} with trunk ${JSON.stringify(fileContentInTrunk)}`);

    if (fileContentInPr.trim() === fileContentInTrunk.trim()) {
      throw new PullRequestError(`PR change of file "${file.filename}" conflicts with trunk contents: "${fileContentInPr.trim()}"`)
    }
  }

  async getPrFileContents(file) {
    const fileResponse = await axios.get(file.contents_url, {
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3.raw'
      }
    });
    return fileResponse.data;
  }

  async getTrunkFileContents(file) {
    const result = await this.octokit.rest.repos.getContent({
      owner: this.owner,
      repo: this.repo,
      path: file.filename,
      headers: { 'Accept': 'application/vnd.github.v3.raw' }
    })
    return result.data;
  }

  debug(message) {
    if (this.verbose) {
      console.log(message);
    }
  }
}

exports.PullRequestError = PullRequestError;
exports.GitHubRepoChecker = GitHubRepoChecker;
