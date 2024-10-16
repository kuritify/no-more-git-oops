const {setGitHubRulesetActionToPlop} = require('../src/index');
const path = require('path');

module.exports = function (plop) {
  setGitHubRulesetActionToPlop('github-rulesets', plop);

  plop.setGenerator('user-custom', {
    prompts: [
      {
        type: 'input',
        name: 'repository',
      },
      {
        type: 'password',
        name: 'bearerToken',
      }
    ],
    actions: [
      {
        type: 'github-rulesets',
        requestParamsTemleateDirs: [
          path.resolve(__dirname, 'github-rulesets-templates'),
        ],
        bearerToken: '{{bearerToken}}',
        repository: '{{repository}}',
        requiredApprovingReviewCount: 2,
        targetBranches: ['main'],
        requiredStaucCheks: ['ci', 'e2e']
      }
    ]
  });
};
