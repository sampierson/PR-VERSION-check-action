# Pull Request VERSION Check GitHub Action

This action checks two things in Pull Requests:
1. That at least one file named `VERSION` was changed in the PR.
2. That the contents of any changed `VERSION` file were not changed to be identical to that of the same
   file on the trunk branch.  This would indicate that two people both created PRs that changed the `VERSION`
   to the same number, one has already merged their PR, and we now have a conflict situation.

## Usage

To perform this check on your repo when submitting PRs, create a file under `.github/workflows`,
e.g. `.github/workflows/PR-VERSION-check.yml`, with the following contents:
```yaml
name: Check PR VERSION file(s)
on: [pull_request]
jobs:
  PR-VERSION-check:
    runs-on: ubuntu-latest
    steps:
      - name: PR-VERSION-check
        id: pr-version-check
        uses: sampierson/PR-VERSION-check-action@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```

## Contributing

Check out this repo.

Install dependencies:

```bash
npm install
```

Make your modifications.

Lint your changes.

```bash
npm run lint
```

### Running Tests

These tests run against the live GitHub API.  There are three specially crafted PRs filed against this repo that are
used for testing purposes.  Note that the `VERSION` file in the repo serves no purpose other than for testing.
You must provide a GitHub Personal Access Token that can access this repo.  The repo is
actually public, so an access token with no scopes works fine.

```bash
export GITHUB_ACCESS_TOKEN='xxxxxxxxxxxxxxxxxxxxxxxxx'
```

Run the tests:

```bash
$ npm test
...
 PASS  src/GitHubRepoChecker.test.js
  GitHubRepoChecker
    .checkPullRequestVersionFiles
      when give a pull request that does not exist
        ✓ it throws (361 ms)
      when the PR does not have any changed VERSION files
        ✓ it throws PullRequestError (372 ms)
      when the PR has a changed VERSION file that conflicts
        ✓ it throws PullRequestError (1032 ms)
      when the PR has a changed VERSION file that does not conflict
        ✓ it does not throw (13 ms)
...
```

### Package for Distribution

Pick a new version, e.g. `v2`.
Update the version in the `uses:` line in section "Usage" above.
Package and release code on a new release branch:

```
git checkout -b v2
npm prepare
git add README.md dist
git commit -m "Package v2"
git push origin v2
```
