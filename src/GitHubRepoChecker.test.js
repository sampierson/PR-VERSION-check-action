const ghrc = require('./GitHubRepoChecker')
const GitHubRepoChecker = ghrc.GitHubRepoChecker;
const PullRequestError = ghrc.PullRequestError;

const repoOwner = 'sampierson';
const repo = 'PR-VERSION-check-action';
const prWithNoVersionFileChange = '5';
const prWithConflictingVersionFile = '6';
const prWithNonconflictingVersionFile = '7';
const token = process.env.GITHUB_ACCESS_TOKEN;

describe('GitHubRepoChecker', () => {
  describe('.checkPullRequestVersionFiles', () => {

    describe('when give a pull request that does not exist', () => {
      beforeEach(() => {
        this.prNumber = 'NOT-A-PR-NUMBER';
      });
      test('it throws', async () => {
        const ghrc = new GitHubRepoChecker(repoOwner, repo, token);
        await expect(
          ghrc.checkPullRequestVersionFiles(this.prNumber)
        ).rejects.toThrow("Not Found");
      })
    })

    describe('when the PR does not have any changed VERSION files', () => {
      test('it throws PullRequestError', async () => {
        const ghrc = new GitHubRepoChecker(repoOwner, repo, token);
        await expect(
          ghrc.checkPullRequestVersionFiles(prWithNoVersionFileChange)
        ).rejects.toThrow(new PullRequestError(
          `No VERSION file changed in ${repoOwner}/${repo} Pull Request #${prWithNoVersionFileChange}`));
      })
    })

    describe('when the PR has a changed VERSION file that conflicts', () => {
      test('it throws PullRequestError', async () => {
        const ghrc = new GitHubRepoChecker(repoOwner, repo, token);
        await expect(
          ghrc.checkPullRequestVersionFiles(prWithConflictingVersionFile)
        ).rejects.toThrow(new PullRequestError(
          'PR change of file "VERSION" conflicts with trunk contents:' +
          ' "!!! DO NOT UPDATE THIS FILE - IT IS ONLY USED AS A TEST FIXTURE !!!\n1.0.1"'));
      })
    })

    describe('when the PR has a changed VERSION file that does not conflict', () => {
      test('it does not throw', async () => {
        const ghrc = new GitHubRepoChecker(repoOwner, repo, token);
        expect(await ghrc.checkPullRequestVersionFiles(prWithNonconflictingVersionFile)).toBeTruthy();
      })
    })
  })
})
