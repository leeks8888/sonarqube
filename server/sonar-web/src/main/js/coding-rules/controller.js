define([
    'components/navigator/controller',
    'coding-rules/rule-details-view'
], function (Controller, RuleDetailsView) {

  var $ = jQuery;

  return Controller.extend({
    allFacets: ['languages', 'repositories', 'tags', 'qprofile', 'debt_characteristics', 'severities', 'statuses'],
    facetsFromServer: ['languages', 'repositories', 'tags'],
    pageSize: 200,
    ruleFields: ['name', 'lang', 'langName', 'sysTags', 'tags'],


    _searchParameters: function () {
      return {
        p: this.app.state.get('page'),
        ps: this.pageSize,
        facets: true,
        f: this.ruleFields.join()
      };
    },

    fetchList: function (firstPage) {
      firstPage = firstPage == null ? true : firstPage;
      if (firstPage) {
        this.app.state.set({ selectedIndex: 0, page: 1 }, { silent: true });
      }

      var that = this,
          url = baseUrl + '/api/rules/search',
          options = _.extend(this._searchParameters(), this.app.state.get('query')),
          p = window.process.addBackgroundProcess();
      return $.get(url, options).done(function (r) {
        var rules = that.app.list.parseRules(r);
        if (firstPage) {
          that.app.list.reset(rules);
        } else {
          that.app.list.add(rules);
        }
        that.app.list.setIndex();
        that.app.facets.reset(that._allFacets());
        that.app.facets.add(r.facets, { merge: true });
        that.enableFacets(that._enabledFacets());
        that.app.state.set({
          page: r.p,
          pageSize: r.ps,
          total: r.total,
          maxResultsReached: r.p * r.ps >= r.total
        });
        window.process.finishBackgroundProcess(p);
      }).fail(function () {
        window.process.failBackgroundProcess(p);
      });
    },

    requestFacet: function (id) {
      var url = baseUrl + '/api/rules/search',
          facet = this.app.facets.get(id),
          options = _.extend({ facets: true, ps: 1 }, this.app.state.get('query'));
      return $.get(url, options).done(function (r) {
        var facetData = _.findWhere(r.facets, { property: id });
        if (facetData) {
          facet.set(facetData);
        }
      });
    },

    parseQuery: function () {
      var q = Controller.prototype.parseQuery.apply(this, arguments);
      delete q.asc;
      delete q.s;
      return q;
    },

    getRuleDetails: function (rule) {
      var url = baseUrl + '/api/rules/show',
          options = {
            key: rule.id,
            actives: true
          };
      return $.get(url, options).done(function (data) {
        rule.set(data.rule);
      });
    },

    showDetails: function (rule) {
      var that = this;
      this.app.layout.workspaceDetailsRegion.reset();
      this.getRuleDetails(rule).done(function () {
        key.setScope('details');
        that.app.workspaceListView.unbindScrollEvents();
        that.app.state.set({ rule: rule });
        that.app.workspaceDetailsView = new RuleDetailsView({
          app: that.app,
          model: rule
        });
        that.app.layout.workspaceDetailsRegion.show(that.app.workspaceDetailsView);
        that.app.layout.showDetails();
      });
    },

    showDetailsForSelected: function () {
      var rule = this.app.list.at(this.app.state.get('selectedIndex'));
      this.showDetails(rule);
    },

    hideDetails: function () {
      key.setScope('list');
      this.app.state.unset('rule');
      this.app.layout.workspaceDetailsRegion.reset();
      this.app.layout.hideDetails();
      this.app.workspaceListView.bindScrollEvents();
      this.app.workspaceListView.scrollTo();
    }

  });

});
