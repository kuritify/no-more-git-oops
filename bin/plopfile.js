const {setGitHubRulesetsGeneratorToPlop} = require('../src/index');

module.exports = async function (plop) {
  await setGitHubRulesetsGeneratorToPlop('github-rulesets-basic', 'github-rulesets-advanced', plop);
};
