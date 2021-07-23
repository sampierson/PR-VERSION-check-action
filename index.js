const core = require('@actions/core');
const github = require('@actions/github');
const GitHubRepoChecker = require('./src/GitHubRepoChecker').GitHubRepoChecker;

async function run() {
  try {
    if (github.context.eventName !== 'pull_request') {
      core.setFailed('This action only works on pull requests');
      return;
    }

    const pullRequestNumber = github.context.payload.number;
    const token = core.getInput('token');

    const repoChecker = new GitHubRepoChecker(github.context.repo.owner, github.context.repo.repo, token);
    await repoChecker.checkPullRequestVersionFiles(pullRequestNumber);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
