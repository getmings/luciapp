'use strict';
'require view';
'require form';
'require uci';
'require rpc';

var callService = rpc.declare({
	object: 'rc',
	method: 'init',
	params: [ 'name', 'action' ],
	expect: { result: false }
});

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { '': {} }
});

/* 由后端 /usr/libexec/rpcd/luci.homebox 提供：{ installed, running, version } */
var callHomeboxStatus = rpc.declare({
	object: 'luci.homebox',
	method: 'status',
	expect: { '': {} }
});

function label(cls, text) {
	return '<span class="label ' + cls + '">' + text + '</span>';
}

return view.extend({
	load: function() {
		return Promise.all([
			uci.load('homebox'),
			callServiceList('homebox').catch(function() { return {}; }),
			callHomeboxStatus().catch(function() { return {}; })
		]);
	},

	isRunning: function(res) {
		return !!(
			res &&
			res.homebox &&
			res.homebox.instances &&
			Object.keys(res.homebox.instances).length
		);
	},

	runningHtml: function(running) {
		return label(running ? 'success' : 'warning',
			running ? _('运行中') : _('已停止'));
	},

	refreshStatus: function() {
		var self = this;

		return callServiceList('homebox').catch(function() {
			return {};
		}).then(function(res) {
			var el = document.querySelector(
				'.cbi-value[data-name="_status"] .cbi-value-field');

			if (el)
				el.innerHTML = self.runningHtml(self.isRunning(res));
		});
	},

	render: function(data) {
		var self = this;
		var m, s, o;
		var running = this.isRunning(data[1]);
		var info = data[2] || {};
		var binaryInstalled = !!info.installed;
		var binaryVersion = info.version || '';

		m = new form.Map(
			'homebox',
			_('HomeBox'),
			_('家庭局域网测速工具。')
		);

		s = m.section(
			form.NamedSection,
			'config',
			'homebox',
			_('HomeBox 服务')
		);

		o = s.option(form.DummyValue, '_status', _('状态'));
		o.rawhtml = true;
		o.cfgvalue = function() {
			return self.runningHtml(running);
		};

		o = s.option(form.DummyValue, '_binary', _('homebox 二进制'));
		o.rawhtml = true;
		o.cfgvalue = function() {
			var status = binaryInstalled
				? label('success', _('已安装'))
				: label('warning', _('未安装'));

			return status + ' <code>/usr/bin/homebox</code>';
		};

		o = s.option(form.DummyValue, '_version', _('版本'));
		o.rawhtml = true;
		o.cfgvalue = function() {
			var known = binaryInstalled && binaryVersion !== '';

			return label(known ? 'success' : 'warning',
				known ? binaryVersion : _('未知'));
		};

		o = s.option(form.Flag, 'enabled', _('服务控制 (点击开启/关闭)'));
		o.rmempty = false;

		o = s.option(form.Value, 'port', _('端口'));
		o.datatype = 'port';
		o.default = '3300';
		o.rmempty = false;

		o = s.option(form.DummyValue, '_open', _('HomeBox 网页'));
		o.rawhtml = true;
		o.cfgvalue = function() {
			var port = uci.get('homebox', 'config', 'port') || '3300';
			var host = window.location.hostname;

			return E('a', {
				'class': 'btn cbi-button cbi-button-action',
				'href': 'http://' + host + ':' + port,
				'target': '_blank'
			}, _('打开 HomeBox 网页'));
		};

		return m.render();
	},

	/* 保存并应用后，重载服务并刷新状态标签 */
	handleSaveApply: function(ev) {
		var self = this;

		return this.super('handleSaveApply', [ ev ]).then(function() {
			return callService('homebox', 'reload');
		}).then(function() {
			window.setTimeout(function() { self.refreshStatus(); }, 1500);
		});
	},

	handleSave: function(ev) {
		return this.super('handleSave', [ ev ]);
	}
});
