
# Contribution Guide
___

Firstly, thanks for wanting to help with the development of DAOSTACK. All contributions, code or documents, should come from a forked version of the respective repository. Then the proposed changes must be submitted via a pull request to the master branch. All pull requests must be reviewed by the maintainers of the repository in question. Once a pull request has been reviewed & approved; you should merge and rebase, and then delete the branch.
GitHub [keywords](https://help.github.com/articles/closing-issues-using-keywords/) should be used when closing pull requests and issues.

If you wish to submit more substantial changes or additions, please see the feature contributions section below.


## Git Practice

Branches should be named with a brief semantic title.
Commit messages should be capitalised and follow these rules:
```
Short (50 chars or less) summary of changes

More detailed explanatory text, if necessary. Wrap it to about 72
characters or so. In some contexts, the first line is treated as the
subject of an email and the rest of the text as the body. The blank
line separating the summary from the body is critical (unless you omit
the body entirely); tools like rebase can get confused if you run the
two together.

Further paragraphs come after blank lines.

 - Bullet points are okay, too

 - Typically a hyphen or asterisk is used for the bullet, preceded by a
   single space, with blank lines in between, but conventions vary here

Issue: #1, #2
```
A properly formed Git commit subject line should always be able to complete the following sentence:

If applied, this commit will _Your subject line here_

**Please refer to [this guide](https://chris.beams.io/posts/git-commit/) for additional information.**


## Feature Contributions

For the submission of more substantial changes or additions, an issue should be opened outlining what is being proposed for implementation. The title of the issue should be descriptive and brief, follow the same rules as a commit message, as outlined above. The body of the issue should detail the reasoning for the need of the work to be carried out and the desired outcome.


## Code Formatting and Commentary

### Javascript
All Javascript must be formatted with [ESLint](http://eslint.org/) using the DAOSTACK [configuration](https://github.com/daostack/daostack/blob/master/.eslintrc.json).

### Solidity
All Solidity files must follow the style guide found [here](http://solidity.readthedocs.io/en/develop/style-guide.html).
All Solidity code must pass [solium](https://github.com/duaraghav8/Solium) linter check using DAOSTACK [configuration](https://github.com/daostack/daostack/blob/master/.soliumrc.json).
