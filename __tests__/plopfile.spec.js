const path = require('path');

describe('users plopfile', () => {
  it('cusom generator', async () => {
    const nodePlop = (await import('node-plop')).default;
    const plop = await nodePlop(path.resolve(__dirname, 'plopfile.js'), {
      destBasePath: './',
      force: false,
    });
    const setGitHubRuleSet = require('../src/set-github-ruleset');
    jest.mock('../src/set-github-ruleset', () => jest.fn(() => 'created'));

    const onSuccess = jest.fn();
    const onFailure = jest.fn();
    const onComment = jest.fn();
    const generator = plop.getGenerator('user-custom');
    const answers = await generator.runPrompts(['user-org/user-repo', 'ghe_user_token']);
    await generator.runActions(answers, { onSuccess, onFailure, onComment });

    const first = setGitHubRuleSet.mock.calls[0];
    expect(first[0]).toBe('ghe_user_token');
    expect(first[1]).toBe('user-org');
    expect(first[2]).toBe('user-repo');
    expect(first[3]).toEqual({
      'name': 'users-custom',
      'target': 'branch',
      'source_type': 'Repository',
      'source': 'user-org/user-repo',
      'enforcement': 'active',
      'conditions': {
        'ref_name': {
          'exclude': [],
          'include': [
            'refs/heads/main'
          ]
        }
      },
      'rules': [
        {
          'type': 'pull_request',
          'parameters': {
            'required_approving_review_count': 2,
            'dismiss_stale_reviews_on_push': true
          }
        },
        {
          'type': 'required_status_checks',
          'parameters': {
            'strict_required_status_checks_policy': true,
            'do_not_enforce_on_create': true,
            'required_status_checks': [
              {
                'context': 'ci'
              },
              {
                'context': 'e2e'
              }

            ]
          }
        },
      ],
      'bypass_actors': []
    });

    expect(first[4]).toEqual({
      gitHubApiBaseUrl: 'https://api.github.com',
      doConfirmForChange: false,
    });
    expect(onSuccess).toBeCalled();
    expect(onSuccess).toBeCalledWith({'path': 'users-custom - created', 'type': 'github-rulesets'});
    expect(onFailure).not.toBeCalled();
  });
});
