const fs = require('node:fs');
const path = require('node:path');
const getRemoteRepository = require('./get-remote-repository');
const setGitHubRuleSet = require('./set-github-ruleset');

/**
 * Register it to PLOP.js that recommende preset of GitHub rulesets basic, and with advancd
 *
 * @param {string} generatorNameBasic - The name of the basic generator.
 * @param {string} generatorNameAdvanced - The name of the advanced generator.
 * @param {object} plop - The Plop object used to define generators.
 * @returns {Promise<void>} A promise that resolves when the generators are set up.
 */
async function setGitHubRulesetsGeneratorToPlop(generatorNameBasic, generatorNameAdvanced, plop) {
  const customActionName = 'githubRulesets'

  setGitHubRulesetActionToPlop(customActionName, plop);

  // for prompt validation
  const nullValidation = (value) => {
    if (value) {
      return true;
    }
    return 'Please type any value'
  };

  const remote = await getRemoteRepository(plop.cwd);
  const commonPrompts = [
    {
      type: 'input',
      name: 'repository',
      default: remote ? `${remote.owner}/${remote.repo}` : null,
      message: 'target repistory (<owner>/<repo>)',
      validate: nullValidation,
    },
    {
      type: 'input',
      name: 'gitHubApiUrl',
      default: 'https://api.github.com',
      message: 'GitHub API Base URL',
      validate: nullValidation,
    },
    {
      type: 'password',
      name: 'bearerToken',
      mask: true,
      message: 'Bearar token to auth GitHub',
      validate: nullValidation,
    },
    {
      type: 'number',
      default: 2,
      name: 'requiredApprovingReviewCount',
      message: 'Required approving review count',
    },
    {
      type: 'input',
      name: 'branchesCommaSeparated',
      message: 'Target branches separated by comma (eg. main,develop,release/*)',
      validate: nullValidation,
     },
     {
       type: 'input',
       name: 'statusCheckCommaSeparated',
       message: 'Required status-check separated by comma (eg.ci,e2e)',
       validate: nullValidation,
     },
     {
        type: 'checkbox',
        name: 'bypassRoles',
        message: 'Roles that can be pushed. (Bypass role list)',
        choices: [
          {name: 'Admin', value: 5, checked: true},
          {name: 'Maintain', value: 2, checked: true},
          {name: 'Write', value: 4},
        ],
     }
  ]
  plop.setGenerator(generatorNameBasic, {
    description: 'setup GitHub branch rulesets',
    prompts: commonPrompts,
    actions: (data) => {

     return [{
        type: customActionName,
        requestParamsTemleateDirs: [
          path.resolve(__dirname, '..', 'githb-rulesets-templates', 'basic'),
        ],
        bearerToken: data.bearerToken,
        repository: data.repository,
        requiredApprovingReviewCount: data.requiredApprovingReviewCount,
        targetBranches: data.branchesCommaSeparated.split(',').map(each => each.trim()),
        requiredStaucCheks: data.statusCheckCommaSeparated.split(',').map(each => each.trim()),
        bypassRoles: data.bypassRoles,
        gitHubApiBaseUrl: data.gitHubApiUrl,
        appId: data.appId,
        doConfirmForChange: process.env.CONFIRM ? true : false,
      }];
    }
  });

  plop.setGenerator(generatorNameAdvanced, {
    description: 'setup GitHub branch and tag rulesets',
    prompts: [
      ...commonPrompts,
      {
        type: 'number',
        name: 'appId',
        message: 'GitHub App ID of Bot to create Git-tag',
        validate: nullValidation,
      }
    ],
    actions: (data) => {
      return [{
        type: customActionName,
        requestParamsTemleateDirs: [
          path.resolve(__dirname, '..', 'githb-rulesets-templates', 'basic'),
          path.resolve(__dirname, '..', 'githb-rulesets-templates', 'advanced'),
        ],
        bearerToken: data.bearerToken,
        repository: data.repository,
        requiredApprovingReviewCount: data.requiredApprovingReviewCount,
        targetBranches: data.branchesCommaSeparated.split(',').map(each => each.trim()),
        requiredStaucCheks: data.statusCheckCommaSeparated.split(',').map(each => each.trim()),
        bypassRoles: data.bypassRoles,
        gitHubApiBaseUrl: data.gitHubApiUrl,
        appId: data.appId,
        doConfirmForChange: process.env.CONFIRM ? true : false,
      }];
    }
  });

  //plop.setGenerator(generatorName, {
  //  description: "set GitHub rulesets",
  //  async prompts(inquirer) {
  //    console.log(chalk.gray("following article described this generator. (jpanees only)"));
  //    console.log("https://TBD\n");

  //    // welcome message
  //    let ret = {};

  //    // target repository and GitHub API URL
  //    const remote = await getRemoteRepository(plop.cwd);
  //    let doQuestionRepository = true;
  //    if (remote) {
  //      const confirm = await inquirer.prompt({
  //        type: "confirm",
  //        name: 'useRemote',
  //        message: `Is "${remote.owner}/${remote.repo}" to the target repository?`
  //      });
  //      if (confirm.useRemote) {
  //        doQuestionRepository = false
  //        ret.repository = `${remote.owner}/${remote.repo}`;
  //      }
  //      if (ret.origin !== 'github.com') {
  //        ret = {...ret, ...(await inquirer.prompt({
  //          type: "input",
  //          name: "gitHubApiUrl",
  //          default: "https://api.github.com/api/v3",
  //          message: "GitHub API Base URL",
  //          validate: nullValidation,
  //        }))};
  //      }
  //    }
  //    if (doQuestionRepository) {
  //      ret = {...ret, ...(await inquirer.prompt({
  //        type: "input",
  //        name: "repository",
  //        message: "target repistory (<owner>/<repo>)",
  //        validate: nullValidation,
  //      }))};
  //    }

  //    // mode
  //    ret = {...ret, ...(await inquirer.prompt({
  //      type: "list",
  //      name: "mode",
  //      message: "basic or basic with advanced ?",
  //      choices: ["basic", "advanced"],
  //    }))};

  //    if (ret.mode === 'advanced') {
  //       ret = {...ret, ...(await inquirer.prompt({
  //        type: "number",
  //        name: "appId",
  //        message: "Bot App ID fro tag creation",
  //      }))};
  //    }

  //    // bearerToken
  //    ret = {...ret, ...(await inquirer.prompt({
  //      type: "password",
  //      name: "bearerToken",
  //      message: "Bearar token to auth GitHub",
  //      validate: nullValidation,
  //    }))};

  //    // reviewCount
  //    ret = {...ret, ...(await inquirer.prompt({
  //      type: "number",
  //      default: 2,
  //      name: "requiredApprovingReviewCount",
  //      message: "Required approving review count",
  //    }))};

  //    // targetBranches
  //    ret = {...ret, ...(await inquirer.prompt({
  //      type: "input",
  //      name: "branchesCommaSeparated",
  //      message: "Target branches separated by comma (eg. main,develop,release/*)",
  //      validate: nullValidation,
  //    }))};

  //    // stach check name
  //    ret = {...ret, ...(await inquirer.prompt({
  //      type: "input",
  //      name: "statusCheckCommaSeparated",
  //      message: "Required status-check separated by comma (eg.ci,e2e)",
  //      validate: nullValidation,
  //    }))};

  //    // bypasable roles
  //    ret =  {...ret, ...(await inquirer.prompt({
  //      type: "checkbox",
  //      name: "bypassRoles",
  //      message: "Bypass role list",
  //      choices: [
  //        {name: "Admin", value: 2, checked: true},
  //        {name: "Maintain", value: 4, checked: true},
  //        {name: "Write", value: 5},
  //      ],
  //    }))};
  //    return ret;
  //  },
  //  actions: (data) => {
  //    const requestParamsTemleateDirs = [
  //      path.resolve(__dirname, '..', 'githb-rulesets-templates', 'basic'),
  //    ];

  //    if (data.mode === 'advanced') {
  //      requestParamsTemleateDirs.push(path.resolve(__dirname, 'githb-rulesets-templates', 'advanced'));
  //    }
  //    return [{
  //      type: customActionName,
  //      requestParamsTemleateDirs,
  //      bearerToken: data.bearerToken,
  //      repository: data.repository,
  //      requiredApprovingReviewCount: data.requiredApprovingReviewCount,
  //      targetBranches: data.branchesCommaSeparated.split(',').map(each => each.trim()),
  //      requiredStaucCheks: data.statusCheckCommaSeparated.split(',').map(each => each.trim()),
  //      bypassRoles: data.bypassRoles,
  //      gitHubApiBaseUrl: data.gitHubApiUrl,
  //      appId: data.appId,
  //      doConfirmForChange: false,
  //    }];
  //  }
  //});
}

