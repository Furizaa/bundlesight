const client = require('bundlesight-client');

function BundlesightPlugin(opts) {
  this.opts = {};
  if (opts.repository && typeof opts.repository === 'string') {
    this.opts.repository = opts.repository;
  }
  if (opts.branch && typeof opts.branch === 'string') {
    this.opts.branch = opts.branch;
  }
  if (opts.pullRequestUrl && typeof opts.pullRequestUrl === 'string') {
    this.opts.pullRequestUrl = opts.pullRequestUrl;
  }
  if (opts.collectorEndpoint && typeof opts.collectorEndpoint === 'string') {
    this.opts.collectorEndpoint = opts.collectorEndpoint;
  }
  this.__unsupported_collectBuild = opts.__unsupported_collectBuild;
}

BundlesightPlugin.prototype = {
  constructor: BundlesightPlugin,

  currentAssets: [],

  apply: function(compiler) {
    const self = this;
    const collectBuild = this.__unsupported_collectBuild || client.collectBuild;
    compiler.plugin('emit', async function(curCompiler, callback) {
      const stats = curCompiler.getStats().toJson();
      self.currentAssets = stats.assets.map(asset => {
        return {
          name: asset.name,
          size: asset.size,
        };
      });

      if (self.opts.repository && self.opts.branch) {
        const endpoint = self.opts.collectorEndpoint || 'https://buildsight-collector.now.sh/';
        try {
          const buildId = await collectBuild(endpoint, self.opts.repository, self.opts.branch, self.currentAssets);
          console.log(`BuildSight: Successfully collected build ${buildId}`);
        } catch (err) {
          console.log(`BuildSight: Could not collect build data using endpoint "${endpoint}". "${err}"`);
        }
      }
      callback();
    });
  },
};

module.exports = {
  BundlesightPlugin: BundlesightPlugin,
};
