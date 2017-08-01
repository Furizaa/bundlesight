const webpack = require('webpack');
const config = require('./testProject/webpack.config');
const BuildsightPlugin = require('./../index').BundlesightPlugin;

const collectBuild = jest.fn();

const createConfig = pluginConfig =>
  Object.assign({}, config, {
    plugins: [
      new BuildsightPlugin(
        Object.assign(
          {
            repository: '@@test/webpack-bundlesight-plugin',
            branch: 'master',
            __unsupported_collectBuild: collectBuild,
          },
          pluginConfig
        )
      ),
    ],
  });

const build = config =>
  new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      const errors = err || stats.hasErrors();
      if (errors) {
        return reject(errors);
      }
      resolve();
    });
  });

describe('plugin', () => {
  beforeEach(() => {
    spyOn(console, 'log');
  });

  it('sends bundle data to collector', async () => {
    expect.assertions(2);
    await build(createConfig(config));
    expect(collectBuild.mock.calls.length).toBe(1);
    expect(
      collectBuild
    ).toHaveBeenCalledWith('https://buildsight-collector.now.sh/', '@@test/webpack-bundlesight-plugin', 'master', [
      { name: '0.js', size: 113 },
      { name: 'main.js', size: 5871 },
    ]);
  });

  it('bundles without error', async () => {
    expect.assertions(1);
    collectBuild.mockImplementation(() => Promise.resolve('c8dfc070-75ef-11e7-9894-e3e104d7c004'));
    await build(createConfig(config));
    expect(console.log).toHaveBeenCalledWith(
      'BuildSight: Successfully collected build c8dfc070-75ef-11e7-9894-e3e104d7c004'
    );
  });

  it('handles errors gracefully', async () => {
    collectBuild.mockImplementation(() => Promise.reject('Error: Unexpected return code 404.'));
    await build(createConfig(config));
    expect(console.log).toHaveBeenCalledWith(
      'BuildSight: Could not collect build data using endpoint "https://buildsight-collector.now.sh/". "Error: Unexpected return code 404."'
    );
  });
});
