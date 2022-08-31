/*
 * @Author: 宋绍华
 * @Date: 2021-07-27 16:35:27
 * @LastEditTime: 2021-11-10 16:40:58
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\commitlint.config.js
 */
module.exports = {
  ignores: [(commit) => commit.includes("build")],
  extends: ["@commitlint/config-conventional"],
  parserPreset: {
    parserOpts: {
      headerPattern: /^(\w*|[\u4e00-\u9fa5]*)(?:[\(\（](.*)[\)\）])?[\:\：] (.*)/,
      headerCorrespondence: ["type", "scope", "subject"],
      referenceActions: ["close", "closes", "closed", "fix", "fixes", "fixed", "resolve", "resolves", "resolved", "merge"],
      issuePrefixes: ["#"],
      noteKeywords: ["BREAKING CHANGE"],
      fieldPattern: /^-(.*?)-$/,
      revertPattern: /^Revert\s"([\s\S]*)"\s*This reverts commit (\w*)\./,
      revertCorrespondence: ["header", "hash"],
      warn() {},
      mergePattern: null,
      mergeCorrespondence: null
    }
  },
  rules: {
    "body-leading-blank": [2, "always"],
    "footer-leading-blank": [1, "always"],
    "header-max-length": [2, "always", 108],
    "subject-empty": [2, "never"],
    "type-empty": [2, "never"],
    "type-enum": [2, "always", ["merge", "feat", "fix", "perf", "style", "docs", "test", "refactor", "build", "ci", "chore", "revert", "wip", "workflow", "types", "release", "build"]]
  }
};
