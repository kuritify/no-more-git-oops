const path = require('path');

describe('setGitHubRulesetsGeneratorToPlop', () => {
  it('positive-case', async () => {
    const nodePlop = (await import('node-plop')).default;
    const plop = await nodePlop('', {
      destBasePath: './',
      force: false,
    });
    const setGitHubRuleSet = require('../set-github-ruleset');
    jest.mock('../set-github-ruleset', () => jest.fn(() => 'created'));

    const sut = require('../index');

    sut.setGitHubRulesetActionToPlop('github-rulesets', plop);

    const onSuccess = jest.fn();
    const onFailure = jest.fn();
    const onComment = jest.fn();

    plop.setGenerator('test', {
      prompts: [],
      actions: [
        {
          type: 'github-rulesets',
          requestParamsTemleateDirs: [path.join(__dirname, '..', '..', 'githb-rulesets-templates', 'basic')],
          bearerToken: 'ghe_dummy',
          repository: 'kuritify/dummy',
          requiredApprovingReviewCount: 3,
          targetBranches: ['main', 'develop', 'release/**'],
          requiredStaucCheks: ['ci', 'e2e', 'chaos'],
          bypassRoles: ['2', '4'],
        }
      ],
    });
    await plop.getGenerator('test').runActions({}, { onSuccess, onFailure, onComment });

    const first = setGitHubRuleSet.mock.calls[0];
    expect(first[0]).toBe('ghe_dummy');
    expect(first[1]).toBe('kuritify');
    expect(first[2]).toBe('dummy');
    expect(first[3]).toEqual({
      'name': 'branch-all-users-rules',
      'target': 'branch',
      'enforcement': 'active',
      'conditions': {
        'ref_name': {
          'exclude': [],
          'include': [
            'refs/heads/main',
            'refs/heads/develop',
            'refs/heads/release/**'
          ]
        }
      },
      'rules': [
        {
          'type': 'pull_request',
          'parameters': {
            'required_approving_review_count': 3,
            'dismiss_stale_reviews_on_push': true,
            'require_code_owner_review': true,
            'require_last_push_approval': true,
            'required_review_thread_resolution': true
          }
        },
        {
          'type': 'required_status_checks',
          'parameters': {
            'strict_required_status_checks_policy': true,
            'do_not_enforce_on_create': false,
            'required_status_checks': [
              {
                'context': 'ci'
              },
              {
                'context': 'e2e'
              },
              {
                'context': 'chaos'
              }
            ]
          }
        },
        {
          'type': 'required_linear_history'
        },
        {
          'type': 'non_fast_forward'
        },
        {
          'type': 'deletion'
        }
      ],
      'bypass_actors': []
    });

    expect(first[4]).toEqual({
      gitHubApiBaseUrl: 'https://api.github.com',
      doConfirmForChange: false,
    });
    const second = setGitHubRuleSet.mock.calls[1];
    expect(second[0]).toBe('ghe_dummy');
    expect(second[1]).toBe('kuritify');
    expect(second[2]).toBe('dummy');
    expect(second[3]).toEqual({
      'name': 'branch-exclude-core-contributors-rules',
      'target': 'branch',
      'enforcement': 'active',
      'conditions': {
        'ref_name': {
          'exclude': [],
          'include': [
            'refs/heads/main',
            'refs/heads/develop',
            'refs/heads/release/**'
          ]
        }
      },
      'rules': [
        {
          'type': 'update'
        }
      ],
      'bypass_actors': [
        {
          'actor_id': 2,
          'actor_type': 'RepositoryRole',
          'bypass_mode': 'always'
        },
        {
          'actor_id': 4,
          'actor_type': 'RepositoryRole',
          'bypass_mode': 'always'
        }
      ]
    });
    expect(second[4]).toEqual({
      gitHubApiBaseUrl: 'https://api.github.com',
      doConfirmForChange: false,
    });

    expect(onSuccess).toBeCalled();
    expect(onSuccess).toBeCalledWith({'path': 'branch-all-users-rules - created\n -> branch-exclude-core-contributors-rules - created', 'type': 'github-rulesets'});
    expect(onFailure).not.toBeCalled();

    // advanced
    sut.setGitHubRulesetActionToPlop('github-rulesets-2', plop);

    const onSuccess2 = jest.fn();
    const onFailure2 = jest.fn();
    const onComment2 = jest.fn();

    plop.setGenerator('test2', {
      prompts: [],
      actions: [
        {
          type: 'github-rulesets-2',
          requestParamsTemleateDirs: [path.join(__dirname, '..', '..', 'githb-rulesets-templates', 'advanced')],
          bearerToken: 'ghe_dummy2',
          repository: 'kuritify2/dummy2',
          appId: 99991,
          doConfirmForChange: true,
          gitHubApiBaseUrl: 'https://api.github-my-company.com/api/v3',
        }
      ],
    });
    await plop.getGenerator('test2').runActions({}, { onSuccess2, onFailure2, onComment2 });
    const third = setGitHubRuleSet.mock.calls[2];
    expect(third[0]).toBe('ghe_dummy2');
    expect(third[1]).toBe('kuritify2');
    expect(third[2]).toBe('dummy2');
    expect(third[3]).toEqual({
      'name': 'tag-allow-only-bot-rules',
      'target': 'tag',
      'enforcement': 'active',
      'conditions': {
        'ref_name': {
          'exclude': [],
          'include': [
            '~ALL'
          ]
        }
      },
      'rules': [
        {
          'type': 'deletion'
        },
        {
          'type': 'creation'
        },
        {
          'type': 'update'
        }
      ],
      'bypass_actors': [
        {
          'actor_id': 99991,
          'actor_type': 'Integration',
          'bypass_mode': 'always'
        }
      ]
    });
    expect(third[4]).toEqual({
      gitHubApiBaseUrl: 'https://api.github-my-company.com/api/v3',
      doConfirmForChange: true,
    });
  });
});
