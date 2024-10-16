const {confirm} = require('@inquirer/prompts');
const {diffString, diff} = require('json-diff');
const chalk = require('chalk');

/**
 * Sets the GitHub ruleset for a specified repository.
 *
 * @param {string} bearerToken - The bearer token for authenticating with the GitHub API.
 * @param {string} owner - The owner of the repository.
 * @param {string} repo - The name of the repository.
 * @param {object} requetParams - The resuest parameters. please refer - https://docs.github.com/en/rest/repos/rules#create-a-repository-ruleset
 * @param {object=} option - The optional parameters. gitHubApiBaseUrl and doConfirmForChange.
 * @returns {Promise<string>} A promise return api result message, that resolves when the ruleset has been set.
 */
module.exports = async function setGitHubRuleSet(
  bearerToken,
  owner,
  repo,
  requestParams,
  option = {
    gitHubApiBaseUrl: 'https://api.github.com',
    doConfirmForChange: false,
  },
) {
  const {Octokit} = await import('octokit');

  const octokit = new Octokit({
    auth: bearerToken,
    baseUrl: option.gitHubApiBaseUrl,
  });

  const getRulesetsRet = await octokit.request(
    'GET /repos/{owner}/{repo}/rulesets',
    {
      owner,
      repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );

  const existRule = getRulesetsRet.data.find(
    ruleset => ruleset.name === requestParams.name
  );
  if (!requestParams.bypass_actors) {
    requestParams.bypass_actors = [];
  }
  requestParams.bypass_actors.sort((a, b) => a.actor_id - b.actor_id);
  if (!requestParams.conditions) {
    requestParams.conditions = {};
  }

  if (existRule) {
    const getRuleRet = await octokit.request(
      'GET /repos/{owner}/{repo}/rulesets/{ruleset_id}',
      {
        owner,
        repo,
        ruleset_id: existRule.id,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    const rulesForDiff = {
      name: getRuleRet.data.name,
      target: getRuleRet.data.target,
      enforcement: getRuleRet.data.enforcement,
      conditions: getRuleRet.data.conditions,
      rules: getRuleRet.data.rules,
      bypass_actors: getRuleRet.data.bypass_actors.sort((a, b) => a.actor_id - b.actor_id),
    };

    if (diff(rulesForDiff, requestParams)) {
      console.log(`"${requestParams.name}" rules has changed`);
      console.log(diffString(rulesForDiff, requestParams));

      if (option.doConfirmForChange) {
        const shouldContinue = await confirm({
          message: `Do you want to continut to update ${requestParams.name} rule?`,
        });

        if (!shouldContinue) {
          //console.log(`aborted ${requestParams.name}`);
          return `${chalk.red('Abort')}`;
        }
      }

      await octokit.request('PUT /repos/{owner}/{repo}/rulesets/{ruleset_id}', {
        owner,
        repo,
        ruleset_id: existRule.id,
        ...requestParams,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
      return `${chalk.yellow('Updated')}`;
    } else {
      return 'No change';
    }
  } else {
    await octokit.request('POST /repos/{owner}/{repo}/rulesets', {
      owner,
      repo,
      ...requestParams,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    return `${chalk.green('Created')}`;
  }
}