/**
 * Register a custom action type in Plop for configuring GitHub rulesets.
 *
 * @param {string} actionTypeName - The name of the custom action type.
 * @param {object} plop - The Plop instance to which the action type will be added.
 */
async function setGitHubRulesetActionToPlop(actionTypeName, plop) {
  plop.setActionType(
    actionTypeName,
    async (answers, config, plopInAction) => {
      const [owner, repo] = plopInAction.renderString(config.repository, answers)
        .split('/')
        .map(each => each.trim());
      const setRules = [];
      for (const requestParamTemplateDir of config.requestParamsTemleateDirs) {
        for (const requestJsonFile of fs.readdirSync(requestParamTemplateDir)) {
          const requestParams = JSON.parse(
            plopInAction.renderString(
              fs.readFileSync(
                path.join(requestParamTemplateDir, requestJsonFile),
                'utf-8'
              ),
              {
                owner,
                repo,
                ...config,
                ...answers
              }
            )
          );
          const status = await setGitHubRuleSet(
            plopInAction.renderString(config.bearerToken, answers, config),
            owner,
            repo,
            requestParams,
            {
              gitHubApiBaseUrl: config.gitHubApiBaseUrl || 'https://api.github.com',
              doConfirmForChange: config.doConfirmForChange || false,
            }
          );
          setRules.push(`${requestParams.name} - ${status}`);
        }
      }
      return setRules.join('\n -> ');
    }
  );
}

module.exports = {
  setGitHubRulesetsGeneratorToPlop,
  setGitHubRulesetActionToPlop,
  setGitHubRuleSet,
};
